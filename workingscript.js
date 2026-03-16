// ==UserScript==
// @name         TM Match Viewer
// @namespace    https://trophymanager.com
// @version      1.5.0
// @description  Enhanced match viewer with live replay, lineups, statistics, venue and H2H tabs
// @match        https://trophymanager.com/matches/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ─── Constants ───────────────────────────────────────────────────────
    const STORAGE_KEY = 'TM_LEAGUE_LINEUP_NUM_ROUNDS';
    const SHARE_BONUS = 0.25;
    const ROUTINE_CAP = 40.0;
    const POS_MULTIPLIERS = [0.3, 0.3, 0.9, 0.6, 1.5, 0.9, 0.9, 0.6, 0.3];

    const DEF_POSITIONS = new Set(['gk', 'dl', 'dr', 'dc', 'dcl', 'dcr']);
    const MID_POSITIONS = new Set(['dml', 'dmr', 'dmc', 'dmcl', 'dmcr', 'ml', 'mr', 'mc', 'mcl', 'mcr']);

    const COLOR_LEVELS = [
        { color: '#ff4c4c' }, { color: '#ff8c00' }, { color: '#ffd700' },
        { color: '#90ee90' }, { color: '#00cfcf' }, { color: '#5b9bff' }, { color: '#cc88ff' }
    ];

    const REC_THRESHOLDS = [5.5, 5, 4, 3, 2, 1, 0];
    const R5_THRESHOLDS = [110, 100, 90, 80, 70, 60, 0];
    const AGE_THRESHOLDS = [30, 28, 26, 24, 22, 20, 0];

    // ─── Weight tables ───────────────────────────────────────────────────
    //              Str         Sta         Pac         Mar         Tac         Wor         Pos         Pas         Cro         Tec         Hea         Fin         Lon         Set
    const WEIGHT_R5 = [
        [0.41029304, 0.18048062, 0.56730138, 1.06344654, 1.02312672, 0.40831256, 0.58235457, 0.12717479, 0.05454137, 0.09089830, 0.42381693, 0.04626272, 0.02199046, 0], // DC
        [0.42126371, 0.18293193, 0.60567629, 0.91904794, 0.89070915, 0.40038476, 0.56146633, 0.15053902, 0.15955429, 0.15682932, 0.42109742, 0.09460329, 0.03589655, 0], // DL/R
        [0.23412419, 0.32032289, 0.62194779, 0.63162534, 0.63143081, 0.45218831, 0.47370658, 0.55054737, 0.17744915, 0.39932519, 0.26915814, 0.16413124, 0.07404301, 0], // DMC
        [0.27276905, 0.26814289, 0.61104798, 0.39865092, 0.42862643, 0.43582015, 0.46617076, 0.44931076, 0.25175412, 0.46446692, 0.29986350, 0.43843061, 0.21494592, 0], // DML/R
        [0.25219260, 0.25112993, 0.56090649, 0.18230261, 0.18376490, 0.45928749, 0.53498118, 0.59461481, 0.09851189, 0.61601950, 0.31243959, 0.65402884, 0.29982016, 0], // MC
        [0.28155678, 0.24090675, 0.60680245, 0.19068879, 0.20018012, 0.45148647, 0.48230007, 0.42982389, 0.26268609, 0.57933805, 0.31712419, 0.65824985, 0.29885649, 0], // ML/R
        [0.22029884, 0.29229690, 0.63248227, 0.09904394, 0.10043602, 0.47469498, 0.52919791, 0.77555880, 0.10531819, 0.71048302, 0.27667115, 0.56813972, 0.21537826, 0], // OMC
        [0.21151292, 0.35804710, 0.88688492, 0.14391236, 0.13769621, 0.46586605, 0.34446036, 0.51377701, 0.59723919, 0.75126119, 0.16550722, 0.29966502, 0.12417045, 0], // OML/R
        [0.35479780, 0.14887553, 0.43273380, 0.00023928, 0.00021111, 0.46931131, 0.57731335, 0.41686333, 0.05607604, 0.62121195, 0.45370457, 1.03660702, 0.43205492, 0], // F
        [0.45462811, 0.30278232, 0.45462811, 0.90925623, 0.45462811, 0.90925623, 0.45462811, 0.45462811, 0.30278232, 0.15139116, 0.15139116]  // GK
    ];

    //              Str         Sta         Pac         Mar         Tac         Wor         Pos         Pas         Cro         Tec         Hea         Fin         Lon         Set
    const WEIGHT_RB = [
        [0.10493615, 0.05208547, 0.07934211, 0.14448971, 0.13159554, 0.06553072, 0.07778375, 0.06669303, 0.05158306, 0.02753168, 0.12055170, 0.01350989, 0.02549169, 0.03887550], // DC
        [0.07715535, 0.04943315, 0.11627229, 0.11638685, 0.12893778, 0.07747251, 0.06370799, 0.03830611, 0.10361093, 0.06253997, 0.09128094, 0.01314110, 0.02449199, 0.03726305], // DL/R
        [0.08219824, 0.08668831, 0.07434242, 0.09661001, 0.08894242, 0.08998026, 0.09281287, 0.08868309, 0.04753574, 0.06042619, 0.05396986, 0.05059984, 0.05660203, 0.03060871], // DMC
        [0.06744248, 0.06641401, 0.09977251, 0.08253749, 0.09709316, 0.09241026, 0.08513703, 0.06127851, 0.10275520, 0.07985941, 0.04618960, 0.03927270, 0.05285911, 0.02697852], // DML/R
        [0.07304213, 0.08174111, 0.07248656, 0.08482334, 0.07078726, 0.09568392, 0.09464529, 0.09580381, 0.04746231, 0.07093008, 0.04595281, 0.05955544, 0.07161249, 0.03547345], // MC
        [0.06527363, 0.06410270, 0.09701305, 0.07406706, 0.08563595, 0.09648566, 0.08651209, 0.06357183, 0.10819222, 0.07386495, 0.03245554, 0.05430668, 0.06572005, 0.03279859], // ML/R
        [0.07842736, 0.07744888, 0.07201150, 0.06734457, 0.05002348, 0.08350204, 0.08207655, 0.11181914, 0.03756112, 0.07486004, 0.06533972, 0.07457344, 0.09781475, 0.02719742], // OMC
        [0.06545375, 0.06145378, 0.10503536, 0.06421508, 0.07627526, 0.09232981, 0.07763931, 0.07001035, 0.11307331, 0.07298351, 0.04248486, 0.06462713, 0.07038293, 0.02403557], // OML/R
        [0.07738289, 0.05022488, 0.07790481, 0.01356516, 0.01038191, 0.06495444, 0.07721954, 0.07701905, 0.02680715, 0.07759692, 0.12701687, 0.15378395, 0.12808992, 0.03805251], // F
        [0.07466384, 0.07466384, 0.07466384, 0.14932769, 0.10452938, 0.14932769, 0.10452938, 0.10344411, 0.07512610, 0.04492581, 0.04479831]  // GK
    ];

    // ─── Utility helpers ─────────────────────────────────────────────────
    const fix2 = v => (Math.round(v * 100) / 100).toFixed(2);

    const parseNum = str => Number(String(str).replace(/,/g, ''));

    const getColor = (value, thresholds) => {
        for (let i = 0; i < thresholds.length; i++) {
            if (value >= thresholds[i]) return COLOR_LEVELS[i].color;
        }
        return COLOR_LEVELS[COLOR_LEVELS.length - 1].color;
    };

    const getPositionIndex = pos => {
        switch (pos.toLowerCase()) {
            case 'gk': return 9;
            case 'dc': case 'dcl': case 'dcr': return 0;
            case 'dr': case 'dl': return 1;
            case 'dmc': case 'dmcl': case 'dmcr': return 2;
            case 'dmr': case 'dml': return 3;
            case 'mc': case 'mcl': case 'mcr': return 4;
            case 'mr': case 'ml': return 5;
            case 'omc': case 'omcl': case 'omcr': return 6;
            case 'omr': case 'oml': return 7;
            case 'fc': case 'fcl': case 'fcr': case 'f': return 8;
            default: return 0;
        }
    };

    const classifyPosition = pos => {
        if (DEF_POSITIONS.has(pos)) return 'D';
        if (MID_POSITIONS.has(pos)) return 'M';
        return 'F';
    };

    // ─── Rating calculations ─────────────────────────────────────────────
    const calculateRemainders = (posIdx, skills, asi) => {
        const weight = posIdx === 9 ? 48717927500 : 263533760000;
        const skillSum = skills.reduce((sum, s) => sum + parseInt(s), 0);
        const remainder = Math.round((Math.pow(2, Math.log(weight * asi) / Math.log(Math.pow(2, 7))) - skillSum) * 10) / 10;

        let rec = 0, ratingR = 0, remainderW1 = 0, remainderW2 = 0, not20 = 0;

        for (let i = 0; i < WEIGHT_RB[posIdx].length; i++) {
            rec += skills[i] * WEIGHT_RB[posIdx][i];
            ratingR += skills[i] * WEIGHT_R5[posIdx][i];
            if (skills[i] != 20) {
                remainderW1 += WEIGHT_RB[posIdx][i];
                remainderW2 += WEIGHT_R5[posIdx][i];
                not20++;
            }
        }

        if (remainder / not20 > 0.9 || !not20) {
            not20 = posIdx === 9 ? 11 : 14;
            remainderW1 = 1;
            remainderW2 = 5;
        }

        rec = fix2((rec + remainder * remainderW1 / not20 - 2) / 3);
        return { remainder, remainderW2, not20, ratingR, rec };
    };

    const calculateBaseR5 = (posIdx, skills, asi, rou) => {
        const r = calculateRemainders(posIdx, skills, asi);
        const routineBonus = (3 / 100) * (100 - 100 * Math.pow(Math.E, -rou * 0.035));
        const ratingR = r.ratingR + (r.remainder * r.remainderW2 / r.not20);
        return Number(fix2(ratingR + routineBonus * 5));
    };

    const calculateR5 = (posIdx, skills, asi, rou) => {
        let rating = calculateBaseR5(posIdx, skills, asi, rou);
        const rou2 = (3 / 100) * (100 - 100 * Math.pow(Math.E, -rou * 0.035));
        const r = calculateRemainders(posIdx, skills, asi);
        const { pow, E } = Math;

        // Build skill+remainder array
        const goldstar = skills.filter(s => s == 20).length;
        const skillsB = skills.map(s => s == 20 ? 20 : s * 1 + r.remainder / (skills.length - goldstar));

        // Apply routine to all except stamina (index 1)
        const sr = skillsB.map((s, i) => i === 1 ? s : s + rou2);

        if (skills.length !== 11) {
            const headerBonus = sr[10] > 12
                ? fix2((pow(E, (sr[10] - 10) ** 3 / 1584.77) - 1) * 0.8 +
                    pow(E, sr[0] ** 2 * 0.007 / 8.73021) * 0.15 +
                    pow(E, sr[6] ** 2 * 0.007 / 8.73021) * 0.05)
                : 0;
            const fkBonus = fix2(pow(E, (sr[13] + sr[12] + sr[9] * 0.5) ** 2 * 0.002) / 327.92526);
            const ckBonus = fix2(pow(E, (sr[13] + sr[8] + sr[9] * 0.5) ** 2 * 0.002) / 983.65770);
            const pkBonus = fix2(pow(E, (sr[13] + sr[11] + sr[9] * 0.5) ** 2 * 0.002) / 1967.31409);
            const allBonus = headerBonus * 1 + fkBonus * 1 + ckBonus * 1 + pkBonus * 1;

            const defSkillsSq = sr[0] ** 2 + sr[1] ** 2 * 0.5 + sr[2] ** 2 * 0.5 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
            const gainBase = fix2(defSkillsSq / 6 / 22.9 ** 2);
            const offSkillsSq = sr[0] ** 2 * 0.5 + sr[1] ** 2 * 0.5 + sr[2] ** 2 + sr[3] ** 2 + sr[4] ** 2 + sr[5] ** 2 + sr[6] ** 2;
            const keepBase = fix2(offSkillsSq / 6 / 22.9 ** 2);

            const m = POS_MULTIPLIERS[posIdx];
            return fix2(rating + allBonus + gainBase * m * 1 + keepBase * m * 1);
        }

        return fix2(rating);
    };

    // ─── Skill extraction from tooltip ───────────────────────────────────
    const extractSkills = (player, posIdx) => {
        const checkSkills = player.skills.filter(s => s.value);
        let skills;

        if (posIdx === 9) {
            // GK: Str, Pac, Jum, Sta, One, Ref, Aer, Com, Kic, Thr, Han (reordered)
            skills = [0, 2, 4, 1, 3, 5, 6, 7, 8, 9, 10].map(i => checkSkills[i].value);
        } else {
            // Field: even indices first, then odd (matches tooltip layout)
            skills = [];
            for (let i = 0; i <= checkSkills.length; i += 2) {
                if (checkSkills[i]) skills.push(checkSkills[i].value);
            }
            for (let i = 1; i <= checkSkills.length; i += 2) {
                if (checkSkills[i]) skills.push(checkSkills[i].value);
            }
        }

        // Convert silver/gold star strings to numbers
        return skills.map(s => {
            if (typeof s !== 'string') return s;
            return (s.includes('silver') || s.includes('19')) ? 19 : 20;
        });
    };

    // ─── Player data fetching (with Promise-based cache) ─────────────────
    const tooltipCache = new Map();

    const fetchTooltip = playerId => {
        const pid = String(playerId);
        if (!tooltipCache.has(pid)) {
            tooltipCache.set(pid, new Promise((resolve, reject) => {
                $.post('/ajax/tooltip.ajax.php', { player_id: playerId })
                    .done(res => resolve(JSON.parse(res)))
                    .fail(reject);
            }));
        }
        return tooltipCache.get(pid);
    };

    const getPlayerData = (playerId, routineMap, positionMap) => {
        return fetchTooltip(playerId).then(rawData => {
            // Deep clone to avoid modifying cached data
            const player = JSON.parse(JSON.stringify(rawData.player));

            // Apply match-specific overrides
            if (routineMap.has(playerId)) player.routine = String(routineMap.get(playerId));
            if (positionMap.has(playerId)) player.favposition = positionMap.get(playerId);

            const asi = parseNum(player.skill_index);
            const xp = parseNum(player.routine);
            const positions = player.favposition.split(',');
            const posIdx = getPositionIndex(positions[0]);
            const skills = extractSkills(player, posIdx);

            let r5 = Number(calculateR5(posIdx, skills, asi, xp));
            let rec = Number(calculateRemainders(posIdx, skills, asi).rec);

            // Dual position — take the better rating
            if (positions.length > 1) {
                const posIdx2 = getPositionIndex(positions[1]);
                if (posIdx2 !== posIdx) {
                    const r5_2 = Number(calculateR5(posIdx2, skills, asi, xp));
                    const rec_2 = Number(calculateRemainders(posIdx2, skills, asi).rec);
                    if (r5_2 > r5) r5 = r5_2;
                    if (rec_2 > rec) rec = rec_2;
                }
            }

            return {
                Age: Number(player.age) * 12 + Number(player.months),
                REC: rec,
                R5: r5
            };
        });
    };

    // ─── Routine sharing logic ───────────────────────────────────────────
    const applyRoutineSharing = (group, routineMap) => {
        if (group.length <= 1) return;
        group.sort((a, b) => a.ROU - b.ROU);

        const min = group[0].ROU;
        if (min >= ROUTINE_CAP) return;

        const max = group[group.length - 1].ROU;
        const min2 = group[1].ROU;
        let newRoutine = Math.min(min + max * SHARE_BONUS, min2, ROUTINE_CAP);
        routineMap.set(group[0].ID, parseFloat(newRoutine.toFixed(1)));
    };

    // ─── Team statistics (sum of 11 starters) ───────────────────────────
    const computeTeamStats = (playerIds, lineup, routineMap, positionMap) => {
        const starters = playerIds.filter(id => !lineup[id].position.includes('sub'));
        const promises = starters.map(id => getPlayerData(id, routineMap, positionMap));

        return Promise.all(promises).then(players => {
            const totals = { Age: 0, REC: 0, R5: 0 };
            players.forEach(p => {
                totals.Age += p.Age;
                totals.REC += p.REC;
                totals.R5 += p.R5;
            });
            return totals;
        });
    };

    // ─── Match processing ────────────────────────────────────────────────
    const classifyLineup = (playerIds, lineup, routineMap, positionMap) => {
        const groups = { D: [], M: [], F: [] };
        playerIds.forEach(id => {
            const pos = lineup[id].position;
            if (pos.includes('sub')) return;
            const rou = Number(lineup[id].routine);
            positionMap.set(id, pos);
            routineMap.set(id, rou);
            groups[classifyPosition(pos)].push({ ID: id, ROLE: pos, ROU: rou });
        });
        return groups;
    };

    const isMatchPage = true;

    const injectStyles = () => {
        if (document.getElementById('tsa-match-style')) return;
        const style = document.createElement('style');
        style.id = 'tsa-match-style';
        style.textContent = `
            /* ── Match Dialog ── */
            .rnd-overlay {
                position: fixed; top:0; left:0; right:0; bottom:0;
                background: rgba(0,0,0,0.65);
                z-index: 10000;
                display: flex; align-items: center; justify-content: center;
            }
            .rnd-dialog {
                background: #1c3410; border: none;
                border-radius: 0; width: 100vw; height: 100vh;
                overflow: hidden; display: flex; flex-direction: column;
            }
            .rnd-dlg-head {
                background: linear-gradient(180deg, #162e0e 0%, #1c3a14 50%, #152c0d 100%);
                padding: 14px 16px 8px;
                position: relative;
                border-bottom: 2px solid rgba(80,160,48,.2);
                overflow: visible; z-index: 2;
            }
            .rnd-dlg-head-content {
                display: flex; flex-direction: column; align-items: center;
            }
            .rnd-dlg-head-row {
                display: flex; align-items: center;
                justify-content: center; width: 100%;
            }
            .rnd-dlg-team-group {
                display: flex; align-items: center; gap: 10px;
                flex: 1; min-width: 0;
            }
            .rnd-dlg-team-group.home { justify-content: flex-end; }
            .rnd-dlg-team-group.away { justify-content: flex-start; }
            .rnd-dlg-team-info {
                display: flex; flex-direction: column; gap: 3px; min-width: 0;
            }
            .rnd-dlg-team-group.home .rnd-dlg-team-info { align-items: flex-end; }
            .rnd-dlg-team-group.away .rnd-dlg-team-info { align-items: flex-start; }
            .rnd-dlg-team {
                color: #eaf6dc; font-weight: 700; font-size: 14px;
                letter-spacing: 0.3px; line-height: 1.2;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 200px;
            }
            .rnd-dlg-chips {
                display: flex; gap: 3px; flex-wrap: wrap;
            }
            .rnd-dlg-team-group.home .rnd-dlg-chips { justify-content: flex-end; }
            .rnd-dlg-chip {
                font-size: 8.5px; font-weight: 600; color: #8cb878;
                background: rgba(0,0,0,.35); padding: 1px 5px;
                border-radius: 4px; white-space: nowrap;
                letter-spacing: 0.2px; line-height: 1.4;
                border: 1px solid rgba(255,255,255,.04);
            }
            .rnd-dlg-chip .chip-val { color: #c8e4b0; font-weight: 700; }
            .rnd-dlg-score-block {
                display: flex; flex-direction: column; align-items: center;
                flex-shrink: 0; padding: 0 14px;
            }
            .rnd-dlg-score {
                color: #ffffff; font-weight: 800; font-size: 32px;
                letter-spacing: 3px; line-height: 1;
                text-shadow: 0 0 20px rgba(128,224,64,.2), 0 1px 3px rgba(0,0,0,.5);
            }
            .rnd-dlg-datetime {
                text-align: center; margin-top: 2px;
                font-size: 10.5px; color: #6a9a58; letter-spacing: 0.3px;
                font-weight: 500;
            }
            .rnd-dlg-close {
                position: absolute; top: 6px; right: 6px;
                background: rgba(255,255,255,.05); border: none; border-radius: 50%;
                color: rgba(232,245,216,.4); font-size: 17px; cursor: pointer;
                width: 26px; height: 26px;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s; z-index: 3; line-height: 1;
            }
            .rnd-dlg-close:hover { background: rgba(255,255,255,.15); color: #e8f5d8; transform: scale(1.1); }

            /* ── Live replay ── */
            .rnd-live-bar {
                display: flex; align-items: center; gap: 10px;
                background: #1a3a10; padding: 6px 24px;
                border-bottom: 1px solid #3d6828; justify-content: center;
            }
            .rnd-live-min {
                font-size: 16px; font-weight: 700; color: #80e040;
                min-width: 48px; text-align: center;
                animation: rnd-pulse 1.2s ease-in-out infinite;
            }
            @keyframes rnd-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
            .rnd-live-progress {
                flex: 1; max-width: 400px; height: 6px;
                background: #274a18; border-radius: 3px; overflow: hidden;
            }
            .rnd-live-progress-fill {
                height: 100%; background: linear-gradient(90deg, #4a9030, #80e040);
                border-radius: 3px; transition: width 0.4s;
            }
            .rnd-live-btn {
                background: none; border: 1px solid #5aa838; border-radius: 3px;
                color: #c8e0b4; font-size: 14px; cursor: pointer;
                width: 28px; height: 28px;
                display: flex; align-items: center; justify-content: center;
                transition: background 0.15s;
            }
            .rnd-live-btn:hover { background: rgba(255,255,255,0.1); }
            .rnd-live-label {
                font-size: 11px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 1px; font-weight: 600;
            }
            .rnd-live-ended .rnd-live-min { color: #90b878; animation: none; }
            .rnd-live-feed-line {
                padding: 6px 0; border-bottom: 1px solid #274a18;
                animation: rnd-feedIn 0.4s ease;
            }
            @keyframes rnd-feedIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
            .rnd-live-feed-min {
                font-size: 11px; font-weight: 700; color: #80e040;
                margin-right: 6px;
            }
            .rnd-live-feed-text { color: #c8e0b4; font-size: 13px; }
            .rnd-tabs {
                display: flex; background: #274a18;
                border-bottom: 1px solid #3d6828;
            }
            .rnd-tab {
                flex: 1; padding: 6px 8px; text-align: center;
                font-size: 11px; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px; color: #90b878; cursor: pointer;
                border-bottom: 2px solid transparent; transition: all 0.15s;
            }
            .rnd-tab:hover { color: #c8e0b4; background: #305820; }
            .rnd-tab.active { color: #e8f5d8; border-bottom-color: #6cc040; background: #305820; }
            .rnd-dlg-body {
                overflow-y: auto; padding: 8px 32px;
                flex: 1; color: #c8e0b4; font-size: 13px;
            }
            .rnd-event-row {
                display: flex; align-items: flex-start; gap: 8px;
                padding: 4px 0; border-bottom: 1px solid #325a1e;
            }
            .rnd-event-min { color: #90b878; font-weight: 600; min-width: 28px; text-align: right; }
            .rnd-event-icon { min-width: 18px; text-align: center; }
            .rnd-event-text { flex: 1; color: #c8e0b4; }
            /* ── Venue tab ── */
            .rnd-venue-wrap { max-width: 900px; margin: 0 auto; }
            .rnd-venue-hero {
                position: relative; border-radius: 14px; overflow: hidden;
                background: linear-gradient(135deg, #1a3d0f 0%, #2d5e1a 40%, #1a4a0e 100%);
                margin-bottom: 20px; padding: 30px 24px 24px;
                border: 1px solid #3d6828;
                box-shadow: 0 6px 24px rgba(0,0,0,0.4);
            }
            .rnd-venue-hero::before {
                content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background: repeating-linear-gradient(90deg, transparent, transparent 48%, rgba(255,255,255,0.02) 48%, rgba(255,255,255,0.02) 52%);
                pointer-events: none;
            }
            .rnd-venue-stadium-svg { display: block; margin: 0 auto 20px; opacity: 0.55; }
            .rnd-venue-name {
                text-align: center; font-size: 22px; font-weight: 800; color: #e8f5d8;
                letter-spacing: 0.5px; margin-bottom: 4px; text-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .rnd-venue-city {
                text-align: center; font-size: 13px; color: #a0c888; margin-bottom: 10px;
                letter-spacing: 1px; text-transform: uppercase;
            }
            .rnd-venue-tournament {
                text-align: center; margin-bottom: 0;
            }
            .rnd-venue-tournament span {
                display: inline-block; background: rgba(74,144,48,0.35); padding: 4px 14px;
                border-radius: 20px; font-size: 11px; color: #b8d8a0; letter-spacing: 0.5px;
                border: 1px solid rgba(144,184,120,0.2);
            }
            .rnd-venue-cards {
                display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;
            }
            .rnd-venue-card {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 12px; padding: 16px;
                text-align: center; position: relative; overflow: hidden;
            }
            .rnd-venue-card::after {
                content: ''; position: absolute; top: -20px; right: -20px;
                width: 60px; height: 60px; border-radius: 50%;
                background: rgba(74,144,48,0.1);
            }
            .rnd-venue-card-icon { font-size: 24px; margin-bottom: 6px; }
            .rnd-venue-card-value {
                font-size: 22px; font-weight: 800; color: #e8f5d8; margin-bottom: 2px;
            }
            .rnd-venue-card-label { font-size: 11px; color: #90b878; text-transform: uppercase; letter-spacing: 0.5px; }
            .rnd-venue-gauge-wrap {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 12px; padding: 18px;
                margin-bottom: 16px;
            }
            .rnd-venue-gauge-header {
                display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
            }
            .rnd-venue-gauge-title { font-size: 12px; color: #90b878; text-transform: uppercase; letter-spacing: 0.5px; }
            .rnd-venue-gauge-value { font-size: 14px; font-weight: 700; color: #e8f5d8; }
            .rnd-venue-gauge-bar {
                height: 10px; background: #162e0d; border-radius: 5px; overflow: hidden;
                position: relative;
            }
            .rnd-venue-gauge-fill {
                height: 100%; border-radius: 5px;
                transition: width 0.6s ease;
            }
            .rnd-venue-gauge-fill.attendance {
                background: linear-gradient(90deg, #4a9030, #6cc048, #8ae060);
            }
            .rnd-venue-gauge-fill.pitch {
                background: linear-gradient(90deg, #8B4513, #6aa030, #4a9030);
            }
            .rnd-venue-weather {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 12px; padding: 20px;
                margin-bottom: 16px; display: flex; align-items: center; gap: 18px;
            }
            .rnd-venue-weather-icon { font-size: 48px; line-height: 1; }
            .rnd-venue-weather-info { flex: 1; }
            .rnd-venue-weather-text { font-size: 18px; font-weight: 700; color: #e8f5d8; margin-bottom: 2px; }
            .rnd-venue-weather-sub { font-size: 12px; color: #90b878; }
            .rnd-venue-facilities {
                display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;
            }
            .rnd-venue-facility {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 10px; padding: 12px 8px;
                text-align: center; transition: border-color 0.2s;
            }
            .rnd-venue-facility.active { border-color: #4a9030; background: linear-gradient(145deg, #2a4d1c, #234218); }
            .rnd-venue-facility-icon { font-size: 22px; margin-bottom: 4px; }
            .rnd-venue-facility-label { font-size: 10px; color: #90b878; text-transform: uppercase; letter-spacing: 0.3px; }
            .rnd-venue-facility .rnd-venue-facility-status {
                font-size: 10px; margin-top: 3px; color: #6b8a58; font-weight: 600;
            }
            .rnd-venue-facility.active .rnd-venue-facility-status { color: #8ae060; }

            /* ── Report tab ── */
            .rnd-report-event {
                border-bottom: 1px solid #325a1e; padding: 10px 0;
            }
            .rnd-report-event:last-child { border-bottom: none; }
            .rnd-report-min-header {
                color: #90b878; font-weight: 700; font-size: 12px;
                margin-bottom: 4px; text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .rnd-report-text {
                color: #c8e0b4; font-size: 13px; line-height: 1.6;
            }
            .rnd-report-text .rnd-goal-text { color: #80d848; font-weight: 700; }
            .rnd-report-text .rnd-yellow-text { color: #ffd700; }
            .rnd-report-text .rnd-red-text { color: #ff4c4c; font-weight: 700; }
            .rnd-report-text .rnd-sub-text { color: #5b9bff; }
            .rnd-report-text .rnd-player-name { color: #e8f5d8; font-weight: 600; }

            /* ── Dialog logos ── */
            .rnd-dlg-logo {
                width: 44px; height: 44px; flex-shrink: 0;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,.5));
                object-fit: contain; pointer-events: none;
            }

            /* ── Statistics tab ── */
            .rnd-stats-wrap {
                max-width: 560px; margin: 0 auto; padding: 4px 0 12px;
            }
            .rnd-stats-team-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 16px 14px; margin-bottom: 4px;
            }
            .rnd-stats-team-side {
                display: flex; align-items: center; gap: 10px;
            }
            .rnd-stats-team-side.away { flex-direction: row-reverse; }
            .rnd-stats-team-logo {
                width: 36px; height: 36px; object-fit: contain;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,.3));
            }
            .rnd-stats-team-name {
                font-weight: 700; font-size: 14px; color: #e8f5d8;
                letter-spacing: 0.2px;
            }
            .rnd-stats-vs {
                font-size: 11px; color: #6a9a55; font-weight: 600;
                text-transform: uppercase; letter-spacing: 1px;
            }
            .rnd-stat-row {
                padding: 10px 16px;
            }
            .rnd-stat-header {
                display: flex; align-items: baseline; justify-content: space-between;
                margin-bottom: 5px;
            }
            .rnd-stat-val {
                font-weight: 800; font-size: 15px; min-width: 32px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-stat-val.home { text-align: left; color: #80e048; }
            .rnd-stat-val.away { text-align: right; color: #5ba8f0; }
            .rnd-stat-val.leading { font-size: 17px; }
            .rnd-stat-label {
                font-weight: 600; color: #8aac72; font-size: 11px;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .rnd-stat-bar-wrap {
                display: flex; height: 7px; border-radius: 4px;
                overflow: hidden; background: rgba(0,0,0,.18);
                gap: 2px;
            }
            .rnd-stat-seg {
                border-radius: 3px;
                transition: width 0.5s cubic-bezier(.4,0,.2,1);
                min-width: 3px;
            }
            .rnd-stat-seg.home {
                background: linear-gradient(90deg, #4a9030, #6cc048);
            }
            .rnd-stat-seg.away {
                background: linear-gradient(90deg, #3a7ab8, #5b9bff);
            }
            .rnd-stat-divider {
                height: 1px; margin: 0 16px;
                background: linear-gradient(90deg, transparent, #3d6828 20%, #3d6828 80%, transparent);
            }
            .rnd-stat-row-highlight {
                background: rgba(60,120,40,.06);
                border-radius: 8px; margin: 2px 8px;
                padding: 10px 12px;
            }

            /* ── Advanced Stats (Attacking Styles) ── */
            .rnd-adv-section {
                margin-top: 16px; padding-top: 12px;
                border-top: 1px solid #3d6828;
            }
            .rnd-adv-title {
                text-align: center; font-size: 11px; font-weight: 700;
                color: #8aac72; text-transform: uppercase; letter-spacing: 1.2px;
                margin-bottom: 10px;
            }
            .rnd-adv-team-label {
                font-size: 11px; font-weight: 700; color: #b0d898;
                text-transform: uppercase; letter-spacing: 0.8px;
                padding: 6px 12px 4px; margin-top: 6px;
            }
            .rnd-adv-table {
                width: 100%; border-collapse: collapse; font-size: 12px;
            }
            .rnd-adv-table th {
                padding: 5px 8px; font-size: 10px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px;
                border-bottom: 1px solid #2a4a1c; text-align: center;
            }
            .rnd-adv-table th:first-child { text-align: left; }
            .rnd-adv-row {
                cursor: pointer; transition: background 0.15s;
            }
            .rnd-adv-row:hover { background: rgba(255,255,255,.04); }
            .rnd-adv-row td {
                padding: 5px 8px; text-align: center;
                border-bottom: 1px solid rgba(42,74,28,.5);
                font-variant-numeric: tabular-nums;
            }
            .rnd-adv-row td:first-child {
                text-align: left; font-weight: 600; color: #c8e0b4;
            }
            .rnd-adv-row td.adv-zero { color: #4a6a3a; }
            .rnd-adv-row td.adv-goal { color: #80e048; font-weight: 700; }
            .rnd-adv-row td.adv-shot { color: #c8d868; }
            .rnd-adv-row td.adv-lost { color: #c87848; }
            .rnd-adv-row .adv-arrow {
                display: inline-block; font-size: 9px; margin-left: 4px;
                transition: transform 0.2s; color: #6a9a58;
            }
            .rnd-adv-row.expanded .adv-arrow { transform: rotate(90deg); }
            .rnd-adv-row.rnd-adv-total td {
                font-weight: 800; border-top: 1px solid #3d6828;
                color: #e0f0cc; cursor: default;
            }
            .rnd-adv-row.rnd-adv-total td:first-child { color: #8aac72; }
            .rnd-adv-events {
                display: none;
            }
            .rnd-adv-events.visible { display: table-row; }
            .rnd-adv-events td {
                padding: 0; border-bottom: 1px solid rgba(42,74,28,.3);
            }
            .rnd-adv-evt-list {
                padding: 4px 0 6px 0; font-size: 11px;
            }
            .rnd-adv-evt {
                padding: 2px 0; color: #a0c088;
                display: flex; align-items: stretch; gap: 0;
                border-bottom: 1px solid rgba(42,74,28,.25);
            }
            .rnd-adv-evt:last-child { border-bottom: none; }
            .rnd-adv-evt .adv-result-tag {
                font-size: 9px; font-weight: 700; padding: 6px 5px 0;
                text-transform: uppercase; white-space: nowrap;
                min-width: 52px; text-align: center;
                align-self: flex-start;
            }
            .rnd-adv-evt .adv-result-tag.goal { color: #80e048; }
            .rnd-adv-evt .adv-result-tag.shot { color: #c8d868; }
            .rnd-adv-evt .adv-result-tag.lost { color: #c87848; }
            .rnd-adv-evt .rnd-acc { flex: 1; border-bottom: none; }
            .rnd-adv-evt .rnd-acc-head { padding: 4px 6px; min-height: auto; }
            .rnd-adv-evt .rnd-acc-min { font-size: 11px; min-width: 28px; }
            .rnd-adv-evt .rnd-acc-body { padding: 0 6px 6px; }
            .rnd-adv-evt .rnd-player-name { color: #e0f0cc; font-weight: 600; }

            /* ── Player Card Dialog ── */
            .rnd-plr-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,.7); z-index: 100002;
                display: flex; align-items: center; justify-content: center;
                animation: rndFadeIn .15s ease;
            }
            .rnd-plr-dialog {
                background: linear-gradient(160deg, #1a3d0f 0%, #0e2508 60%, #122a0a 100%);
                border: 1px solid #3d6828; border-radius: 14px;
                width: 680px; max-width: 96vw; max-height: 88vh;
                overflow-y: auto; color: #c8e0b4;
                box-shadow: 0 12px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(74,144,48,.15);
            }
            .rnd-plr-header {
                display: flex; align-items: center; gap: 16px;
                padding: 20px 24px 16px;
                background: linear-gradient(180deg, rgba(42,74,28,.3) 0%, transparent 100%);
                border-bottom: 1px solid #2a4a1c; position: relative;
            }
            .rnd-plr-face {
                width: 84px; height: 84px; border-radius: 50%;
                border: 3px solid #4a9030; overflow: hidden;
                flex-shrink: 0; background: #0e200a;
                box-shadow: 0 4px 16px rgba(0,0,0,.4);
            }
            .rnd-plr-face img { width: 100%; height: 100%; object-fit: cover; }
            .rnd-plr-info { flex: 1; min-width: 0; }
            .rnd-plr-name-row {
                display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
            }
            .rnd-plr-name {
                font-size: 20px; font-weight: 800; color: #e0f0cc;
                text-decoration: none; cursor: pointer;
            }
            .rnd-plr-name:hover { color: #fff; text-decoration: underline; }
            .rnd-plr-link {
                color: #6a9a58; font-size: 14px; text-decoration: none;
                transition: color .15s;
            }
            .rnd-plr-link:hover { color: #80e048; }
            .rnd-plr-badges {
                display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px;
            }
            .rnd-plr-badge {
                display: inline-flex; align-items: center; gap: 4px;
                background: rgba(42,74,28,.5); border: 1px solid #2a4a1c;
                border-radius: 12px; padding: 2px 8px;
                font-size: 11px; color: #8aac72;
            }
            .rnd-plr-badge .badge-icon { font-size: 12px; }
            .rnd-plr-rating-wrap {
                text-align: center; flex-shrink: 0; min-width: 64px;
            }
            .rnd-plr-rating-big {
                font-size: 32px; font-weight: 900; line-height: 1;
            }
            .rnd-plr-rating-label {
                font-size: 9px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 0.5px; margin-top: 2px;
            }
            .rnd-plr-close {
                position: absolute; top: 10px; right: 14px;
                background: rgba(42,74,28,.4); border: 1px solid #2a4a1c;
                color: #8aac72; width: 28px; height: 28px; border-radius: 50%;
                font-size: 16px; cursor: pointer; display: flex;
                align-items: center; justify-content: center;
                transition: all .15s;
            }
            .rnd-plr-close:hover { background: rgba(74,144,48,.3); color: #e0f0cc; }
            .rnd-plr-body { padding: 16px 24px 20px; }
            .rnd-plr-stats-row {
                display: grid; grid-template-columns: repeat(5, 1fr);
                gap: 8px; margin-bottom: 16px;
            }
            .rnd-plr-stat-card {
                background: rgba(42,74,28,.35); border: 1px solid #2a4a1c;
                border-radius: 8px; padding: 10px 4px 8px;
                text-align: center; transition: background .15s;
            }
            .rnd-plr-stat-card:hover { background: rgba(42,74,28,.55); }
            .rnd-plr-stat-icon { font-size: 16px; margin-bottom: 2px; }
            .rnd-plr-stat-val {
                font-size: 22px; font-weight: 800; color: #e0f0cc; line-height: 1.1;
            }
            .rnd-plr-stat-lbl {
                font-size: 9px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 0.3px; margin-top: 2px;
            }
            .rnd-plr-stat-card.green .rnd-plr-stat-val { color: #66dd44; }
            .rnd-plr-stat-card.red .rnd-plr-stat-val { color: #ee6633; }
            .rnd-plr-stat-card.gold .rnd-plr-stat-val { color: #f0d040; }
            .rnd-plr-section-title {
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 1px;
                margin: 14px 0 8px; padding-bottom: 5px;
                border-bottom: 1px solid #2a4a1c;
                display: flex; align-items: center; gap: 6px;
            }
            .rnd-plr-section-title .sec-icon { font-size: 13px; }

            /* ── Player Card Profile Section ── */
            .rnd-plr-profile-wrap {
                background: rgba(42,74,28,.25); border: 1px solid #2a4a1c;
                border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;
            }
            .rnd-plr-profile-loading {
                text-align: center; padding: 16px; color: #5a7a48; font-size: 12px;
            }
            .rnd-plr-country-row {
                display: flex; align-items: center; gap: 6px;
                margin-bottom: 10px; padding-bottom: 8px;
                border-bottom: 1px solid rgba(42,74,28,.4);
            }
            .rnd-plr-country-flag {
                height: 14px; vertical-align: -1px;
            }
            .rnd-plr-country-name {
                font-size: 11px; color: #8aac72; font-weight: 600;
            }
            .rnd-plr-skills-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 0 20px; margin-bottom: 12px;
            }
            .rnd-plr-skill-row {
                display: flex; align-items: center; justify-content: space-between;
                padding: 2px 6px; border-radius: 3px;
                transition: background .1s;
            }
            .rnd-plr-skill-row:hover { background: rgba(42,74,28,.4); }
            .rnd-plr-skill-name {
                font-size: 10px; color: #8abc78; font-weight: 600;
                text-transform: uppercase; letter-spacing: .3px;
            }
            .rnd-plr-skill-val {
                font-size: 12px; font-weight: 800; min-width: 22px;
                text-align: right;
            }
            .rnd-plr-skill-star { color: #d4af37; }
            .rnd-plr-skill-star.silver { color: #c0c0c0; }
            .rnd-plr-profile-footer {
                display: grid; grid-template-columns: repeat(4, 1fr);
                gap: 8px; padding-top: 10px;
                border-top: 1px solid rgba(42,74,28,.4);
            }
            .rnd-plr-profile-stat {
                text-align: center; padding: 6px 4px;
                background: rgba(0,0,0,.15); border-radius: 6px;
            }
            .rnd-plr-profile-stat-val {
                font-size: 16px; font-weight: 800; line-height: 1.2;
            }
            .rnd-plr-profile-stat-lbl {
                font-size: 8px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: .5px; margin-top: 2px; font-weight: 700;
            }

            /* ── Tactics cards ── */
            .rnd-tactics-section {
                margin-top: 6px; padding: 6px;
                background: linear-gradient(180deg, rgba(20,40,14,.6), rgba(16,32,10,.8));
                border-radius: 8px; border: 1px solid #2a4a1c;
            }
            .rnd-tactics-grid { display: flex; flex-direction: column; gap: 0; }
            .rnd-tactic-row {
                display: flex; align-items: center; gap: 6px;
                padding: 5px 8px;
                border-bottom: 1px solid rgba(60,100,40,.15);
            }
            .rnd-tactic-row:last-child { border-bottom: none; }
            .rnd-tactic-row.r5-row {
                padding: 7px 8px; margin-bottom: 2px;
                background: rgba(0,0,0,.12); border-radius: 6px;
                border-bottom: none;
            }
            .rnd-tactic-icon {
                font-size: 12px; line-height: 1; width: 18px;
                text-align: center; flex-shrink: 0;
            }
            .rnd-tactic-label {
                font-size: 9px; color: #7a9a68; text-transform: uppercase;
                letter-spacing: 0.6px; font-weight: 700; min-width: 52px;
                flex-shrink: 0;
            }
            .rnd-tactic-meter {
                flex: 1; height: 4px; background: rgba(0,0,0,.25); border-radius: 2px;
                overflow: hidden;
            }
            .rnd-tactic-meter-fill {
                height: 100%; border-radius: 2px; transition: width 0.4s ease;
            }
            .rnd-tactic-meter-fill.home { background: linear-gradient(90deg, #3a7025, #6cc048); }
            .rnd-tactic-meter-fill.away { background: linear-gradient(90deg, #3a70b0, #5b9bff); }
            .rnd-tactic-value {
                font-size: 10px; font-weight: 700; color: #d0e8c0;
                min-width: 0; text-align: right;
                white-space: nowrap;
            }
            .rnd-tactic-value-pill {
                font-size: 9px; font-weight: 700; padding: 1px 6px;
                border-radius: 4px; white-space: nowrap;
            }
            .rnd-tactic-value-pill.home {
                background: rgba(80,160,50,.15); color: #80d848;
            }
            .rnd-tactic-value-pill.away {
                background: rgba(60,120,200,.15); color: #6ab0ff;
            }
            .rnd-tactic-focus-icon {
                font-size: 13px; line-height: 1;
            }

            /* ── Report event badges ── */
            .rnd-report-evt-badge {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 5px 12px; border-radius: 4px; margin-bottom: 6px;
                font-size: 12px; font-weight: 600;
            }
            .rnd-report-evt-badge.evt-goal { background: rgba(80,200,60,0.15); color: #80d848; }
            .rnd-report-evt-badge.evt-yellow { background: rgba(255,215,0,0.12); color: #ffd700; }
            .rnd-report-evt-badge.evt-red { background: rgba(255,76,76,0.12); color: #ff4c4c; }
            .rnd-report-evt-badge.evt-sub { background: rgba(91,155,255,0.12); color: #5b9bff; }
            .rnd-report-evt-badge.evt-injury { background: rgba(255,140,60,0.12); color: #ff8c3c; }

            /* ── Details timeline ── */
            .rnd-timeline { margin-top: 16px; }
            .rnd-tl-row {
                display: flex; align-items: center;
                border-bottom: 1px solid #325a1e;
                padding: 8px 0; min-height: 32px;
            }
            .rnd-tl-row:last-child { border-bottom: none; }
            .rnd-tl-goal { background: rgba(80,200,60,0.08); }
            .rnd-tl-home {
                flex: 1; text-align: right; padding-right: 14px;
                color: #e0f0cc; font-size: 13px;
            }
            .rnd-tl-min {
                width: 44px; text-align: center; flex-shrink: 0;
                color: #90b878; font-weight: 700; font-size: 12px;
                background: #274a18; border-radius: 3px; padding: 2px 0;
            }
            .rnd-tl-away {
                flex: 1; text-align: left; padding-left: 14px;
                color: #e0f0cc; font-size: 13px;
            }

            /* ── Report accordion ── */
            .rnd-acc { border-bottom: 1px solid #325a1e; }
            .rnd-acc:last-child { border-bottom: none; }
            .rnd-acc-head {
                display: flex; align-items: center;
                padding: 8px 0; min-height: 32px; cursor: pointer;
                transition: background 0.15s;
            }
            .rnd-acc-head:hover { background: rgba(255,255,255,0.03); }
            .rnd-acc-goal { background: rgba(80,200,60,0.08); }
            .rnd-acc-home {
                flex: 1; text-align: right; padding-right: 14px;
                color: #e0f0cc; font-size: 13px;
            }
            .rnd-acc-min {
                width: 44px; text-align: center; flex-shrink: 0;
                color: #90b878; font-weight: 700; font-size: 12px;
                background: #274a18; border-radius: 3px; padding: 2px 0;
            }
            .rnd-acc-away {
                flex: 1; text-align: left; padding-left: 14px;
                color: #e0f0cc; font-size: 13px;
            }
            .rnd-acc-body {
                display: none; padding: 8px 14px 12px;
                background: rgba(0,0,0,0.15); border-radius: 0 0 4px 4px;
            }
            .rnd-acc.open .rnd-acc-body { display: block; }
            .rnd-acc-chevron {
                width: 14px; height: 14px; flex-shrink: 0;
                fill: #5a7a48; transition: transform 0.2s;
                margin: 0 4px;
            }
            .rnd-acc.open .rnd-acc-chevron { transform: rotate(90deg); }

            /* ── Lineups tab ── */
            .rnd-lu-outer { display: flex; flex-direction: column; }
            .rnd-lu-wrap { display: flex; gap: 0; }
            .rnd-lu-list {
                flex: 0 0 25%; font-size: 12px;
                padding: 0 8px; box-sizing: border-box;
            }
            .rnd-lu-list-title {
                font-weight: 700; font-size: 13px; color: #e8f5d8;
                padding: 6px 0; border-bottom: 1px solid #3d6828;
                margin-bottom: 4px; display: flex; align-items: center; gap: 8px;
            }
            .rnd-lu-list-title img { width: 24px; height: 24px; }
            .rnd-lu-badge {
                font-size: 10px; font-weight: 600; color: #b8d8a0; background: rgba(0,0,0,.2);
                padding: 2px 6px; border-radius: 3px; margin-left: auto; white-space: nowrap;
            }
            .rnd-lu-badge + .rnd-lu-badge { margin-left: 4px; }
            .rnd-lu-player {
                display: flex; align-items: center; gap: 6px;
                padding: 4px 0; border-bottom: 1px solid #274a18;
            }
            .rnd-lu-player:last-child { border-bottom: none; }
            .rnd-lu-clickable { cursor: pointer; transition: background .15s; }
            .rnd-lu-clickable:hover { background: rgba(74,144,48,.15); }
            .rnd-lu-no {
                width: 22px; height: 22px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 10px; font-weight: 700; flex-shrink: 0;
            }
            .rnd-lu-name { flex: 1; color: #c8e0b4; font-size: 12px; }
            .rnd-lu-pos { color: #90b878; font-size: 10px; text-transform: uppercase; width: 30px; text-align: center; }
            .rnd-lu-rating { font-weight: 700; font-size: 12px; width: 32px; text-align: right; }
            .rnd-lu-r5 {
                font-weight: 700; font-size: 10px; min-width: 36px;
                text-align: center; border-radius: 10px;
                padding: 1px 5px; color: #fff; flex-shrink: 0;
                background: #3a5a2a;
            }
            .rnd-lu-sub-header {
                font-size: 11px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 1px; padding: 8px 0 4px; font-weight: 600;
            }
            .rnd-lu-captain {
                font-size: 10px; font-weight: 800; color: #ffd700;
                margin-left: 2px;
            }
            .rnd-lu-mom {
                font-size: 10px; margin-left: 2px;
            }
            .rnd-pitch-captain {
                position: absolute; top: 50%; left: 50%;
                transform: translate(30%, -100%);
                font-size: 9px; font-weight: 900; color: #fff;
                background: #d4a017; border-radius: 50%;
                width: 16px; height: 16px;
                display: flex; align-items: center; justify-content: center;
                z-index: 4; box-shadow: 0 1px 3px rgba(0,0,0,0.5);
                border: 1.5px solid #ffd700;
            }
            .rnd-pitch-mom {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-130%, -100%);
                font-size: 12px; z-index: 4;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
            }

            /* Pitch */
            .rnd-pitch-wrap { flex: 0 0 50%; display: flex; flex-direction: column; align-items: center; justify-content: start; gap: 8px; }
            /* Unity 3D viewport row: feed | viewport | stats */
            .rnd-unity-row {
                display: flex; gap: 0; width: 100%;
                margin-bottom: 8px; align-items: stretch;
            }
            .rnd-unity-feed {
                flex: 0 0 25%; min-width: 0; display: flex; flex-direction: column;
                gap: 3px; overflow-y: auto; overflow-x: hidden;
                scrollbar-width: none; /* Firefox */
                padding: 6px 8px; box-sizing: border-box;
                max-height: 0; /* will be set dynamically via JS */
            }
            .rnd-unity-feed::-webkit-scrollbar { display: none; } /* Chrome/Edge */
            .rnd-unity-feed-line {
                display: flex; align-items: baseline; gap: 5px;
                font-size: 13px; color: #b8d8a0; line-height: 1.4;
                padding: 2px 0;
                animation: rnd-fade-in 0.4s ease;
            }
            .rnd-unity-feed-min {
                font-size: 9px; font-weight: 700; color: #80e040;
                background: rgba(0,0,0,0.3); border-radius: 3px;
                padding: 1px 4px; white-space: nowrap; flex-shrink: 0;
            }
            .rnd-unity-feed-text { color: #c8e0b4; }
            .rnd-unity-feed-text .rnd-player-name { color: #e8f5d8; font-weight: 600; }
            @keyframes rnd-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            .rnd-unity-stats {
                flex: 0 0 25%; display: flex; flex-direction: column;
                gap: 0; padding: 6px; box-sizing: border-box;
                font-size: 11px; overflow-y: auto;
                background: rgba(16,32,10,.4);
                border-radius: 8px; border: 1px solid rgba(60,100,40,.2);
            }
            .rnd-unity-stat-row {
                padding: 5px 6px;
                border-bottom: 1px solid rgba(60,100,40,.12);
                transition: background .2s;
            }
            .rnd-unity-stat-row:last-child { border-bottom: none; }
            .rnd-unity-stat-row:hover { background: rgba(60,120,40,.08); }
            .rnd-unity-stat-hdr {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 3px;
            }
            .rnd-unity-stat-hdr .val {
                font-weight: 800; font-size: 13px; min-width: 18px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-unity-stat-hdr .val.home { text-align: left; color: #80e048; }
            .rnd-unity-stat-hdr .val.away { text-align: right; color: #5ba8f0; }
            .rnd-unity-stat-hdr .val.lead { font-size: 15px; }
            .rnd-unity-stat-label {
                font-size: 8px; color: #6a9a55; text-transform: uppercase;
                letter-spacing: 0.8px; font-weight: 700; text-align: center; flex: 1;
            }
            .rnd-unity-stat-bar {
                display: flex; height: 5px; border-radius: 3px; overflow: hidden;
                background: rgba(0,0,0,.2); gap: 2px;
            }
            .rnd-unity-stat-bar .seg {
                transition: width 0.5s cubic-bezier(.4,0,.2,1);
                min-width: 2px; border-radius: 2px;
            }
            .rnd-unity-stat-bar .seg.home { background: linear-gradient(90deg, #4a9030, #6cc048); }
            .rnd-unity-stat-bar .seg.away { background: linear-gradient(90deg, #3a7ab8, #5b9bff); }
            .rnd-unity-viewport {
                position: relative; border: 2px solid #4a9030;
                border-radius: 8px; overflow: hidden;
                background: #0a0a0a;
                width: 100%; max-width: 400px;
                margin: 0 auto;
                aspect-ratio: 780 / 447;
            }
            .rnd-unity-viewport .webgl-content {
                position: relative !important;
                top: auto !important; left: auto !important;
                right: auto !important; bottom: auto !important;
                transform: none !important;
                width: 100% !important; height: 100% !important;
                margin: 0 !important; padding: 0 !important;
                display: block !important;
            }
            .rnd-unity-viewport #gameContainer {
                position: relative !important;
                top: auto !important; left: auto !important;
                right: auto !important; bottom: auto !important;
                transform: none !important;
                width: 100% !important; height: 100% !important;
                margin: 0 !important; padding: 0 !important;
            }
            .rnd-unity-viewport #gameContainer .footer { display: none !important; }
            .rnd-unity-viewport canvas {
                width: 100% !important; height: 100% !important;
                display: block !important;
                object-fit: contain;
            }
            /* Hide datetime & show inline time when live */
            .rnd-dlg-head.rnd-live-active .rnd-dlg-datetime { display: none; }
            .rnd-dlg-head-time {
                display: none; gap: 8px; align-items: center;
                justify-content: center; margin-top: 6px;
                padding-top: 6px;
                border-top: 1px solid rgba(80,160,48,.12);
            }
            .rnd-dlg-head.rnd-live-active .rnd-dlg-head-time { display: flex; }
            .rnd-dlg-head-time .rnd-live-min {
                font-size: 14px; font-weight: 800; color: #80e040;
                background: rgba(0,0,0,.45); padding: 2px 10px;
                border-radius: 8px; min-width: 48px; text-align: center;
                letter-spacing: 0.5px;
                box-shadow: 0 0 10px rgba(128,224,64,.15);
                animation: rnd-pulse 1.2s ease-in-out infinite;
            }
            .rnd-dlg-head-time .rnd-live-progress {
                flex: 1; max-width: 180px; height: 4px;
                background: rgba(0,0,0,.4); border-radius: 2px; overflow: hidden;
            }
            .rnd-dlg-head-time .rnd-live-progress-fill {
                height: 100%; border-radius: 2px; transition: width 0.4s;
                background: linear-gradient(90deg, #4a9030, #80e040);
                box-shadow: 0 0 6px rgba(128,224,64,.3);
            }
            .rnd-dlg-head-time .rnd-live-btn {
                background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
                border-radius: 50%; color: #a0d090; font-size: 12px;
                cursor: pointer; width: 26px; height: 26px;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s;
            }
            .rnd-dlg-head-time .rnd-live-btn:hover {
                background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.25);
                transform: scale(1.1);
            }
            .rnd-live-filter-group {
                display: flex; gap: 1px;
                background: rgba(0,0,0,.35); border-radius: 10px;
                padding: 2px;
            }
            .rnd-live-filter-btn {
                background: none; border: none; border-radius: 8px;
                color: #7aaa68; font-size: 10px; font-weight: 600;
                cursor: pointer; padding: 2px 8px;
                transition: all 0.2s; white-space: nowrap;
                letter-spacing: 0.3px; text-transform: uppercase;
            }
            .rnd-live-filter-btn:hover { color: #b8dca8; }
            .rnd-live-filter-btn.active {
                background: rgba(108,192,64,.2); color: #80e040;
                box-shadow: 0 0 6px rgba(128,224,64,.15);
            }
            .rnd-live-filter-btn.live-btn.active {
                background: rgba(220,40,40,.2); color: #ff4444;
                box-shadow: 0 0 8px rgba(255,60,60,.25);
            }
            .rnd-live-filter-btn.live-btn::before {
                content: ''; display: inline-block;
                width: 6px; height: 6px; border-radius: 50%;
                background: #ff4444; margin-right: 4px;
                vertical-align: middle;
            }
            .rnd-live-filter-btn.live-btn.active::before {
                animation: rnd-live-dot 1.2s ease-in-out infinite;
            }
            @keyframes rnd-live-dot { 0%,100%{opacity:1} 50%{opacity:.3} }
            .rnd-live-filter-btn:disabled {
                opacity: 0.35; cursor: not-allowed;
                pointer-events: none;
            }
            .rnd-r5-compare { display: flex; gap: 12px; width: 100%; justify-content: center; align-items: center; }
            .rnd-r5-side { display: flex; align-items: center; gap: 6px; flex: 1; }
            .rnd-r5-side.away { flex-direction: row-reverse; }
            .rnd-r5-side-label { font-size: 11px; color: #8ab87a; white-space: nowrap; font-weight: 600; }
            .rnd-r5-side-meter { flex: 1; height: 8px; background: rgba(0,0,0,.25); border-radius: 4px; overflow: hidden; }
            .rnd-r5-side-meter-fill { height: 100%; border-radius: 4px; transition: width .6s ease; }
            .rnd-r5-side-meter-fill.home { background: linear-gradient(90deg, #6cbf4a, #a8e06a); }
            .rnd-r5-side-meter-fill.away { background: linear-gradient(90deg, #e06a6a, #f0a0a0); }
            .rnd-r5-side-val { font-size: 13px; font-weight: 700; min-width: 32px; text-align: center; }
            .rnd-pitch {
                position: relative; width: 100%;
                background: linear-gradient(90deg, #2d6b1e 0%, #357a22 50%, #2d6b1e 100%);
                border: 2px solid #4a9030; border-radius: 6px; overflow: hidden;
            }
            .rnd-pitch-lines {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none; z-index: 0;
            }
            .rnd-pitch-grid {
                position: relative; z-index: 1;
                display: grid;
                grid-template-columns: repeat(12, 8.333%);
                grid-template-rows: repeat(5, 20%);
                width: 100%; aspect-ratio: 3 / 2;
            }
            .rnd-pitch-cell {
                position: relative; overflow: visible;
            }
            .rnd-pitch-face {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                width: 70%; max-width: 48px; aspect-ratio: 1;
                border-radius: 50%; overflow: hidden;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
                z-index: 2;
            }
            .rnd-pitch-face img {
                width: 100%; height: 100%; object-fit: cover;
                border-radius: 50%;
            }
            .rnd-pitch-info {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, 0);
                margin-top: 40%;
                display: flex; flex-direction: column; align-items: center;
                z-index: 3; pointer-events: none;
            }
            .rnd-pitch-label {
                font-size: 10px; color: #fff;
                text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                white-space: nowrap;
                text-align: center;
                font-weight: 600; line-height: 1.2;
            }
            .rnd-pitch-rating {
                font-size: 9px; font-weight: 700;
                padding: 0 3px; border-radius: 3px;
                background: rgba(0,0,0,0.4); line-height: 1.3;
            }
            .rnd-pitch-events {
                display: flex; gap: 1px; flex-wrap: wrap;
                justify-content: center; font-size: 9px;
            }
            /* ── Pitch hover tooltip ── */
            .rnd-pitch-cell[data-pid] { cursor: pointer; }
            .rnd-pitch-tooltip {
                position: fixed; z-index: 100001;
                background: linear-gradient(135deg, #1a2e14 0%, #243a1a 100%);
                border: 1px solid #4a9030; border-radius: 8px;
                padding: 10px 12px; min-width: 200px; max-width: 280px;
                box-shadow: 0 6px 24px rgba(0,0,0,0.6);
                pointer-events: none; font-size: 11px; color: #c8e0b4;
                opacity: 0; transition: opacity .15s ease;
            }
            .rnd-pitch-tooltip.visible { opacity: 1; }
            .rnd-pitch-tooltip-header {
                display: flex; align-items: center; gap: 8px;
                margin-bottom: 8px; padding-bottom: 6px;
                border-bottom: 1px solid rgba(74,144,48,0.3);
            }
            .rnd-pitch-tooltip-name { font-size: 13px; font-weight: 700; color: #e0f0cc; }
            .rnd-pitch-tooltip-pos { font-size: 10px; color: #8abc78; font-weight: 600; }
            .rnd-pitch-tooltip-badges { display: flex; gap: 6px; margin-left: auto; }
            .rnd-pitch-tooltip-badge {
                font-size: 10px; font-weight: 700; padding: 2px 6px;
                border-radius: 4px; background: rgba(0,0,0,0.3);
            }
            .rnd-pitch-tooltip-skills {
                display: flex; gap: 12px; margin-bottom: 6px;
            }
            .rnd-pitch-tooltip-skills-col {
                flex: 1; min-width: 0;
            }
            .rnd-pitch-tooltip-skill {
                display: flex; justify-content: space-between;
                padding: 1px 0; border-bottom: 1px solid rgba(74,144,48,0.12);
            }
            .rnd-pitch-tooltip-skill-name { color: #8abc78; font-size: 10px; }
            .rnd-pitch-tooltip-skill-val { font-weight: 700; font-size: 11px; }
            .rnd-pitch-tooltip-footer {
                display: flex; gap: 8px; justify-content: center;
                padding-top: 6px; border-top: 1px solid rgba(74,144,48,0.3);
            }
            .rnd-pitch-tooltip-stat {
                text-align: center;
            }
            .rnd-pitch-tooltip-stat-val { font-size: 14px; font-weight: 800; }
            .rnd-pitch-tooltip-stat-lbl { font-size: 9px; color: #6a9a58; text-transform: uppercase; }
            .rnd-pitch-tooltip-loading {
                text-align: center; padding: 8px; color: #6a9a58; font-size: 10px;
            }
            .rnd-lu-events {
                display: flex; gap: 1px; flex-shrink: 0; font-size: 11px;
                margin-left: 2px;
            }

            /* H2H tab */
            .rnd-h2h-wrap { max-width: 640px; margin: 0 auto; padding: 8px 0 16px; }

            /* ── Summary cards ── */
            .rnd-h2h-summary {
                display: flex; gap: 10px; margin-bottom: 16px;
                justify-content: center;
            }
            .rnd-h2h-section {
                flex: 1; background: rgba(0,0,0,.2);
                border-radius: 10px; padding: 14px 16px 10px;
                text-align: center; border: 1px solid rgba(255,255,255,.04);
            }
            .rnd-h2h-section-title {
                font-size: 10px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 1.2px; margin-bottom: 10px; font-weight: 700;
            }
            .rnd-h2h-bar-wrap {
                display: flex; height: 28px; border-radius: 6px;
                overflow: hidden; margin-bottom: 8px;
                background: rgba(0,0,0,.2);
            }
            .rnd-h2h-bar {
                display: flex; align-items: center; justify-content: center;
                font-size: 12px; font-weight: 800; color: #fff;
                min-width: 30px; transition: width 0.5s ease;
            }
            .rnd-h2h-bar.home { background: linear-gradient(135deg, #3d8a28, #5ab03a); }
            .rnd-h2h-bar.draw { background: rgba(255,255,255,.08); color: #8a9a7a; }
            .rnd-h2h-bar.away { background: linear-gradient(135deg, #2a6aa0, #4a8ac8); }
            .rnd-h2h-legend {
                display: flex; justify-content: space-between;
                font-size: 10px; color: #7aaa68; font-weight: 500;
            }

            /* ── Overall record strip ── */
            .rnd-h2h-record {
                display: flex; align-items: center; justify-content: center;
                gap: 24px; padding: 10px 0 14px;
                border-bottom: 1px solid rgba(80,160,48,.12);
                margin-bottom: 4px;
            }
            .rnd-h2h-record-side {
                display: flex; align-items: center; gap: 8px;
            }
            .rnd-h2h-record-side.away { flex-direction: row-reverse; }
            .rnd-h2h-record-logo {
                width: 28px; height: 28px; object-fit: contain;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,.4));
            }
            .rnd-h2h-record-name {
                font-size: 12px; font-weight: 700; color: #c8e4b0;
                max-width: 150px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis;
            }
            .rnd-h2h-record-stat {
                display: flex; flex-direction: column; align-items: center;
            }
            .rnd-h2h-record-num {
                font-size: 22px; font-weight: 800; line-height: 1;
            }
            .rnd-h2h-record-num.home { color: #5ab03a; }
            .rnd-h2h-record-num.draw { color: #7a8a6a; }
            .rnd-h2h-record-num.away { color: #4a8ac8; }
            .rnd-h2h-record-label {
                font-size: 8px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 1px; font-weight: 600; margin-top: 2px;
            }
            .rnd-h2h-goals-summary {
                text-align: center; font-size: 10px; color: #5a7a48;
                margin-top: -6px; padding-bottom: 6px;
            }
            .rnd-h2h-goals-summary span { color: #8abc78; font-weight: 700; }

            /* ── Match list ── */
            .rnd-h2h-matches { padding-top: 4px; }
            .rnd-h2h-season {
                font-size: 9px; color: #4a7a3a; text-transform: uppercase;
                letter-spacing: 1.5px; padding: 12px 0 4px; font-weight: 700;
                border-bottom: 1px solid rgba(80,160,48,.08);
            }
            .rnd-h2h-match {
                position: relative;
                display: flex; align-items: center; gap: 0;
                padding: 7px 8px; margin: 2px 0; border-radius: 6px;
                font-size: 13px; cursor: pointer;
                transition: background 0.15s;
            }
            .rnd-h2h-match:hover { background: rgba(255,255,255,.05); }
            .rnd-h2h-match.h2h-readonly { cursor: default; }
            .rnd-h2h-match.h2h-win { border-left: 3px solid #5ab03a; }
            .rnd-h2h-match.h2h-loss { border-left: 3px solid #4a8ac8; }
            .rnd-h2h-match.h2h-draw { border-left: 3px solid #5a6a4a; }
            .rnd-h2h-date {
                color: #4a7a3a; font-size: 10px; width: 72px; flex-shrink: 0;
                font-weight: 500;
            }
            .rnd-h2h-type-badge {
                font-size: 8px; font-weight: 700; color: #6a9a58;
                background: rgba(0,0,0,.25); padding: 1px 5px;
                border-radius: 3px; text-transform: uppercase;
                letter-spacing: 0.5px; flex-shrink: 0; margin-right: 8px;
                width: 100px;
            }
            .rnd-h2h-home {
                margin-left: 16px; text-align: right; color: #b8d8a0;
                font-size: 12px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis; padding-right: 8px;
            }
            .rnd-h2h-result {
                font-weight: 800; color: #e0f0d0; width: 44px;
                text-align: center; font-size: 14px; flex-shrink: 0;
                letter-spacing: 1px;
            }
            .rnd-h2h-away {
                flex: 1; text-align: left; color: #b8d8a0;
                font-size: 12px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis; padding-left: 8px;
            }
            .rnd-h2h-home.winner { color: #6adc3a; font-weight: 700; }
            .rnd-h2h-away.winner { color: #6adc3a; font-weight: 700; }
            .rnd-h2h-att {
                font-size: 9px; color: #3a6a2a; width: 50px;
                text-align: right; flex-shrink: 0; font-variant-numeric: tabular-nums;
            }

            /* ── Hover tooltip ── */
            .rnd-h2h-tooltip {
                position: absolute; z-index: 100;
                background: #111f0a; border: 1px solid rgba(80,160,48,.25);
                border-radius: 10px; padding: 18px 24px;
                min-width: 520px; max-width: 600px;
                box-shadow: 0 8px 32px rgba(0,0,0,.6);
                pointer-events: none; opacity: 0;
                transition: opacity 0.15s;
                left: 50%; top: 100%; transform: translateX(-50%);
                margin-top: 4px;
            }
            .rnd-h2h-tooltip.visible { opacity: 1; }
            .rnd-h2h-tooltip-header {
                display: flex; align-items: center; justify-content: center;
                gap: 14px; padding-bottom: 12px; margin-bottom: 10px;
                border-bottom: 1px solid rgba(80,160,48,.12);
            }
            .rnd-h2h-tooltip-logo {
                width: 40px; height: 40px; object-fit: contain;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,.4));
            }
            .rnd-h2h-tooltip-team {
                font-size: 15px; font-weight: 700; color: #c8e4b0;
                max-width: 180px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis;
            }
            .rnd-h2h-tooltip-score {
                font-size: 28px; font-weight: 800; color: #fff;
                letter-spacing: 3px;
                text-shadow: 0 0 16px rgba(128,224,64,.15);
            }
            .rnd-h2h-tooltip-meta {
                display: flex; align-items: center; justify-content: center;
                gap: 18px; font-size: 11px; color: #5a7a48;
                margin-bottom: 10px;
            }
            .rnd-h2h-tooltip-meta span { display: flex; align-items: center; gap: 3px; }
            .rnd-h2h-tooltip-events {
                display: flex; flex-direction: column; gap: 5px;
            }
            .rnd-h2h-tooltip-evt {
                display: flex; align-items: center; gap: 10px;
                font-size: 13px; color: #a0c890; padding: 3px 0;
            }
            .rnd-h2h-tooltip-evt.away-evt { flex-direction: row-reverse; text-align: right; }
            .rnd-h2h-tooltip-evt.away-evt .rnd-h2h-tooltip-evt-min { text-align: left; }
            .rnd-h2h-tooltip-evt-min {
                font-weight: 700; color: #80b868; min-width: 32px;
                font-size: 13px; text-align: right; flex-shrink: 0;
            }
            .rnd-h2h-tooltip-evt-icon { flex-shrink: 0; font-size: 16px; }
            .rnd-h2h-tooltip-evt-text { color: #b8d8a0; }
            .rnd-h2h-tooltip-evt-assist {
                font-size: 12px; color: #5a8a48; font-weight: 500; margin-left: 2px;
            }
            .rnd-h2h-tooltip-mom {
                margin-top: 10px; padding-top: 10px;
                border-top: 1px solid rgba(80,160,48,.1);
                font-size: 13px; color: #6a9a58; text-align: center;
            }
            .rnd-h2h-tooltip-mom span { color: #e8d44a; font-weight: 700; }

            /* ── Rich tooltip extras ── */
            .rnd-h2h-tooltip-divider {
                height: 1px; background: rgba(80,160,48,.1); margin: 8px 0;
            }
            .rnd-h2h-tooltip-stats {
                display: grid; grid-template-columns: 1fr auto 1fr; gap: 4px 12px;
                margin: 10px 0; font-size: 14px;
            }
            .rnd-h2h-tooltip-stat-home {
                text-align: right; font-weight: 700; color: #b8d8a0;
            }
            .rnd-h2h-tooltip-stat-label {
                text-align: center; font-size: 10px; color: #5a7a48;
                text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;
                padding: 0 6px;
            }
            .rnd-h2h-tooltip-stat-away {
                text-align: left; font-weight: 700; color: #b8d8a0;
            }
            .rnd-h2h-tooltip-stat-home.leading { color: #6adc3a; }
            .rnd-h2h-tooltip-stat-away.leading { color: #6adc3a; }
            .rnd-h2h-tooltip-subs {
                display: flex; flex-direction: column; gap: 3px;
                margin-top: 6px;
            }
            .rnd-h2h-tooltip-sub {
                display: flex; align-items: center; gap: 8px;
                font-size: 11px; color: #7aaa68;
            }
            /* (subs section currently unused) */
            .rnd-h2h-tooltip-sub-icon { flex-shrink: 0; }
            .rnd-h2h-tooltip-ratings {
                display: flex; justify-content: space-between;
                margin-top: 10px; padding-top: 10px;
                border-top: 1px solid rgba(80,160,48,.1);
            }
            .rnd-h2h-tooltip-rating-side {
                display: flex; flex-direction: column; gap: 3px; font-size: 12px;
            }
            .rnd-h2h-tooltip-rating-side.away { align-items: flex-end; }
            .rnd-h2h-tooltip-rating-player {
                display: flex; align-items: center; gap: 6px; color: #8ab878;
            }
            .rnd-h2h-tooltip-rating-player .r-val {
                font-weight: 800; min-width: 28px; font-size: 13px;
            }
            .rnd-h2h-tooltip-rating-player .r-val.high { color: #6adc3a; }
            .rnd-h2h-tooltip-rating-player .r-val.mid { color: #c8c848; }
            .rnd-h2h-tooltip-rating-player .r-val.low { color: #c86a4a; }
            .rnd-h2h-tooltip-loading {
                text-align: center; padding: 8px;
                font-size: 10px; color: #5a7a48;
            }
        `;
        document.head.appendChild(style);
    };

    // ─── Match cache & rating cells ─────────────────────────────────────
    const roundMatchCache = new Map(); // matchId -> {homeR5, awayR5, data}

    const fillRatingCells = (matchId, homeR5, awayR5) => {
        const hEl = document.getElementById(`rnd-r-h-${matchId}`);
        const aEl = document.getElementById(`rnd-r-a-${matchId}`);
        if (hEl) {
            hEl.textContent = homeR5.toFixed(2);
            hEl.style.color = getColor(homeR5, R5_THRESHOLDS);
        }
        if (aEl) {
            aEl.textContent = awayR5.toFixed(2);
            aEl.style.color = getColor(awayR5, R5_THRESHOLDS);
        }
    };

    // ─── Match dialog ────────────────────────────────────────────────────
    // ── Live replay state (shared across tabs) ──
    let liveState = null;
    // liveState = { min, sec, curEvtIdx, curLineIdx, playing, timer, mData, speed:1000,
    //               maxMin, ended, schedule, eventMinList, eventMinIdx }

    // ── Unity 3D integration state ──
    let unityState = {
        available: false,       // gameInstance exists on page
        ready: false,           // lineup loaded, ready to play clips
        playing: false,         // currently playing a clip sequence
        pendingMinute: null,    // minute waiting for finished_loading
        loadedMinutes: [],      // minutes that finished loading
        playedMinutes: [],      // minutes that finished playing
        canvasParent: null,     // original parent of the Unity canvas
        tmPaused: false,        // whether we've paused TM's replay
        clipTextQueue: [],      // flat list of {evtIdx, lineIdx} for current minute (first event only)
        clipTextCursor: 0,      // how many text lines we've shown
        clipTextGroups: [],     // group boundaries [{start, count}]
        clipGroupCursor: 0,     // how many groups we've shown
        clipPostQueue: [],      // remaining events' text, shown after animation
        activeMinute: null,     // the minute currently being clip-played
        clipFirstShown: false,  // whether first text group was shown on starting_clip
        clipSkippedFirst: false, // whether we skipped the first finished_clip
    };

    // ── Unity integration helpers ──
    const getUW = () => {
        return typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    };

    const initUnity = () => {
        if (!isMatchPage) return;
        const uw = getUW();
        const poll = setInterval(() => {
            if (uw.gameInstance || uw.gameInstanceLoaded) {
                clearInterval(poll);
                unityState.available = true;
                unityState.ready = true;  // flash_ready already fired before our override
                console.log('[RND] Unity gameInstance detected, assuming ready');
                stopTMReplay();
                setupStargateOverride();
                // If Lineups tab already rendered, move canvas immediately
                const vp = document.getElementById('rnd-unity-viewport');
                if (vp) {
                    moveUnityCanvas();
                    vp.style.display = 'block';
                }
                // Auto-play live match if paused (e.g. page refresh)
                if (liveState && !liveState.playing && !liveState.ended) {
                    console.log('[RND] Auto-playing live match after Unity detected');
                    livePlay();
                }
            }
        }, 500);
        setTimeout(() => clearInterval(poll), 30000);
    };

    const stopTMReplay = () => {
        const uw = getUW();
        if (unityState.tmPaused) return;
        unityState.tmPaused = true;
        // Pause TM's replay system completely
        if (uw.flash_status) {
            uw.flash_status.playback_mode = 'pause';
            uw.flash_status.enabled = false;  // prevent TM from sending clips
        }
        // Kill TM's run_match loop
        uw._orig_run_match = uw.run_match;
        uw.run_match = function () { /* noop */ };
        // Also kill TM's text display functions so they don't interfere
        if (uw.show_next_action_text_entry) {
            uw._orig_show_next_action_text_entry = uw.show_next_action_text_entry;
            uw.show_next_action_text_entry = function () { /* noop */ };
        }
        if (uw.prepare_next_minute) {
            uw._orig_prepare_next_minute = uw.prepare_next_minute;
            uw.prepare_next_minute = function () { /* noop */ };
        }
        // Clear any pending setTimeout from TM's run_match chain
        // (clear a range of recent timer IDs to catch the pending one)
        const lastId = setTimeout(() => { }, 0);
        for (let i = lastId - 20; i <= lastId; i++) {
            clearTimeout(i);
        }
        console.log('[RND] TM replay stopped completely');
    };

    // Build flat text-line queue for a minute
    // Only the FIRST event is synced to the animation (distributed by groups over clip duration)
    // Remaining events are queued as postQueue, shown after animation finishes
    const buildClipTextQueue = (mData, minute) => {
        const report = mData.report || {};
        const evts = report[String(minute)] || [];
        const queue = [];
        const groups = []; // each entry = { start, count } into queue
        const postQueue = []; // remaining events' text lines
        evts.forEach((evt, evtIdx) => {
            if (!evt.chance || !evt.chance.text) return;
            let flatIdx = 0;
            if (evtIdx === 0) {
                // First event: animation-synced text
                evt.chance.text.forEach(textArr => {
                    const groupStart = queue.length;
                    let groupCount = 0;
                    textArr.forEach(line => {
                        if (!line || !line.trim()) return;
                        queue.push({ evtIdx, lineIdx: flatIdx });
                        flatIdx++;
                        groupCount++;
                    });
                    if (groupCount > 0) groups.push({ start: groupStart, count: groupCount });
                });
            } else {
                // Remaining events: post-animation text
                evt.chance.text.forEach(textArr => {
                    textArr.forEach(line => {
                        if (!line || !line.trim()) return;
                        postQueue.push({ evtIdx, lineIdx: flatIdx });
                        flatIdx++;
                    });
                });
            }
        });
        return { queue, groups, postQueue };
    };

    // Show ONE text line from the clip queue
    const advanceClipTextOneLine = () => {
        if (!liveState || !unityState.clipTextQueue.length) return;
        const idx = unityState.clipTextCursor;
        if (idx >= unityState.clipTextQueue.length) return;
        const entry = unityState.clipTextQueue[idx];
        unityState.clipTextCursor = idx + 1;

        liveState.curEvtIdx = entry.evtIdx;
        liveState.curLineIdx = entry.lineIdx;

        // Check if this event is complete
        const report = liveState.mData.report || {};
        const evts = report[String(liveState.min)] || [];
        const evt = evts[entry.evtIdx];
        const total = evt ? countEventLines(evt) : 1;
        const isComplete = entry.lineIdx >= total - 1;
        liveState.curEvtComplete = isComplete;
        liveState.justCompleted = isComplete;

        updateLiveHeader();
        refreshActiveTab();
        // Also update the unity side panels
        updateUnityFeed();
        // Only update stats when event is fully complete
        if (isComplete) updateUnityStats();
    };

    // ── Update the left-side feed panel next to viewport (current minute only) ──
    const updateUnityFeed = () => {
        const container = $('#rnd-unity-feed');
        if (!container.length || !liveState) return;
        const mData = liveState.mData;
        const report = mData.report || {};
        const playerNames = buildPlayerNames(mData);
        const curMin = liveState.min;
        const curEvtIdx = liveState.curEvtIdx;
        const curLineIdx = liveState.curLineIdx;
        const allLines = [];
        // Only show events for the CURRENT minute
        const evts = report[String(curMin)] || [];
        for (let ei = 0; ei < evts.length; ei++) {
            if (!isEventVisible(curMin, ei, curMin, curEvtIdx)) continue;
            const evt = evts[ei];
            if (!evt || !evt.chance || !evt.chance.text) continue;
            let flatIdx = 0;
            evt.chance.text.forEach(textArr => {
                textArr.forEach(line => {
                    if (!line || !line.trim()) return;
                    if (ei === curEvtIdx && flatIdx > curLineIdx) { flatIdx++; return; }
                    allLines.push({ min: curMin, text: line });
                    flatIdx++;
                });
            });
        }
        let html = '';
        allLines.forEach(item => {
            let resolved = resolvePlayerTags(item.text, playerNames);
            resolved = resolved.replace(/\[(goal|yellow|red|sub|assist)\]/g, '');
            html += `<div class="rnd-unity-feed-line"><span class="rnd-unity-feed-min">${item.min}'</span><span class="rnd-unity-feed-text">${resolved}</span></div>`;
        });
        container.html(html);
        // Auto-scroll to bottom
        container.scrollTop(container[0].scrollHeight);
    };

    // ── Update the right-side mini stats panel next to viewport ──
    const updateUnityStats = () => {
        const container = $('#rnd-unity-stats');
        if (!container.length || !liveState) return;
        const mData = liveState.mData;
        const homeId = String(mData.club.home.id);
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const report = mData.report || {};
        const curMin = liveState.min;
        const curEvtIdx = liveState.curEvtIdx;
        let hShots = 0, aShots = 0, hSoT = 0, aSoT = 0, hGoals = 0, aGoals = 0;
        let hYellow = 0, aYellow = 0, hRed = 0, aRed = 0, hSetPieces = 0, aSetPieces = 0;
        const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
        for (const min of sortedMins) {
            const evts = report[String(min)] || [];
            for (let ei = 0; ei < evts.length; ei++) {
                if (!isEventVisible(min, ei, curMin, curEvtIdx)) continue;
                const evt = evts[ei];
                if (!evt || !evt.parameters) continue;
                evt.parameters.forEach(p => {
                    if (p.shot) {
                        const isHome = String(p.shot.team) === homeId;
                        if (isHome) { hShots++; if (p.shot.target === 'on') hSoT++; }
                        else { aShots++; if (p.shot.target === 'on') aSoT++; }
                    }
                    if (p.goal) {
                        const scorerId = String(p.goal.player);
                        const isHome = homeIds.has(scorerId);
                        if (isHome) hGoals++; else aGoals++;
                    }
                    if (p.yellow) {
                        if (homeIds.has(String(p.yellow))) hYellow++; else aYellow++;
                    }
                    if (p.yellow_red) {
                        if (homeIds.has(String(p.yellow_red))) hRed++; else aRed++;
                    }
                    if (p.red) {
                        if (homeIds.has(String(p.red))) hRed++; else aRed++;
                    }
                    if (p.set_piece) {
                        if (homeIds.has(String(p.set_piece))) hSetPieces++; else aSetPieces++;
                    }
                });
            }
        }
        const miniBar = (label, hv, av) => {
            const total = hv + av;
            const hp = total === 0 ? 50 : Math.round(hv / total * 100);
            const ap = 100 - hp;
            const hLead = hv > av ? ' lead' : '';
            const aLead = av > hv ? ' lead' : '';
            return `<div class="rnd-unity-stat-row">
                <div class="rnd-unity-stat-hdr"><span class="val home${hLead}">${hv}</span><span class="rnd-unity-stat-label">${label}</span><span class="val away${aLead}">${av}</span></div>
                <div class="rnd-unity-stat-bar"><div class="seg home" style="width:${hp}%"></div><div class="seg away" style="width:${ap}%"></div></div>
            </div>`;
        };
        let h = '';
        h += miniBar('Shots', hShots, aShots);
        h += miniBar('On Target', hSoT, aSoT);
        h += miniBar('Goals', hGoals, aGoals);
        h += miniBar('Yellow', hYellow, aYellow);
        h += miniBar('Red', hRed, aRed);
        h += miniBar('Set Pieces', hSetPieces, aSetPieces);
        container.html(h);
    };

    // Flush all remaining text lines at once (for finished_playing)
    const flushClipText = () => {
        if (!liveState) return;
        // Flush remaining animation text (first event)
        while (unityState.clipTextCursor < unityState.clipTextQueue.length) {
            advanceClipTextOneLine();
        }
        // Append and flush post-animation text (remaining events)
        if (unityState.clipPostQueue && unityState.clipPostQueue.length > 0) {
            unityState.clipPostQueue.forEach(entry => {
                unityState.clipTextQueue.push(entry);
            });
            unityState.clipPostQueue = [];
            while (unityState.clipTextCursor < unityState.clipTextQueue.length) {
                advanceClipTextOneLine();
            }
        }
    };

    // Advance the next text group (called on each finished_clip from Unity)
    const advanceClipTextGroup = () => {
        const groups = unityState.clipTextGroups || [];
        const gi = unityState.clipGroupCursor || 0;
        if (gi >= groups.length) return;
        const group = groups[gi];
        // Show all lines in this group at once
        for (let j = 0; j < group.count; j++) {
            if (unityState.clipTextCursor < unityState.clipTextQueue.length) {
                advanceClipTextOneLine();
            }
        }
        unityState.clipGroupCursor = gi + 1;
        console.log('[RND] Advanced text group ' + gi + ' (' + group.count + ' lines)');
    };

    const setupStargateOverride = () => {
        const uw = getUW();
        uw._orig_stargate = uw.stargate;
        uw.stargate = function (vars) {
            console.log('[RND] stargate:', JSON.stringify(vars));

            if (vars.flash_ready) {
                unityState.ready = true;
                console.log('[RND] Unity ready');
            }

            if (vars.finished_loading) {
                const min = vars.finished_loading.id;
                unityState.loadedMinutes.push(min);
                console.log('[RND] Clips loaded for minute', min);
                if (unityState.pendingMinute === min) {
                    unityState.pendingMinute = null;
                    playUnityClips(min);
                }
            }

            // A single clip finished → show the next text group
            // Skip the first finished_clip because its text was already shown on starting_clip
            if (vars.finished_clip) {
                if (unityState.clipFirstShown && !unityState.clipSkippedFirst) {
                    // First clip just finished; text was already shown via starting_clip
                    unityState.clipSkippedFirst = true;
                    console.log('[RND] Skipping finished_clip for group 0 (already shown on start)');
                } else {
                    advanceClipTextGroup();
                }
            }

            // A clip is starting
            if (vars.starting_clip) {
                unityState.playing = true;
                // Show first text group immediately when the first clip starts
                if (!unityState.clipFirstShown) {
                    unityState.clipFirstShown = true;
                    advanceClipTextGroup();
                }
                // Goal clip → update score after a short delay
                if (vars.starting_clip.clip && vars.starting_clip.clip.substring(0, 4) === 'goal') {
                    setTimeout(() => {
                        updateLiveHeader();
                        refreshActiveTab();
                    }, 1200);
                }
            }

            // All clips for a minute finished → let timer advance to next minute
            if (vars.finished_playing) {
                const min = vars.finished_playing.id;
                unityState.playedMinutes.push(min);
                unityState.playing = false;
                console.log('[RND] All clips finished for minute', min);
                // Show any remaining lines
                flushClipText();
                // Clear activeMinute so liveStep resumes normal schedule-based flow
                unityState.activeMinute = null;
                // Force sec to 59 so liveStep advances to next minute on next tick
                if (liveState) {
                    liveState.sec = 59;
                    // Apply deferred filter switch if pending
                    if (liveState.pendingFilterSwitch) {
                        applyFilterSwitch(liveState.pendingFilterSwitch);
                    }
                }
            }
        };
    };

    // Save canvas to a hidden container so it survives tab switches
    const saveUnityCanvas = () => {
        if (!isMatchPage || !unityState.available) return;
        const webglContent = document.querySelector('.webgl-content');
        if (!webglContent) return;
        // Don't save if already in safe container
        if (webglContent.parentElement && webglContent.parentElement.id === 'rnd-unity-safe') return;
        let safe = document.getElementById('rnd-unity-safe');
        if (!safe) {
            safe = document.createElement('div');
            safe.id = 'rnd-unity-safe';
            safe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
            document.body.appendChild(safe);
        }
        safe.appendChild(webglContent);
        console.log('[RND] Canvas saved to safe container');
    };

    const moveUnityCanvas = () => {
        if (!isMatchPage || !unityState.available) return;
        const webglContent = document.querySelector('.webgl-content');
        if (!webglContent) return;
        const target = document.getElementById('rnd-unity-viewport');
        if (!target) return;
        // Remember original parent so we could restore if needed
        if (!unityState.canvasParent) unityState.canvasParent = webglContent.parentElement;
        // Move the .webgl-content into our viewport
        target.innerHTML = '';
        target.appendChild(webglContent);
        // Make .webgl-content visible (TM hides it initially)
        webglContent.style.display = 'block';
        // Clear inline dimensions on #gameContainer (it has width:300px;height:200px)
        const gc = document.getElementById('gameContainer');
        if (gc) {
            gc.style.width = '100%';
            gc.style.height = '100%';
            gc.style.margin = '0';
        }
        // Show viewport
        target.style.display = 'block';
        console.log('[RND] Canvas moved into viewport');
        // Sync feed & stats height to viewport height
        syncUnityPanelHeights();
    };

    // Keep feed and stats panels the same height as the viewport
    const syncUnityPanelHeights = () => {
        const vp = document.getElementById('rnd-unity-viewport');
        if (!vp) return;
        requestAnimationFrame(() => {
            const h = vp.offsetHeight;
            if (!h) return;
            const feed = document.getElementById('rnd-unity-feed');
            const stats = document.getElementById('rnd-unity-stats');
            if (feed) feed.style.maxHeight = h + 'px';
            if (stats) stats.style.maxHeight = h + 'px';
        });
    };

    const loadUnityClips = (minute, mData) => {
        const uw = getUW();
        if (!unityState.available || !uw.gameInstance) return false;
        const report = mData.report || {};
        const evts = report[String(minute)] || [];
        const videoList = [];
        evts.forEach(evt => {
            if (evt.chance && evt.chance.video) {
                const v = evt.chance.video;
                if (Array.isArray(v)) {
                    videoList.push(...v);
                } else {
                    videoList.push(v);
                }
            }
        });
        if (videoList.length === 0) return false;
        console.log('[RND] Loading clips for minute', minute, videoList.length, 'clips');
        // Prepare the text queue for this minute
        const { queue, groups, postQueue } = buildClipTextQueue(mData, minute);
        unityState.clipTextQueue = queue;
        unityState.clipTextGroups = groups;
        unityState.clipPostQueue = postQueue;
        unityState.clipTextCursor = 0;
        unityState.clipGroupCursor = 0;
        unityState.activeMinute = minute;
        unityState.clipFirstShown = false;
        unityState.clipSkippedFirst = false;
        unityState.pendingMinute = minute;
        uw.gameInstance.SendMessage('ClipsViewerScript', 'PrepareMinute', JSON.stringify({
            queue: videoList,
            id: minute
        }));
        return true;
    };

    const playUnityClips = (minute) => {
        const uw = getUW();
        if (!unityState.available || !uw.gameInstance) return;
        unityState.playing = true;
        console.log('[RND] Playing clips for minute', minute);
        uw.gameInstance.SendMessage('ClipsViewerScript', 'PlayMinute', JSON.stringify({ id: minute }));
    };

    const LINE_INTERVAL = 3;  // seconds between lines within a minute
    const POST_DELAY = 3;     // seconds after last line before advancing to next minute

    // ── Count total non-empty lines in an event's chance.text ──
    const countEventLines = (evt) => {
        if (!evt.chance || !evt.chance.text) return 1;
        let n = 0;
        evt.chance.text.forEach(textArr => {
            textArr.forEach(line => { if (line && line.trim()) n++; });
        });
        return Math.max(1, n);
    };

    // ── Calculate current match minute from kickoff timestamp ──
    const calculateLiveMinute = (kickoff) => {
        const now = Math.floor(Date.now() / 1000);
        const elapsed = now - kickoff;
        if (elapsed < 0) return null; // not started
        const FIRST_HALF = 45 * 60;  // 2700s
        const HT_BREAK = 15 * 60;  // 900s
        if (elapsed < FIRST_HALF) {
            return { minute: Math.floor(elapsed / 60), second: elapsed % 60, isHT: false };
        } else if (elapsed < FIRST_HALF + HT_BREAK) {
            return { minute: 45, second: 0, isHT: true };
        } else {
            const sh = elapsed - FIRST_HALF - HT_BREAK;
            return { minute: 45 + Math.floor(sh / 60), second: sh % 60, isHT: false };
        }
    };

    // ── Check if match is currently in progress (via API's live_min) ──
    const isMatchCurrentlyLive = (mData) => {
        const lm = mData.match_data?.live_min;
        return typeof lm === 'number' && lm > 0;
    };

    // ── Check if match is in the future (not yet started) ──
    const isMatchFuture = (mData) => {
        const md = mData.match_data;
        // Negative live_min means countdown to kickoff → match is in the future
        const lm = md?.live_min;
        if (typeof lm === 'number' && lm < 0) return true;
        // Positive live_min means match is in progress
        if (typeof lm === 'number' && lm > 0) return false;
        // Fallback: check kickoff timestamp
        const ko = md?.venue?.kickoff;
        if (ko) {
            const now = Math.floor(Date.now() / 1000);
            return Number(ko) > now;
        }
        return false;
    };

    // ── Derive effective kickoff timestamp from API's live_min ──
    // live_min = total real elapsed minutes since kickoff (includes HT break).
    // calculateLiveMinute then handles the 45min/15min-HT/second-half split.
    const deriveKickoff = (mData) => {
        const lm = mData.match_data.live_min;
        const now = Math.floor(Date.now() / 1000);
        return now - Math.round(lm * 60);
    };

    // ── Build per-minute schedule: which lines appear at which second ──
    const buildSchedule = (report, keyOnly = false) => {
        const schedule = {};     // min → [{evtIdx, lineIdx, sec}]
        const eventMinList = []; // sorted list of minutes that have events
        const mins = Object.keys(report).map(Number).sort((a, b) => a - b);
        mins.forEach(min => {
            const evts = report[min] || [];
            const entries = [];
            let secCursor = 0;
            evts.forEach((evt, evtIdx) => {
                if (keyOnly && evt.severity !== 1) return;
                const lineCount = countEventLines(evt);
                for (let li = 0; li < lineCount; li++) {
                    entries.push({ evtIdx, lineIdx: li, sec: secCursor });
                    secCursor += LINE_INTERVAL;
                }
            });
            if (entries.length > 0) {
                schedule[min] = entries;
                eventMinList.push(min);
            }
        });
        return { schedule, eventMinList };
    };

    // ── Check if an event is visible at the current live step (event-level) ──
    const isEventVisible = (evtMin, evtIdx, curMin, curEvtIdx) => {
        if (evtMin < curMin) return true;
        if (evtMin === curMin && evtIdx <= curEvtIdx) return true;
        return false;
    };

    // ── Compute score up to current step ──
    const scoreAtStep = (mData, curMin, curEvtIdx) => {
        const score = [0, 0];
        const homeId = String(mData.club.home.id);
        const report = mData.report || {};
        Object.keys(report).forEach(minKey => {
            const min = Number(minKey);
            (report[minKey] || []).forEach((evt, si) => {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(p => {
                    if (p.goal) {
                        if (String(evt.club) === homeId) score[0]++; else score[1]++;
                    }
                });
            });
        });
        return score;
    };

    // ── Compute active roster at current step (subs + red cards) ──
    // Returns { home: Set<playerId>, away: Set<playerId>, subbedPositions: Map<playerId, position> }
    const computeActiveRoster = (mData, curMin, curEvtIdx) => {
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const homeActive = new Set();
        const awayActive = new Set();
        // Start with starters
        Object.values(mData.lineup.home).forEach(p => {
            if (!p.position.includes('sub')) homeActive.add(String(p.player_id));
        });
        Object.values(mData.lineup.away).forEach(p => {
            if (!p.position.includes('sub')) awayActive.add(String(p.player_id));
        });

        // Track position of subbed-in players (inherit from subbed-out player)
        const subbedPositions = new Map(); // player_id → position

        const report = mData.report || {};
        Object.keys(report).forEach(minKey => {
            const min = Number(minKey);
            (report[minKey] || []).forEach((evt, si) => {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.sub) {
                        const inId = String(param.sub.player_in);
                        const outId = String(param.sub.player_out);
                        const isHome = homeActive.has(outId) || homeIds.has(outId);
                        // Find position of outgoing player
                        const outPlayer = mData.lineup[isHome ? 'home' : 'away'][outId];
                        const outPos = subbedPositions.get(outId) || (outPlayer ? outPlayer.position : null);
                        if (outPos) subbedPositions.set(inId, outPos);
                        if (isHome) { homeActive.delete(outId); homeActive.add(inId); }
                        else { awayActive.delete(outId); awayActive.add(inId); }
                    }
                    if (param.red || param.yellow_red) {
                        const pid = String(param.red || param.yellow_red);
                        homeActive.delete(pid);
                        awayActive.delete(pid);
                    }
                });
            });
        });
        return { homeActive, awayActive, subbedPositions };
    };

    // ── Update live header (score + minute + progress) ──
    const updateLiveHeader = () => {
        if (!liveState) return;
        // Defer score update: don't count current event's goal until all its text lines are shown
        const scoreEvtIdx = (!liveState.ended && !liveState.curEvtComplete) ? liveState.curEvtIdx - 1 : liveState.curEvtIdx;
        const s = scoreAtStep(liveState.mData, liveState.min, scoreEvtIdx);
        $('#rnd-overlay .rnd-dlg-score').text(`${s[0]} - ${s[1]}`);
        const minDisplay = liveState.ended ? 'FT'
            : liveState.liveIsHT ? 'HT'
                : `${liveState.min}:${String(liveState.sec).padStart(2, '0')}`;
        $('#rnd-live-min-head').text(minDisplay);
        const maxMin = liveState.maxMin || 90;
        const pct = Math.min(100, Math.round((liveState.min * 60 + liveState.sec) / (maxMin * 60) * 100));
        $('#rnd-live-progress-head').css('width', pct + '%');
        if (liveState.ended) {
            $('#rnd-overlay .rnd-dlg-head').removeClass('rnd-live-active');
            $('#rnd-live-play-head').html('▶');
        }
        // Live-update mentality chips from report mentality_change events
        if (liveState.mData) {
            const mentalityMapH = { 1: 'V.Def', 2: 'Def', 3: 'Sl.Def', 4: 'Normal', 5: 'Sl.Att', 6: 'Att', 7: 'V.Att' };
            const homeClubId = String(liveState.mData.club.home.id);
            const awayClubId = String(liveState.mData.club.away.id);
            const mdH = liveState.mData.match_data;
            const curMent = {
                home: Number(mdH.mentality ? mdH.mentality.home : 4),
                away: Number(mdH.mentality ? mdH.mentality.away : 4)
            };
            const rpt = liveState.mData.report || {};
            Object.keys(rpt).forEach(mk => {
                const eMin = Number(mk);
                (rpt[mk] || []).forEach((evt, si) => {
                    if (!isEventVisible(eMin, si, liveState.min, scoreEvtIdx)) return;
                    if (!evt.parameters) return;
                    evt.parameters.forEach(p => {
                        if (p.mentality_change) {
                            const tid = String(p.mentality_change.team);
                            if (tid === homeClubId) curMent.home = Number(p.mentality_change.mentality);
                            else if (tid === awayClubId) curMent.away = Number(p.mentality_change.mentality);
                        }
                    });
                });
            });
            const hChip = $('#rnd-chip-ment-home');
            if (hChip.length) hChip.find('.chip-val').text(mentalityMapH[curMent.home] || curMent.home);
            const aChip = $('#rnd-chip-ment-away');
            if (aChip.length) aChip.find('.chip-val').text(mentalityMapH[curMent.away] || curMent.away);
        }
    };



    // ── Refresh whichever tab is active ──
    const refreshActiveTab = () => {
        if (!liveState) return;
        const tab = $('#rnd-overlay .rnd-tab.active').attr('data-tab');
        if (!tab) return;
        // When match ended/skipped, always do full render
        if (liveState.ended) {
            renderDialogTab(tab, liveState.mData);
            return;
        }
        // Report tab: append/update lines from schedule for current minute
        if (tab === 'report') {
            const entries = liveState.schedule[liveState.min] || [];
            const maxLinePerEvt = {};
            entries.forEach(e => {
                if (e.sec <= liveState.sec) {
                    if (maxLinePerEvt[e.evtIdx] === undefined || e.lineIdx > maxLinePerEvt[e.evtIdx]) {
                        maxLinePerEvt[e.evtIdx] = e.lineIdx;
                    }
                }
            });
            Object.entries(maxLinePerEvt).forEach(([eidx, lidx]) => {
                appendReportText(liveState.mData, liveState.min, Number(eidx), lidx);
            });
            return;
        }
        // Details tab: re-render only when an event just became complete (all text shown)
        if (tab === 'details') {
            if (liveState.justCompleted) renderDialogTab(tab, liveState.mData);
            return;
        }
        // Statistics tab: same — only re-render on event completion
        if (tab === 'statistics') {
            if (liveState.justCompleted) renderDialogTab(tab, liveState.mData);
            return;
        }
        // Lineups tab: re-render only when an event completes (goals, subs, etc. deferred)
        if (tab === 'lineups') {
            if (liveState.justCompleted) renderDialogTab(tab, liveState.mData);
            return;
        }
        // Other tabs: don't re-render during live
    };

    // ── Build HTML for a single report event accordion ──
    // maxLineIdx: how many individual lines to show (-1 = all)
    // hideBadges: when true, hide goal/red/sub badges (show text preview instead)
    const buildReportEventHtml = (evt, min, evtIdx, playerNames, homeId, maxLineIdx = -1, hideBadges = false) => {
        const chance = evt.chance;
        if (!chance || !chance.text) return '';

        const evtClub = String(evt.club || 0);
        const isHome = evtClub === homeId;
        const isNeutral = !evt.club || evtClub === '0';

        let headerBadges = '';
        let hasEvents = false;
        if (evt.parameters && !hideBadges) {
            evt.parameters.forEach(param => {
                if (param.goal) {
                    hasEvents = true;
                    const scorer = playerNames[param.goal.player] || '?';
                    const score = param.goal.score ? param.goal.score.join('-') : '';
                    let b = `⚽ ${scorer}`;
                    if (score) b += ` (${score})`;
                    if (param.goal.assist) b += ` <span style="font-size:11px;color:#90b878">ast. ${playerNames[param.goal.assist] || '?'}</span>`;
                    headerBadges += `<div class="rnd-report-evt-badge evt-goal">${b}</div>`;
                }
                if (param.yellow) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-yellow">🟨 ${playerNames[param.yellow] || '?'}</div>`; }
                if (param.yellow_red) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-red">🟥🟨 ${playerNames[param.yellow_red] || '?'}</div>`; }
                if (param.red) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-red">🟥 ${playerNames[param.red] || '?'}</div>`; }
                if (param.injury) {
                    hasEvents = true;
                    headerBadges += `<div class="rnd-report-evt-badge evt-injury"><span style="color:#ff3c3c;font-weight:800">✚</span> ${playerNames[param.injury] || '?'}</div>`;
                }
                if (param.sub) {
                    hasEvents = true;
                    const pIn = playerNames[param.sub.player_in] || '?';
                    const pOut = playerNames[param.sub.player_out] || '?';
                    headerBadges += `<div class="rnd-report-evt-badge evt-sub">🔄 ↑${pIn} ↓${pOut}</div>`;
                }
            });
        }

        // Build lines, respecting maxLineIdx limit (flat line count)
        const lines = [];
        let flatIdx = 0;
        chance.text.forEach((textArr) => {
            textArr.forEach(line => {
                if (!line || !line.trim()) return;
                if (maxLineIdx >= 0 && flatIdx > maxLineIdx) { flatIdx++; return; }
                let resolved = resolvePlayerTags(line, playerNames);
                resolved = resolved.replace(/\[goal\]/g, '<span class="rnd-goal-text">⚽ ');
                resolved = resolved.replace(/\[yellow\]/g, '<span class="rnd-yellow-text">🟨 ');
                resolved = resolved.replace(/\[red\]/g, '<span class="rnd-red-text">🟥 ');
                resolved = resolved.replace(/\[sub\]/g, '<span class="rnd-sub-text">🔄 ');
                resolved = resolved.replace(/\[assist\]/g, '');
                const openTags = (resolved.match(/<span class="rnd-(goal|yellow|red|sub)-text">/g) || []).length;
                for (let t = 0; t < openTags; t++) resolved += '</span>';
                lines.push(resolved);
                flatIdx++;
            });
        });

        const goalCls = headerBadges.includes('evt-goal') ? ' rnd-acc-goal' : '';
        const chevron = '<svg class="rnd-acc-chevron" viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>';
        let headerContent = headerBadges;
        if (!hasEvents) {
            const preview = lines.length ? lines[0] : '';
            headerContent = `<span style="color:#90b878;font-size:12px">${preview}</span>`;
        }

        const totalLines = countEventLines(evt);
        let html = `<div class="rnd-acc" data-acc="${min}-${evtIdx}" data-line-count="${maxLineIdx >= 0 ? maxLineIdx + 1 : totalLines}">`;
        html += `<div class="rnd-acc-head${goalCls}">`;
        html += `<div class="rnd-acc-home">${isHome ? headerContent : ''}</div>`;
        html += `<div class="rnd-acc-min">${min}'</div>`;
        html += `<div class="rnd-acc-away">${!isHome && !isNeutral ? headerContent : (isNeutral ? headerContent : '')}</div>`;
        html += chevron;
        html += `</div>`;
        html += `<div class="rnd-acc-body"><div class="rnd-report-text">${lines.join('<br>')}</div></div>`;
        html += `</div>`;
        return html;
    };

    // ── Append or update lines in the Report tab (line-level stepping) ──
    const appendReportText = (mData, curMin, curEvtIdx, curLineIdx) => {
        const container = $('#rnd-report-timeline');
        // If container doesn't exist, the Report tab hasn't been rendered yet — do full render
        if (!container.length) {
            renderDialogTab('report', mData);
            return;
        }

        const report = mData.report || {};
        const evts = report[String(curMin)] || [];
        const evt = evts[curEvtIdx];
        if (!evt || !evt.chance || !evt.chance.text) return;

        const playerNames = buildPlayerNames(mData);
        const homeId = String(mData.club.home.id);
        const key = `${curMin}-${curEvtIdx}`;
        const existing = container.find(`[data-acc="${key}"]`);

        // During live, hide badges until all lines of this event are shown
        const totalLines = countEventLines(evt);
        const isComplete = curLineIdx >= totalLines - 1;
        const hideBadges = liveState && !liveState.ended && !isComplete;

        if (existing.length) {
            // Event accordion already exists — update with one more line
            const oldCount = Number(existing.attr('data-line-count') || 0);
            if (curLineIdx < oldCount) return;  // already shown this line
            // Re-build the accordion with updated line count
            const newHtml = buildReportEventHtml(evt, curMin, curEvtIdx, playerNames, homeId, curLineIdx, hideBadges);
            if (!newHtml) return;
            const wasOpen = existing.hasClass('open');
            const $new = $(newHtml);
            if (wasOpen) $new.addClass('open');
            existing.replaceWith($new);
        } else {
            // New event — collapse all other accordions, then append with auto-open
            container.find('.rnd-acc.open').removeClass('open');
            const evtHtml = buildReportEventHtml(evt, curMin, curEvtIdx, playerNames, homeId, curLineIdx, hideBadges);
            if (!evtHtml) return;
            const $el = $(evtHtml).addClass('rnd-live-feed-line open');
            container.append($el);
        }

        // Auto-scroll the dialog body to show the latest content
        const dlgBody = $('#rnd-dlg-body');
        dlgBody.animate({ scrollTop: dlgBody[0].scrollHeight }, 300);
    };

    // ── Advance one second in the live replay ──
    const liveStep = () => {
        if (!liveState || !liveState.playing) return;

        // ── LIVE mode: wall-clock driven ticking ──
        if (liveState.filterMode === 'live') {
            const kickoff = liveState.liveKickoff;
            if (!kickoff) return;
            const info = calculateLiveMinute(kickoff);
            const lastMin = liveState.mData.match_data.last_min || 90;
            if (!info || info.minute > lastMin) {
                // Match ended
                liveState.min = lastMin; liveState.sec = 59;
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.ended = true; liveState.playing = false;
                liveState.liveIsHT = false;
                updateLiveHeader(); refreshActiveTab();
                return;
            }
            const prevMin = liveState.min;
            liveState.min = info.minute;
            liveState.sec = info.second;
            liveState.liveIsHT = info.isHT;
            if (info.isHT) {
                // Halftime — all first-half events visible, just tick clock
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.curEvtComplete = true;
                updateLiveHeader();
                liveState.timer = setTimeout(liveStep, liveState.speed);
                return;
            }
            // If Unity clips are playing for this minute, just tick the clock
            if (unityState.activeMinute === liveState.min) {
                updateLiveHeader();
                liveState.timer = setTimeout(liveStep, liveState.speed);
                return;
            }
            // Show all events up to current minute
            liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
            liveState.curEvtComplete = true;
            const minuteChanged = liveState.min !== prevMin;
            liveState.justCompleted = minuteChanged;
            // Load Unity clips when entering a new event minute
            if (minuteChanged && isMatchPage && unityState.available && unityState.ready) {
                const hasClips = loadUnityClips(liveState.min, liveState.mData);
                if (hasClips) {
                    // Clips loaded — animation will play, text driven by stargate callbacks
                    updateLiveHeader();
                    refreshActiveTab();
                    liveState.timer = setTimeout(liveStep, liveState.speed);
                    return;
                }
            }
            updateLiveHeader();
            if (minuteChanged) refreshActiveTab();
            liveState.timer = setTimeout(liveStep, liveState.speed);
            return;
        }

        liveState.sec++;

        // ── If Unity clips are active for this minute, just tick the clock ──
        if (unityState.activeMinute === liveState.min) {
            // Clock advances, but text is driven by stargate callbacks (advanceClipText)
            // Don't process schedule, don't advance minute — wait for finished_playing
            updateLiveHeader();
            liveState.timer = setTimeout(liveStep, liveState.speed);
            return;
        }

        // Check if current minute is finished (past last line + delay, or >= 60)
        const entries = liveState.schedule[liveState.min] || [];
        const lastSec = entries.length > 0 ? entries[entries.length - 1].sec : -1;
        const minuteEnd = lastSec + POST_DELAY;

        if (liveState.sec > minuteEnd || liveState.sec >= 60) {
            // Move to next event minute
            const nextIdx = liveState.eventMinIdx + 1;
            if (nextIdx >= liveState.eventMinList.length) {
                // Match finished
                liveState.min = liveState.maxMin;
                liveState.sec = 59;
                liveState.curEvtIdx = 999;
                liveState.curLineIdx = 999;
                liveState.playing = false;
                liveState.ended = true;
                updateLiveHeader();
                refreshActiveTab();
                return;
            }
            liveState.eventMinIdx = nextIdx;
            liveState.min = liveState.eventMinList[nextIdx];
            liveState.sec = 0;
            // Reset event tracking to prevent score from briefly showing future goals
            liveState.curEvtIdx = -1;
            liveState.curEvtComplete = false;

            // ── Unity 3D: trigger clip loading when entering a new minute with videos ──
            if (isMatchPage && unityState.available && unityState.ready) {
                const hasClips = loadUnityClips(liveState.min, liveState.mData);
                if (hasClips) {
                    // Timer keeps running — clock ticks, text driven by clip callbacks
                    updateLiveHeader();
                    liveState.timer = setTimeout(liveStep, liveState.speed);
                    return;
                }
            }
        }

        // Check schedule for new lines at current second (non-clip minutes only)
        let hasNew = false;
        liveState.justCompleted = false;
        const curEntries = liveState.schedule[liveState.min] || [];
        const report = liveState.mData.report || {};
        const evts = report[String(liveState.min)] || [];
        curEntries.forEach(entry => {
            if (entry.sec === liveState.sec) {
                liveState.curEvtIdx = entry.evtIdx;
                liveState.curLineIdx = entry.lineIdx;
                hasNew = true;
                // Check if event just became complete (all text lines shown)
                const evt = evts[entry.evtIdx];
                const total = evt ? countEventLines(evt) : 1;
                const isComplete = entry.lineIdx >= total - 1;
                liveState.curEvtComplete = isComplete;
                if (isComplete) liveState.justCompleted = true;
            }
        });

        updateLiveHeader();
        if (hasNew) refreshActiveTab();
        liveState.timer = setTimeout(liveStep, liveState.speed);
    };

    const livePlay = () => {
        if (!liveState || liveState.ended) return;
        liveState.playing = true;
        $('#rnd-live-play-head').html('⏸');
        // If Unity was paused mid-animation, unpause it
        if (unityState.activeMinute !== null) {
            const uw = getUW();
            if (uw.gameInstance) {
                uw.gameInstance.SendMessage('ClipsViewerScript', 'OnPauseGame');
            }
        }
        liveStep();
    };
    const livePause = () => {
        if (!liveState) return;
        liveState.playing = false;
        clearTimeout(liveState.timer);
        $('#rnd-live-play-head').html('▶');
        // Immediately pause Unity animation if playing
        if (unityState.playing && unityState.activeMinute !== null) {
            const uw = getUW();
            if (uw.gameInstance) {
                uw.gameInstance.SendMessage('ClipsViewerScript', 'OnPauseGame');
            }
        }
    };
    const liveToggle = () => {
        if (!liveState) return;
        if (liveState.playing) livePause(); else livePlay();
    };

    // Apply a deferred or immediate filter mode switch (All ↔ Key ↔ Live)
    const applyFilterSwitch = (mode) => {
        if (!liveState) return;
        // LIVE mode: switch to all-events schedule and jump to current wall-clock minute
        if (mode === 'live') {
            const sch = liveState.scheduleAll;
            liveState.schedule = sch.schedule;
            liveState.eventMinList = sch.eventMinList;
            liveState.maxMin = sch.eventMinList.length ? sch.eventMinList[sch.eventMinList.length - 1] : 90;
            let kickoff = liveState.liveKickoff;
            if (!kickoff && isMatchCurrentlyLive(liveState.mData)) {
                kickoff = deriveKickoff(liveState.mData);
                liveState.liveKickoff = kickoff;
            }
            const info = kickoff ? calculateLiveMinute(kickoff) : null;
            const lastMin = liveState.mData.match_data.last_min || 90;
            if (info && info.minute <= lastMin) {
                liveState.min = info.minute;
                liveState.sec = info.second;
                liveState.liveIsHT = info.isHT;
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.curEvtComplete = true; liveState.justCompleted = true;
                liveState.ended = false;
            } else {
                // Match over
                liveState.min = lastMin; liveState.sec = 59;
                liveState.curEvtIdx = 999; liveState.curLineIdx = 999;
                liveState.ended = true; liveState.playing = false;
                liveState.liveIsHT = false;
            }
            liveState.pendingFilterSwitch = null;
            console.log('[RND] Filter switch applied: live (min ' + liveState.min + ')');
            updateLiveHeader(); refreshActiveTab();
            return;
        }
        liveState.liveIsHT = false;
        const sch = mode === 'key' ? liveState.scheduleKey : liveState.scheduleAll;
        liveState.schedule = sch.schedule;
        liveState.eventMinList = sch.eventMinList;
        liveState.maxMin = sch.eventMinList.length ? sch.eventMinList[sch.eventMinList.length - 1] : 90;
        // Find next event minute AFTER current (don't re-play the minute we just finished)
        const curMin = liveState.min;
        let newIdx = sch.eventMinList.findIndex(m => m > curMin);
        if (newIdx < 0) {
            // No more minutes — match finished
            liveState.min = liveState.maxMin;
            liveState.sec = 59;
            liveState.curEvtIdx = 999;
            liveState.curLineIdx = 999;
            liveState.playing = false;
            liveState.ended = true;
            liveState.pendingFilterSwitch = null;
            updateLiveHeader();
            refreshActiveTab();
            return;
        }
        liveState.eventMinIdx = newIdx;
        liveState.min = sch.eventMinList[newIdx];
        liveState.sec = -1;
        liveState.curEvtIdx = -1;
        liveState.curLineIdx = -1;
        liveState.curEvtComplete = true;
        liveState.justCompleted = false;
        liveState.pendingFilterSwitch = null;
        console.log('[RND] Filter switch applied: ' + mode);
        // Load Unity clips for the new minute (so animation + clip-driven text work)
        if (isMatchPage && unityState.available && unityState.ready) {
            loadUnityClips(liveState.min, liveState.mData);
        }
        updateLiveHeader();
        refreshActiveTab();
    };

    const liveSkip = () => {
        if (!liveState) return;
        livePause();
        liveState.min = liveState.maxMin;
        liveState.sec = 59;
        liveState.curEvtIdx = 999;
        liveState.curLineIdx = 999;
        liveState.eventMinIdx = liveState.eventMinList.length;
        liveState.ended = true;
        updateLiveHeader();
        refreshActiveTab();
    };

    const openMatchDialog = (matchId) => {
        const cached = roundMatchCache.get(String(matchId));
        // If not cached yet, fetch on-demand
        const show = (mData) => {
            const homeClub = mData.club.home.club_name;
            const awayClub = mData.club.away.club_name;
            const homeLogoId = mData.club.home.id;
            const awayLogoId = mData.club.away.id;

            // Determine if this match is in the future
            const matchIsFuture = isMatchFuture(mData);

            // Determine if match is currently live
            const matchIsLive = !matchIsFuture && isMatchCurrentlyLive(mData);

            // Build schedules & live state only for non-future matches
            if (!matchIsFuture) {
                const rpt = mData.report || {};
                const allSch = buildSchedule(rpt, false);
                const keySch = buildSchedule(rpt, true);
                const { schedule: keySchedule, eventMinList: keyEventMinList } = keySch;
                const maxMin = keyEventMinList.length ? keyEventMinList[keyEventMinList.length - 1] : 90;

                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                if (matchIsLive) {
                    const { schedule: allSchedule, eventMinList: allEventMinList } = allSch;
                    const allMaxMin = allEventMinList.length ? allEventMinList[allEventMinList.length - 1] : 90;
                    const effectiveKickoff = deriveKickoff(mData);
                    const info = calculateLiveMinute(effectiveKickoff);
                    const lastMin = mData.match_data.last_min || 90;
                    const liveMin = info ? Math.min(info.minute, lastMin) : Math.floor(mData.match_data.live_min);
                    const liveSec = info ? info.second : 0;
                    const liveHT = info ? info.isHT : false;
                    console.log('[RND] LIVE detected — live_min:', mData.match_data.live_min, '→ min:', liveMin, 'sec:', liveSec, 'HT:', liveHT);
                    liveState = {
                        min: liveMin, sec: liveSec,
                        curEvtIdx: 999, curLineIdx: 999,
                        curEvtComplete: true, justCompleted: false,
                        playing: false, timer: null, mData,
                        speed: 1000, maxMin: allMaxMin,
                        ended: info ? info.minute > lastMin : false,
                        schedule: allSchedule, eventMinList: allEventMinList, eventMinIdx: 0,
                        filterMode: 'live', liveIsHT: liveHT,
                        liveKickoff: effectiveKickoff,
                        scheduleAll: allSch, scheduleKey: keySch
                    };
                } else {
                    liveState = {
                        min: keyEventMinList.length ? keyEventMinList[0] : 0,
                        sec: -1,
                        curEvtIdx: -1, curLineIdx: -1,
                        curEvtComplete: true, justCompleted: false,
                        playing: false, timer: null, mData,
                        speed: 1000, maxMin, ended: false,
                        schedule: keySchedule, eventMinList: keyEventMinList, eventMinIdx: 0,
                        filterMode: 'key', liveIsHT: false,
                        liveKickoff: null,
                        scheduleAll: allSch, scheduleKey: keySch
                    };
                }
            } else {
                // Future match: no live state needed
                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                liveState = null;
            }

            // Build tactic chip strings for header
            const md = mData.match_data;
            const mentalityMap = { 1: 'V.Def', 2: 'Def', 3: 'Sl.Def', 4: 'Normal', 5: 'Sl.Att', 6: 'Att', 7: 'V.Att' };
            const styleMapShort = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short', 5: 'Long', 6: 'Through' };
            const focusMapShort = { 1: 'Balanced', 2: 'Left', 3: 'Central', 4: 'Right' };
            const buildChips = (side) => {
                let c = '';
                if (!matchIsFuture) {
                    const ment = md.mentality ? (mentalityMap[md.mentality[side]] || md.mentality[side]) : '?';
                    c += `<span class="rnd-dlg-chip" id="rnd-chip-ment-${side}">⚔ <span class="chip-val">${ment}</span></span>`;
                    const style = md.attacking_style ? (styleMapShort[md.attacking_style[side]] || md.attacking_style[side]) : '?';
                    c += `<span class="rnd-dlg-chip">🎯 <span class="chip-val">${style}</span></span>`;
                    const focus = md.focus_side ? (focusMapShort[md.focus_side[side]] || md.focus_side[side]) : '?';
                    c += `<span class="rnd-dlg-chip">◎ <span class="chip-val">${focus}</span></span>`;
                }
                c += `<span class="rnd-dlg-chip" id="rnd-chip-r5-${side}">R5 <span class="chip-val">···</span></span>`;
                return c;
            };

            const overlay = $(`
                <div class="rnd-overlay" id="rnd-overlay">
                    <div class="rnd-dialog">
                        <div class="rnd-dlg-head">
                            <button class="rnd-dlg-close" id="rnd-dlg-close">&times;</button>
                            <div class="rnd-dlg-head-content">
                              <div class="rnd-dlg-head-row">
                                <div class="rnd-dlg-team-group home">
                                  <div class="rnd-dlg-team-info">
                                    <span class="rnd-dlg-team">${homeClub}</span>
                                    <div class="rnd-dlg-chips">${buildChips('home')}</div>
                                  </div>
                                  <img class="rnd-dlg-logo" src="/pics/club_logos/${homeLogoId}_140.png" onerror="this.style.display='none'">
                                </div>
                                <div class="rnd-dlg-score-block">
                                  <span class="rnd-dlg-score">0 - 0</span>
                                  <div class="rnd-dlg-datetime">${(() => {
                    const ko = mData.match_data.venue?.kickoff_readable || '';
                    const d = ko ? new Date(ko.replace(' ', 'T')).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';
                    const t = mData.match_data.match_time_of_day || '';
                    return (d || '') + (t ? ' · ' + t : '');
                })()}</div>
                                </div>
                                <div class="rnd-dlg-team-group away">
                                  <img class="rnd-dlg-logo" src="/pics/club_logos/${awayLogoId}_140.png" onerror="this.style.display='none'">
                                  <div class="rnd-dlg-team-info">
                                    <span class="rnd-dlg-team">${awayClub}</span>
                                    <div class="rnd-dlg-chips">${buildChips('away')}</div>
                                  </div>
                                </div>
                              </div>
                              <div class="rnd-dlg-head-time">
                                <span class="rnd-live-min" id="rnd-live-min-head">${matchIsFuture ? '⏳' : '0:00'}</span>
                                ${matchIsFuture ? '' : `<div class="rnd-live-progress"><div class="rnd-live-progress-fill" id="rnd-live-progress-head" style="width:0%"></div></div>
                                <div class="rnd-live-filter-group">
                                  <button class="rnd-live-filter-btn" data-filter="all">All</button>
                                  <button class="rnd-live-filter-btn${matchIsLive ? '' : ' active'}" data-filter="key">Key</button>
                                  ${matchIsLive ? '<button class="rnd-live-filter-btn live-btn active" data-filter="live">Live</button>' : ''}
                                </div>
                                <button class="rnd-live-btn" id="rnd-live-play-head" title="Play / Pause">▶</button>
                                <button class="rnd-live-btn" id="rnd-live-skip-head" title="Skip to end">⏭</button>`}
                              </div>
                            </div>
                        </div>
                        <div class="rnd-tabs">
                            ${matchIsFuture ? `
                            <div class="rnd-tab active" data-tab="lineups">Expected Lineups</div>
                            <div class="rnd-tab" data-tab="venue">Venue</div>
                            <div class="rnd-tab" data-tab="h2h">H2H</div>
                            ` : `
                            <div class="rnd-tab" data-tab="details">Details</div>
                            <div class="rnd-tab" data-tab="statistics">Statistics</div>
                            <div class="rnd-tab" data-tab="report">Report</div>
                            <div class="rnd-tab active" data-tab="lineups">Lineups</div>
                            <div class="rnd-tab" data-tab="venue">Venue</div>
                            <div class="rnd-tab" data-tab="h2h">H2H</div>
                            `}
                        </div>
                        <div class="rnd-dlg-body" id="rnd-dlg-body"></div>
                    </div>
                </div>
            `);

            $('body').append(overlay).css('overflow', 'hidden');

            const closeDialog = () => {
                if (liveState && liveState.timer) clearTimeout(liveState.timer);
                liveState = null;
                overlay.remove();
                $('body').css('overflow', '');
            };

            // Close handlers
            overlay.on('click', '#rnd-dlg-close', closeDialog);
            overlay.on('click', (e) => { if (e.target === overlay[0]) closeDialog(); });
            $(document).one('keydown.rndDlg', (e) => {
                if (e.key === 'Escape') { closeDialog(); $(document).off('keydown.rndDlg'); }
            });

            // Live replay controls & filters (skip for future matches)
            if (!matchIsFuture) {
                overlay.on('click', '#rnd-live-play-head', liveToggle);
                overlay.on('click', '#rnd-live-skip-head', liveSkip);
                overlay.on('click', '.rnd-live-filter-btn', function () {
                    const mode = $(this).data('filter');
                    if (!liveState || liveState.filterMode === mode) return;
                    liveState.filterMode = mode;
                    overlay.find('.rnd-live-filter-btn').removeClass('active');
                    $(this).addClass('active');
                    if (unityState.activeMinute !== null || unityState.playing) {
                        liveState.pendingFilterSwitch = mode;
                        console.log('[RND] Filter switch deferred until animation finishes');
                        return;
                    }
                    applyFilterSwitch(mode);
                });
            }

            // Tab switching
            overlay.on('click', '.rnd-tab', function () {
                overlay.find('.rnd-tab').removeClass('active');
                $(this).addClass('active');
                renderDialogTab($(this).attr('data-tab'), mData);
            });

            // Render default tab + start live replay
            // Add rnd-live-active class to header when live
            if (!matchIsFuture) {
                $('#rnd-overlay .rnd-dlg-head').addClass('rnd-live-active');
            }
            // Disable ALL/KEY filter buttons if not on match page
            if (!isMatchPage) {
                overlay.find('.rnd-live-filter-btn').prop('disabled', true);
            }
            renderDialogTab('lineups', mData);
            if (!matchIsFuture) {
                updateLiveHeader();
                setTimeout(() => livePlay(), 500);
            }


        };

        if (cached && cached.data) {
            show(cached.data);
        } else {
            // Fetch match data on demand
            $.get(`/ajax/match.ajax.php?id=${matchId}`).done(res => {
                const mData = typeof res === 'string' ? JSON.parse(res) : res;
                show(mData);
            });
        }
    };

    const renderDialogTab = (tab, mData) => {
        // Save Unity canvas before destroying lineups tab DOM
        // Skip for lineups — it handles in-place updates without destroying viewport
        if (tab !== 'lineups') saveUnityCanvas();
        const body = $('#rnd-dlg-body');
        const curMin = liveState ? liveState.min : 999;
        const curEvtIdx = liveState ? liveState.curEvtIdx : 999;
        // For tabs showing parameters (goals/subs/reds), defer until event text is complete
        const paramEvtIdx = (liveState && !liveState.ended && !liveState.curEvtComplete) ? curEvtIdx - 1 : curEvtIdx;
        switch (tab) {
            case 'details': renderDetailsTab(body, mData, curMin, paramEvtIdx); break;
            case 'statistics': renderStatisticsTab(body, mData, curMin, paramEvtIdx); break;
            case 'report': renderReportTab(body, mData, curMin, curEvtIdx); break;
            case 'lineups': renderLineupsTab(body, mData, curMin, paramEvtIdx); break;
            case 'venue': renderVenueTab(body, mData); break;
            case 'h2h': renderH2HTab(body, mData); break;
        }
    };

    // ── Helper: build player name lookup ──
    const buildPlayerNames = (mData) => {
        const names = {};
        ['home', 'away'].forEach(side => {
            Object.values(mData.lineup[side]).forEach(p => {
                names[p.player_id] = p.nameLast || p.name;
            });
        });
        return names;
    };

    // ── Helper: resolve [player=ID] tags in text ──
    const resolvePlayerTags = (text, playerNames) => {
        return text.replace(/\[player=(\d+)\]/g, (_, id) => {
            const name = playerNames[id] || id;
            return `<span class="rnd-player-name">${name}</span>`;
        });
    };

    const renderDetailsTab = (body, mData, curMin = 999, curEvtIdx = 999) => {
        const playerNames = buildPlayerNames(mData);
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const homeId = String(mData.club.home.id);

        let html = '<div style="max-width:900px;margin:0 auto">';

        // ── Parse key events from report (filtered by current step) ──
        const events = [];
        const report = mData.report || {};
        Object.keys(report).sort((a, b) => Number(a) - Number(b)).forEach(minKey => {
            const min = Number(minKey);
            report[minKey].forEach((evt, si) => {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.goal) {
                        events.push({
                            min, type: 'goal',
                            isHome: String(evt.club) === homeId,
                            player: playerNames[param.goal.player] || '?',
                            assist: param.goal.assist ? (playerNames[param.goal.assist] || null) : null
                        });
                    }
                    if (param.yellow) {
                        events.push({
                            min, type: 'yellow',
                            isHome: homeIds.has(String(param.yellow)),
                            player: playerNames[param.yellow] || '?'
                        });
                    }
                    if (param.yellow_red) {
                        events.push({
                            min, type: 'yellowred',
                            isHome: homeIds.has(String(param.yellow_red)),
                            player: playerNames[param.yellow_red] || '?'
                        });
                    }
                    if (param.sub) {
                        const isHome = homeIds.has(String(param.sub.player_in)) || homeIds.has(String(param.sub.player_out));
                        events.push({
                            min, type: 'sub', isHome,
                            playerIn: playerNames[param.sub.player_in] || '?',
                            playerOut: playerNames[param.sub.player_out] || '?'
                        });
                    }
                    if (param.injury) {
                        const pid = String(param.injury);
                        events.push({
                            min, type: 'injury',
                            isHome: homeIds.has(pid),
                            player: playerNames[pid] || '?'
                        });
                    }
                });
            });
        });

        // ── Build event text (icon placement depends on side) ──
        const evtText = (evt, side) => {
            const icons = { goal: '⚽', yellow: '🟨', yellowred: '🟥', sub: '🔄', injury: '<span style="color:#ff3c3c;font-weight:800">✚</span>' };
            const icon = icons[evt.type];
            let text = '';
            if (evt.type === 'goal') {
                text = `<strong style="color:#f0fce0">${evt.player}</strong>`;
                if (evt.assist) text += ` <span style="color:#90b878;font-size:11px">(${evt.assist})</span>`;
            } else if (evt.type === 'sub') {
                text = `<span style="color:#80d848">↑ ${evt.playerIn}</span>  <span style="color:#c07050">↓ ${evt.playerOut}</span>`;
            } else if (evt.type === 'injury') {
                text = `<span style="color:#ff8c3c">${evt.player}</span>`;
            } else {
                text = evt.player;
            }
            return side === 'home' ? `${text} ${icon}` : `${icon} ${text}`;
        };

        // ── Render timeline ──
        html += '<div class="rnd-timeline">';
        events.forEach(evt => {
            const cls = evt.type === 'goal' ? ' rnd-tl-goal' : '';
            html += `<div class="rnd-tl-row${cls}">`;
            html += `<div class="rnd-tl-home">${evt.isHome ? evtText(evt, 'home') : ''}</div>`;
            html += `<div class="rnd-tl-min">${evt.min}'</div>`;
            html += `<div class="rnd-tl-away">${!evt.isHome ? evtText(evt, 'away') : ''}</div>`;
            html += `</div>`;
        });
        html += '</div></div>';

        body.html(html);
    };

    const renderReportTab = (body, mData, curMin = 999, curEvtIdx = 999) => {
        const playerNames = buildPlayerNames(mData);
        const homeId = String(mData.club.home.id);
        const report = mData.report || {};
        const allMinutes = Object.keys(report).sort((a, b) => Number(a) - Number(b));

        let html = '<div style="max-width:900px;margin:0 auto"><div id="rnd-report-timeline" class="rnd-timeline">';

        allMinutes.forEach(minKey => {
            const min = Number(minKey);
            report[minKey].forEach((evt, evtIdx) => {
                if (!isEventVisible(min, evtIdx, curMin, curEvtIdx)) return;
                html += buildReportEventHtml(evt, min, evtIdx, playerNames, homeId);
            });
        });

        html += '</div></div>';
        body.html(html);

        // Accordion toggle (delegated)
        body.off('click.rndacc').on('click.rndacc', '.rnd-acc-head', function () {
            $(this).closest('.rnd-acc').toggleClass('open');
        });
    };

    const renderStatisticsTab = (body, mData, curMin = 999, curEvtIdx = 999) => {
        const md = mData.match_data;
        const homeClub = mData.club.home.club_name;
        const awayClub = mData.club.away.club_name;
        const homeId = String(mData.club.home.id);
        const awayId = String(mData.club.away.id);
        const homeLogo = `/pics/club_logos/${homeId}_140.png`;
        const awayLogo = `/pics/club_logos/${awayId}_140.png`;

        // ── Count stats from report (filtered by current step) ──
        const stats = { homeYellow: 0, awayYellow: 0, homeRed: 0, awayRed: 0, homeShots: 0, awayShots: 0, homeSoT: 0, awaySoT: 0, homeSetPieces: 0, awaySetPieces: 0, homePenalties: 0, awayPenalties: 0 };
        const homeIds = new Set(Object.keys(mData.lineup.home));
        const report = mData.report || {};
        Object.keys(report).forEach(minKey => {
            const min = Number(minKey);
            report[minKey].forEach((evt, si) => {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.yellow) {
                        if (homeIds.has(String(param.yellow))) stats.homeYellow++; else stats.awayYellow++;
                    }
                    if (param.yellow_red) {
                        if (homeIds.has(String(param.yellow_red))) stats.homeRed++; else stats.awayRed++;
                    }
                    if (param.red) {
                        if (homeIds.has(String(param.red))) stats.homeRed++; else stats.awayRed++;
                    }
                    if (param.shot) {
                        const isHomeSide = String(param.shot.team) === homeId;
                        if (isHomeSide) { stats.homeShots++; if (param.shot.target === 'on') stats.homeSoT++; }
                        else { stats.awayShots++; if (param.shot.target === 'on') stats.awaySoT++; }
                    }
                    if (param.set_piece) {
                        if (homeIds.has(String(param.set_piece))) stats.homeSetPieces++; else stats.awaySetPieces++;
                    }
                });
                // Penalty detection: "penalty" is a separate parameter, not inside goal
                const isPen = evt.parameters.some(p => p.penalty);
                const hasGoalP = evt.parameters.some(p => p.goal);
                if (isPen && hasGoalP) {
                    const gp = evt.parameters.find(p => p.goal);
                    if (homeIds.has(String(gp.goal.player))) stats.homePenalties++; else stats.awayPenalties++;
                }
            });
        });

        let html = '<div class="rnd-stats-wrap">';

        // Team header with logos
        html += '<div class="rnd-stats-team-header">';
        html += `<div class="rnd-stats-team-side home"><img class="rnd-stats-team-logo" src="${homeLogo}" onerror="this.style.display='none'"><span class="rnd-stats-team-name">${homeClub}</span></div>`;
        html += '<span class="rnd-stats-vs">vs</span>';
        html += `<div class="rnd-stats-team-side away"><img class="rnd-stats-team-logo" src="${awayLogo}" onerror="this.style.display='none'"><span class="rnd-stats-team-name">${awayClub}</span></div>`;
        html += '</div>';

        // Helper: single combined bar row
        const barRow = (label, hVal, aVal, highlight = false) => {
            const hNum = typeof hVal === 'string' ? parseFloat(hVal) : hVal;
            const aNum = typeof aVal === 'string' ? parseFloat(aVal) : aVal;
            const total = hNum + aNum;
            const hPct = total === 0 ? 50 : Math.round(hNum / total * 100);
            const aPct = 100 - hPct;
            const hLead = hNum > aNum ? ' leading' : '';
            const aLead = aNum > hNum ? ' leading' : '';
            const cls = highlight ? 'rnd-stat-row rnd-stat-row-highlight' : 'rnd-stat-row';
            return `<div class="${cls}">
                <div class="rnd-stat-header">
                    <span class="rnd-stat-val home${hLead}">${hVal}</span>
                    <span class="rnd-stat-label">${label}</span>
                    <span class="rnd-stat-val away${aLead}">${aVal}</span>
                </div>
                <div class="rnd-stat-bar-wrap">
                    <div class="rnd-stat-seg home" style="width:${hPct}%"></div>
                    <div class="rnd-stat-seg away" style="width:${aPct}%"></div>
                </div>
            </div>`;
        };

        // Possession (only available at full time)
        const matchEnded = !liveState || liveState.ended;
        if (md.possession && matchEnded) {
            const h = Number(md.possession.home), a = Number(md.possession.away);
            html += barRow('Possession', h + '%', a + '%', true);
        }

        html += '<div class="rnd-stat-divider"></div>';
        html += barRow('Shots', stats.homeShots, stats.awayShots);
        html += barRow('On Target', stats.homeSoT, stats.awaySoT);
        html += '<div class="rnd-stat-divider"></div>';
        html += barRow('Yellow Cards', stats.homeYellow, stats.awayYellow);
        html += barRow('Red Cards', stats.homeRed, stats.awayRed);
        html += '<div class="rnd-stat-divider"></div>';
        html += barRow('Set Pieces', stats.homeSetPieces, stats.awaySetPieces);
        if (stats.homePenalties || stats.awayPenalties) {
            html += barRow('Penalties', stats.homePenalties, stats.awayPenalties);
        }

        // ── Advanced Stats: Attacking Styles ──
        const ATTACK_STYLES = [
            { key: 'cou', label: 'Direct' },
            { key: 'kco', label: 'Direct' },
            { key: 'klo', label: 'Long Balls' },
            { key: 'sho', label: 'Short Passing' },
            { key: 'thr', label: 'Through Balls' },
            { key: 'lon', label: 'Long Balls' },
            { key: 'win', label: 'Wings' },
            { key: 'doe', label: 'Corners' },
            { key: 'dire', label: 'Free Kicks' },
        ];
        const STYLE_ORDER = ['Direct', 'Short Passing', 'Through Balls', 'Long Balls', 'Wings', 'Corners', 'Free Kicks', 'Penalties'];
        const SKIP_PREFIXES = new Set(['card', 'cod', 'inj']);
        const playerNames = buildPlayerNames(mData);

        // Collect per-style, per-side data
        const advData = { home: {}, away: {} };
        STYLE_ORDER.forEach(s => { advData.home[s] = { a: 0, l: 0, sh: 0, g: 0, events: [] }; advData.away[s] = { a: 0, l: 0, sh: 0, g: 0, events: [] }; });

        const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
        for (const min of sortedMins) {
            const evts = report[String(min)] || [];
            for (let si = 0; si < evts.length; si++) {
                const evt = evts[si];
                if (!evt.type) continue;
                if (!isEventVisible(min, si, curMin, curEvtIdx)) continue;
                const prefix = evt.type.replace(/[0-9]+.*/, '');

                // Handle penalty events (type starts with p_)
                const isPenEvt = /^p_/.test(evt.type);
                const hasShot = evt.parameters?.some(p => p.shot);
                const hasGoal = evt.parameters?.some(p => p.goal);
                const hasPenParam = evt.parameters?.some(p => p.penalty);

                if (isPenEvt && hasPenParam && hasGoal) {
                    const club = String(evt.club);
                    const side = club === homeId ? 'home' : 'away';
                    const pd = advData[side]['Penalties'];
                    pd.a++; pd.g++; pd.sh++;
                    pd.events.push({ min, evt, evtIdx: si, result: 'goal' });
                    continue;
                } else if (isPenEvt && hasShot && !hasGoal) {
                    const club = String(evt.club);
                    const side = club === homeId ? 'home' : 'away';
                    const pd = advData[side]['Penalties'];
                    pd.a++; pd.sh++;
                    pd.events.push({ min, evt, evtIdx: si, result: 'shot' });
                    continue;
                }

                if (SKIP_PREFIXES.has(prefix)) continue;
                const styleEntry = ATTACK_STYLES.find(s => s.key === prefix);
                if (!styleEntry) continue;
                const label = styleEntry.label;
                const club = String(evt.club);
                const side = club === homeId ? 'home' : 'away';
                const d = advData[side][label];
                d.a++;
                let result = 'lost';
                if (hasGoal) { d.g++; d.sh++; result = 'goal'; }
                else if (hasShot) { d.sh++; result = 'shot'; }
                else { d.l++; }
                d.events.push({ min, evt, evtIdx: si, result });
            }
        }

        // Build advanced section HTML
        html += '<div class="rnd-adv-section">';
        html += '<div class="rnd-adv-title">Attacking Styles</div>';

        const buildAdvTable = (teamName, side, sideClass) => {
            let t = `<div class="rnd-adv-team-label" style="color:${sideClass === 'home' ? '#80e048' : '#5ba8f0'}">${teamName}</div>`;
            t += '<table class="rnd-adv-table">';
            t += '<tr><th>Style</th><th>Att</th><th>Lost</th><th>Shot</th><th>Goal</th><th>Conv%</th></tr>';
            let totA = 0, totL = 0, totSh = 0, totG = 0;
            STYLE_ORDER.forEach(style => {
                const d = advData[side][style];
                totA += d.a; totL += d.l; totSh += d.sh; totG += d.g;
                const pct = d.a ? Math.round(d.g / d.a * 100) + '%' : '-';
                const cls = (v, type) => v === 0 ? 'adv-zero' : type;
                const rowId = `adv-${sideClass}-${style.replace(/\s/g, '-')}`;
                const hasEvents = d.events.length > 0;
                t += `<tr class="rnd-adv-row${hasEvents ? '' : ' rnd-adv-total'}" ${hasEvents ? 'data-adv-target="' + rowId + '"' : ''}>`;
                t += `<td>${style}${hasEvents ? ' <span class="adv-arrow">&#9654;</span>' : ''}</td>`;
                t += `<td class="${cls(d.a, '')}">${d.a}</td>`;
                t += `<td class="${cls(d.l, 'adv-lost')}">${d.l}</td>`;
                t += `<td class="${cls(d.sh, 'adv-shot')}">${d.sh}</td>`;
                t += `<td class="${cls(d.g, 'adv-goal')}">${d.g}</td>`;
                t += `<td class="${cls(d.a ? d.g : 0, '')}">${pct}</td>`;
                t += '</tr>';
                if (hasEvents) {
                    t += `<tr class="rnd-adv-events" id="${rowId}"><td colspan="6"><div class="rnd-adv-evt-list">`;
                    d.events.forEach(e => {
                        t += `<div class="rnd-adv-evt"><span class="adv-result-tag ${e.result}">${e.result}</span>${buildReportEventHtml(e.evt, e.min, e.evtIdx, playerNames, homeId)}</div>`;
                    });
                    t += '</div></td></tr>';
                }
            });
            // Total row
            const totPct = totA ? Math.round(totG / totA * 100) + '%' : '-';
            t += '<tr class="rnd-adv-row rnd-adv-total">';
            t += `<td>Total</td><td>${totA}</td><td>${totL}</td><td>${totSh}</td><td>${totG}</td><td>${totPct}</td>`;
            t += '</tr>';
            t += '</table>';
            return t;
        };

        html += buildAdvTable(homeClub, 'home', 'home');
        html += buildAdvTable(awayClub, 'away', 'away');
        html += '</div>';

        // ── Player Statistics (from video segments) ──
        const PASS_VIDS = /^(short|preshort|through|longball|gkthrow|gkkick)/;
        const CROSS_VIDS = /^(wing(?!start)|cornerkick|freekick)/;
        const DEFWIN_VIDS = /^defwin/;
        const FINISH_VIDS = /^(finish|finishlong|header|acrobat)/;
        const RUN_DUEL_VIDS = /^finrun/;
        const homeIdsSet = new Set(Object.keys(mData.lineup.home));
        const pStats = {};  // playerId → { sp, up, sc, uc, sh, sv, g, a, dw, dl, events[] }
        const ensureP = (id) => { if (!pStats[id]) pStats[id] = { sp: 0, up: 0, sc: 0, uc: 0, sh: 0, sv: 0, g: 0, a: 0, dw: 0, dl: 0, events: [] }; return pStats[id]; };

        for (const min of sortedMins) {
            const evts = report[String(min)] || [];
            for (let si = 0; si < evts.length; si++) {
                const evt = evts[si];
                if (!isEventVisible(min, si, curMin, curEvtIdx)) continue;
                const vids = evt.chance?.video;
                const evtHasShot = evt.parameters?.some(p => p.shot);
                if (vids && Array.isArray(vids)) {
                    for (let vi = 0; vi < vids.length; vi++) {
                        const v = vids[vi];
                        if (PASS_VIDS.test(v.video)) {
                            const passerId = /^gk(throw|kick)/.test(v.video) ? v.gk : v.att1;
                            if (passerId) {
                                // For preshort videos, only count if the passer is mentioned in the text
                                const isPreshort = /^preshort/.test(v.video);
                                const textLines = (evt.chance?.text?.[vi] || []);
                                if (isPreshort && !textLines.some(l => l.includes('[player=' + passerId + ']'))) {
                                    // Skip — att1 in preshort is just part of buildup, not the actual passer
                                } else {
                                    const p = ensureP(passerId);
                                    const failed = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                    if (failed) { p.up++; p.events.push({ min, evtIdx: si, evt, action: 'pass_fail' }); }
                                    else { p.sp++; p.events.push({ min, evtIdx: si, evt, action: 'pass_ok' }); }
                                }
                            }
                        }
                        if (CROSS_VIDS.test(v.video) && v.att1) {
                            // Free kick shot on goal → count as shot, not cross
                            if (/^freekick/.test(v.video) && evtHasShot) {
                                ensureP(v.att1).sh++;
                                ensureP(v.att1).events.push({ min, evtIdx: si, evt, action: 'shot' });
                            } else {
                                const p = ensureP(v.att1);
                                const failed = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                if (failed) { p.uc++; p.events.push({ min, evtIdx: si, evt, action: 'cross_fail' }); }
                                else { p.sc++; p.events.push({ min, evtIdx: si, evt, action: 'cross_ok' }); }
                            }
                        }
                        if (FINISH_VIDS.test(v.video) && v.att1) {
                            // Only count if next segment is NOT also a finish (avoid double-counting acrobat7+acrobat8 etc.)
                            const nextIsAlsoFinish = vi + 1 < vids.length && FINISH_VIDS.test(vids[vi + 1].video);
                            if (!nextIsAlsoFinish) {
                                const hasGoalForShooter = evt.parameters?.some(p => p.goal && String(p.goal.player) === String(v.att1));
                                ensureP(v.att1).sh++;
                                if (!hasGoalForShooter) {
                                    ensureP(v.att1).events.push({ min, evtIdx: si, evt, action: 'shot' });
                                }
                            }
                        }
                        if (DEFWIN_VIDS.test(v.video)) {
                            const tLines = (evt.chance?.text || []).flat();
                            const winner = [v.def1, v.def2].find(d => d && tLines.some(l => l.includes('[player=' + d + ']')));
                            if (winner) { ensureP(winner).dw++; ensureP(winner).events.push({ min, evtIdx: si, evt, action: 'duel_won' }); }
                        }
                        if (RUN_DUEL_VIDS.test(v.video)) {
                            const nextIsDefwin = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                            if (!nextIsDefwin) {
                                const tLines = (evt.chance?.text || []).flat();
                                [v.def1, v.def2].forEach(d => {
                                    if (d && tLines.some(l => l.includes('[player=' + d + ']'))) {
                                        ensureP(d).dl++;
                                        ensureP(d).events.push({ min, evtIdx: si, evt, action: 'duel_lost' });
                                    }
                                });
                            }
                        }
                        if (/^save/.test(v.video) && v.gk) {
                            ensureP(v.gk).sv++;
                            ensureP(v.gk).events.push({ min, evtIdx: si, evt, action: 'save' });
                        }
                    }
                }
                if (evt.parameters) {
                    evt.parameters.forEach(param => {
                        if (param.goal) {
                            const scorer = String(param.goal.player);
                            ensureP(scorer).g++;
                            ensureP(scorer).events.push({ min, evtIdx: si, evt, action: 'goal' });
                            if (param.goal.assist) {
                                const assistP = String(param.goal.assist);
                                ensureP(assistP).a++;
                                ensureP(assistP).events.push({ min, evtIdx: si, evt, action: 'assist' });
                            }
                        }
                    });
                }
            }
        }

        html += '<div class="rnd-adv-section">';
        html += '<div class="rnd-adv-title">Player Statistics</div>';

        const ACTION_LABELS = { pass_ok: 'pass \u2713', pass_fail: 'pass \u2717', cross_ok: 'cross \u2713', cross_fail: 'cross \u2717', shot: 'shot', save: 'save', goal: 'goal', assist: 'assist', duel_won: 'duel \u2713', duel_lost: 'duel \u2717' };
        const ACTION_CLS = { pass_ok: 'shot', pass_fail: 'lost', cross_ok: 'shot', cross_fail: 'lost', shot: 'shot', save: 'shot', goal: 'goal', assist: 'goal', duel_won: 'shot', duel_lost: 'lost' };

        // Build sub events for minutes-played calculation
        const subEvents = {};  // playerId → { subInMin, subOutMin }
        for (const min of sortedMins) {
            (report[String(min)] || []).forEach(evt => {
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.sub) {
                        const inId = String(param.sub.player_in);
                        const outId = String(param.sub.player_out);
                        if (!subEvents[inId]) subEvents[inId] = {};
                        subEvents[inId].subInMin = min;
                        if (!subEvents[outId]) subEvents[outId] = {};
                        subEvents[outId].subOutMin = min;
                    }
                });
            });
        }
        const matchEndMin = mData.match_data?.regular_last_min || Math.max(...sortedMins, 90);
        const posOrder = { gk: 0, dl: 1, dcl: 2, dc: 3, dcr: 4, dr: 5, dml: 6, dmcl: 7, dmc: 8, dmcr: 9, dmr: 10, ml: 11, mcl: 12, mc: 13, mcr: 14, mr: 15, oml: 16, omcl: 17, omc: 18, omcr: 19, omr: 20, fcl: 21, fc: 22, fcr: 23 };
        const ratClr = (r) => {
            if (!r || r === 0) return '#5a7a48';
            const v = Number(r);
            if (v >= 9.0) return '#00c040';
            if (v >= 8.5) return '#00dd50';
            if (v >= 8.0) return '#22e855';
            if (v >= 7.5) return '#44ee55';
            if (v >= 7.0) return '#66dd44';
            if (v >= 6.5) return '#88cc33';
            if (v >= 6.0) return '#99bb22';
            if (v >= 5.5) return '#aacc00';
            if (v >= 5.0) return '#bbcc00';
            if (v >= 4.5) return '#dd9900';
            if (v >= 4.0) return '#ee7733';
            if (v >= 3.5) return '#ee5533';
            if (v >= 3.0) return '#dd3333';
            if (v >= 2.0) return '#cc2222';
            return '#bb1111';
        };

        const buildPlayerTable = (teamName, side, sideClass) => {
            const lineup = mData.lineup[side];
            const starters = [], playedSubs = [];
            Object.entries(lineup).forEach(([id, p]) => {
                const isSub = p.position.includes('sub');
                const se = subEvents[String(p.player_id)] || {};
                if (isSub && !se.subInMin) return;  // Sub who never played — skip
                let minsPlayed;
                if (isSub) {
                    const endMin = se.subOutMin || matchEndMin;
                    minsPlayed = endMin - se.subInMin;
                } else {
                    const endMin = se.subOutMin || matchEndMin;
                    minsPlayed = endMin;
                }
                const entry = { id: String(p.player_id), p, minsPlayed };
                if (isSub) playedSubs.push(entry);
                else starters.push(entry);
            });
            starters.sort((a, b) => (posOrder[a.p.position] ?? 99) - (posOrder[b.p.position] ?? 99));
            playedSubs.sort((a, b) => (subEvents[a.id]?.subInMin || 99) - (subEvents[b.id]?.subInMin || 99));
            const players = [...starters, ...playedSubs];

            let t = `<div class="rnd-adv-team-label" style="color:${sideClass === 'home' ? '#80e048' : '#5ba8f0'}">${teamName}</div>`;
            t += '<table class="rnd-adv-table">';
            const colCount = matchEnded ? 12 : 11;
            t += '<tr><th>Player</th><th title="Minutes Played">Min</th><th title="Successful Passes">SP</th><th title="Unsuccessful Passes">UP</th><th title="Successful Crosses">SC</th><th title="Unsuccessful Crosses">UC</th><th title="Shots / Saves">Sh</th><th>G</th><th>A</th><th title="Duels Won">DW</th><th title="Duels Lost">DL</th>' + (matchEnded ? '<th>Rat</th>' : '') + '</tr>';
            let totSP = 0, totUP = 0, totSC = 0, totUC = 0, totSh = 0, totG = 0, totA = 0, totDW = 0, totDL = 0;
            players.forEach(({ id, p, minsPlayed }) => {
                const s = pStats[id] || { sp: 0, up: 0, sc: 0, uc: 0, sh: 0, sv: 0, g: 0, a: 0, dw: 0, dl: 0, events: [] };
                const isGK = p.position === 'gk';
                totSP += s.sp; totUP += s.up; totSC += s.sc; totUC += s.uc; totSh += (isGK ? s.sv : s.sh); totG += s.g; totA += s.a; totDW += s.dw; totDL += s.dl;
                const rowId = `plr-${sideClass}-${id}`;
                const hasEvts = s.events.length > 0;
                const cls = (v, type) => v === 0 ? 'adv-zero' : type;
                const isSub = p.position.includes('sub');
                t += `<tr class="rnd-adv-row${hasEvts ? '' : ' rnd-adv-total'}" ${hasEvts ? 'data-adv-target="' + rowId + '"' : ''}>`;
                t += `<td>${isSub ? '<span style="color:#6a9a58;font-size:9px">↑</span> ' : ''}${playerNames[id] || id}${hasEvts ? ' <span class="adv-arrow">&#9654;</span>' : ''}</td>`;
                t += `<td style="color:#8aac72">${minsPlayed}'</td>`;
                t += `<td class="${cls(s.sp, '')}">${s.sp}</td>`;
                t += `<td class="${cls(s.up, 'adv-lost')}">${s.up}</td>`;
                t += `<td class="${cls(s.sc, '')}">${s.sc}</td>`;
                t += `<td class="${cls(s.uc, 'adv-lost')}">${s.uc}</td>`;
                t += isGK ? `<td class="${cls(s.sv, 'adv-shot')}" title="Saves">${s.sv} 🧤</td>` : `<td class="${cls(s.sh, 'adv-shot')}">${s.sh}</td>`;
                t += `<td class="${cls(s.g, 'adv-goal')}">${s.g}</td>`;
                t += `<td class="${cls(s.a, 'adv-goal')}">${s.a}</td>`;
                t += `<td class="${cls(s.dw, '')}">${s.dw}</td>`;
                t += `<td class="${cls(s.dl, 'adv-lost')}">${s.dl}</td>`;
                if (matchEnded) {
                    const rFmt = p.rating ? Number(p.rating).toFixed(2) : '-';
                    t += `<td style="font-weight:700;color:${ratClr(p.rating)}">${rFmt}</td>`;
                }
                t += '</tr>';
                if (hasEvts) {
                    t += `<tr class="rnd-adv-events" id="${rowId}"><td colspan="${colCount}"><div class="rnd-adv-evt-list">`;
                    s.events.forEach(ev => {
                        const acls = ACTION_CLS[ev.action] || '';
                        const albl = ACTION_LABELS[ev.action] || ev.action;
                        t += `<div class="rnd-adv-evt"><span class="adv-result-tag ${acls}">${albl}</span>${buildReportEventHtml(ev.evt, ev.min, ev.evtIdx, playerNames, homeId)}</div>`;
                    });
                    t += '</div></td></tr>';
                }
            });
            const clsT = (v, type) => v === 0 ? 'adv-zero' : type;
            t += '<tr class="rnd-adv-row rnd-adv-total">';
            t += `<td>Total</td><td></td><td>${totSP}</td><td class="${clsT(totUP, 'adv-lost')}">${totUP}</td><td>${totSC}</td><td class="${clsT(totUC, 'adv-lost')}">${totUC}</td><td>${totSh}</td><td class="${clsT(totG, 'adv-goal')}">${totG}</td><td class="${clsT(totA, 'adv-goal')}">${totA}</td><td>${totDW}</td><td class="${clsT(totDL, 'adv-lost')}">${totDL}</td>` + (matchEnded ? '<td></td>' : '');
            t += '</tr>';
            t += '</table>';
            return t;
        };

        html += buildPlayerTable(homeClub, 'home', 'home');
        html += buildPlayerTable(awayClub, 'away', 'away');
        html += '</div>';

        html += '</div>';
        body.html(html);

        // Wire up expand/collapse for adv rows
        body.find('.rnd-adv-row[data-adv-target]').on('click', function () {
            const targetId = $(this).data('adv-target');
            const evtRow = document.getElementById(targetId);
            if (evtRow) {
                $(this).toggleClass('expanded');
                $(evtRow).toggleClass('visible');
            }
        });
        // Wire up accordion toggle for embedded report events
        body.off('click.rndacc').on('click.rndacc', '.rnd-acc-head', function (e) {
            e.stopPropagation();
            $(this).closest('.rnd-acc').toggleClass('open');
        });
    };

    const renderVenueTab = (body, mData) => {
        const md = mData.match_data;
        const venue = md.venue;
        const weatherBase = (venue.weather || '').replace(/\d+/g, '');
        const weatherMap = {
            sunny: { icon: '☀️', text: 'Sunny', desc: 'Clear skies' },
            cloudy: { icon: '⛅', text: 'Cloudy', desc: 'Partly cloudy' },
            rainy: { icon: '🌧️', text: 'Rain', desc: 'Wet conditions' },
            snow: { icon: '❄️', text: 'Snow', desc: 'Snowy pitch' },
            overcast: { icon: '☁️', text: 'Overcast', desc: 'Heavy clouds' }
        };
        const w = weatherMap[weatherBase] || { icon: '🌤️', text: weatherBase.charAt(0).toUpperCase() + weatherBase.slice(1), desc: '' };

        const capacity = Number(venue.capacity) || 0;
        const attendance = Number(md.attendance) || 0;
        const attPct = capacity ? Math.round(attendance / capacity * 100) : 0;
        const pitchPct = Number(venue.pitch_condition) || 0;

        // Stadium SVG illustration
        const stadiumSvg = `<svg class="rnd-venue-stadium-svg" width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="110" cy="65" rx="100" ry="12" fill="#2a5a16" stroke="#4a9030" stroke-width="1"/>
            <path d="M25 65 L25 30 Q25 22 33 20 L55 16 Q60 15 60 20 L60 65" fill="#1e4412" stroke="#4a9030" stroke-width="0.8"/>
            <path d="M60 65 L60 22 Q60 14 68 12 L102 6 Q110 5 110 12 L110 65" fill="#1a3d0f" stroke="#4a9030" stroke-width="0.8"/>
            <path d="M110 65 L110 12 Q110 5 118 6 L152 12 Q160 14 160 22 L160 65" fill="#1a3d0f" stroke="#4a9030" stroke-width="0.8"/>
            <path d="M160 65 L160 20 Q160 15 165 16 L187 20 Q195 22 195 30 L195 65" fill="#1e4412" stroke="#4a9030" stroke-width="0.8"/>
            <rect x="70" y="50" width="80" height="15" rx="2" fill="#2d5e1a" stroke="#4a9030" stroke-width="0.6"/>
            <line x1="110" y1="50" x2="110" y2="65" stroke="#4a9030" stroke-width="0.4"/>
            <circle cx="110" cy="57" r="4" stroke="#4a9030" stroke-width="0.4" fill="none"/>
            <rect x="72" y="53" width="12" height="9" rx="1" fill="none" stroke="#4a9030" stroke-width="0.4"/>
            <rect x="136" y="53" width="12" height="9" rx="1" fill="none" stroke="#4a9030" stroke-width="0.4"/>
            ${[35, 50, 65, 80, 140, 155, 170, 185].map(x => `<rect x="${x - 1}" y="${x < 110 ? 28 : 28}" width="2" height="4" rx="0.5" fill="#6cc048" opacity="0.5"/>`).join('')}
            <ellipse cx="45" cy="26" rx="14" ry="3" fill="none" stroke="#4a9030" stroke-width="0.4" opacity="0.4"/>
            <ellipse cx="175" cy="26" rx="14" ry="3" fill="none" stroke="#4a9030" stroke-width="0.4" opacity="0.4"/>
        </svg>`;

        let html = '<div class="rnd-venue-wrap">';

        // Hero section with stadium
        html += '<div class="rnd-venue-hero">';
        html += stadiumSvg;
        html += `<div class="rnd-venue-name">${venue.name}</div>`;
        html += `<div class="rnd-venue-city">📍 ${venue.city}</div>`;
        html += `<div class="rnd-venue-tournament"><span>🏆 ${venue.tournament}</span></div>`;
        html += '</div>';

        // Capacity & Attendance cards
        html += '<div class="rnd-venue-cards">';
        html += `<div class="rnd-venue-card">
            <div class="rnd-venue-card-icon">🏟️</div>
            <div class="rnd-venue-card-value">${capacity.toLocaleString()}</div>
            <div class="rnd-venue-card-label">Capacity</div>
        </div>`;
        html += `<div class="rnd-venue-card">
            <div class="rnd-venue-card-icon">👥</div>
            <div class="rnd-venue-card-value">${attendance ? attendance.toLocaleString() : '—'}</div>
            <div class="rnd-venue-card-label">Attendance</div>
        </div>`;
        html += '</div>';

        // Attendance gauge bar
        if (attendance && capacity) {
            html += '<div class="rnd-venue-gauge-wrap">';
            html += '<div class="rnd-venue-gauge-header">';
            html += '<span class="rnd-venue-gauge-title">Stadium Fill</span>';
            html += `<span class="rnd-venue-gauge-value">${attPct}%</span>`;
            html += '</div>';
            html += `<div class="rnd-venue-gauge-bar"><div class="rnd-venue-gauge-fill attendance" style="width:${attPct}%"></div></div>`;
            html += '</div>';
        }

        // Weather card
        html += '<div class="rnd-venue-weather">';
        html += `<div class="rnd-venue-weather-icon">${w.icon}</div>`;
        html += '<div class="rnd-venue-weather-info">';
        html += `<div class="rnd-venue-weather-text">${w.text}</div>`;
        html += `<div class="rnd-venue-weather-sub">${w.desc}</div>`;
        html += '</div></div>';

        // Pitch condition gauge
        html += '<div class="rnd-venue-gauge-wrap">';
        html += '<div class="rnd-venue-gauge-header">';
        html += '<span class="rnd-venue-gauge-title">Pitch Condition</span>';
        html += `<span class="rnd-venue-gauge-value">${pitchPct}%</span>`;
        html += '</div>';
        const pitchColor = pitchPct >= 80 ? '#4a9030' : pitchPct >= 50 ? '#b8a030' : '#a04030';
        html += `<div class="rnd-venue-gauge-bar"><div class="rnd-venue-gauge-fill" style="width:${pitchPct}%;background:linear-gradient(90deg,${pitchColor},${pitchColor}dd)"></div></div>`;
        html += '</div>';

        // Facilities grid
        html += '<div class="rnd-venue-facilities">';
        const facilities = [
            { key: 'sprinklers', icon: '💧', label: 'Sprinklers' },
            { key: 'draining', icon: '🚰', label: 'Draining' },
            { key: 'pitchcover', icon: '🛡️', label: 'Pitch Cover' },
            { key: 'heating', icon: '🔥', label: 'Heating' },
        ];
        facilities.forEach(f => {
            const active = venue[f.key] ? 'active' : '';
            html += `<div class="rnd-venue-facility ${active}">
                <div class="rnd-venue-facility-icon">${f.icon}</div>
                <div class="rnd-venue-facility-label">${f.label}</div>
                <div class="rnd-venue-facility-status">${venue[f.key] ? '✓ Yes' : '✗ No'}</div>
            </div>`;
        });
        html += '</div>';

        html += '</div>';
        body.html(html);
    };
    const renderLineupsTab = (body, mData, curMin = 999, curEvtIdx = 999) => {
        const matchEnded = !liveState || liveState.ended;
        const homeColor = '#' + (mData.club.home.colors?.club_color1 || '4a9030');
        const awayColor = '#' + (mData.club.away.colors?.club_color1 || '5b9bff');
        const homeId = mData.club.home.id;
        const awayId = mData.club.away.id;

        // Split starters and subs
        const splitLineup = (lineup) => {
            const starters = [], subs = [];
            Object.values(lineup).forEach(p => {
                if (p.position.includes('sub')) subs.push(p); else starters.push(p);
            });
            // Sort starters by position order
            const posOrder = { gk: 0, dl: 1, dcl: 2, dc: 3, dcr: 4, dr: 5, dml: 6, dmcl: 7, dmc: 8, dmcr: 9, dmr: 10, ml: 11, mcl: 12, mc: 13, mcr: 14, mr: 15, oml: 16, omcl: 17, omc: 18, omcr: 19, omr: 20, fcl: 21, fc: 22, fcr: 23 };
            starters.sort((a, b) => (posOrder[a.position] ?? 99) - (posOrder[b.position] ?? 99));
            subs.sort((a, b) => Number(a.position.replace('sub', '')) - Number(b.position.replace('sub', '')));
            return { starters, subs };
        };

        const home = splitLineup(mData.lineup.home);
        const away = splitLineup(mData.lineup.away);

        // Build event stats per player from report (filtered by current step)
        const pEvents = {};  // player_id → { goals, assists, yellows, reds, subIn, subOut, injured }
        const initPE = () => ({ goals: 0, assists: 0, yellows: 0, reds: 0, subIn: false, subOut: false, injured: false });
        const report = mData.report || {};
        Object.keys(report).forEach(minKey => {
            const eMin = Number(minKey);
            report[minKey].forEach((evt, si) => {
                if (!isEventVisible(eMin, si, curMin, curEvtIdx)) return;
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.goal) {
                        const pid = String(param.goal.player);
                        if (!pEvents[pid]) pEvents[pid] = initPE();
                        pEvents[pid].goals++;
                        if (param.goal.assist) {
                            const aid = String(param.goal.assist);
                            if (!pEvents[aid]) pEvents[aid] = initPE();
                            pEvents[aid].assists++;
                        }
                    }
                    if (param.yellow) {
                        const pid = String(param.yellow);
                        if (!pEvents[pid]) pEvents[pid] = initPE();
                        pEvents[pid].yellows++;
                    }
                    if (param.yellow_red) {
                        const pid = String(param.yellow_red);
                        if (!pEvents[pid]) pEvents[pid] = initPE();
                        pEvents[pid].reds++; pEvents[pid].yellows++;
                    }
                    if (param.red) {
                        const pid = String(param.red);
                        if (!pEvents[pid]) pEvents[pid] = initPE();
                        pEvents[pid].reds++;
                    }
                    if (param.injury) {
                        const pid = String(param.injury);
                        if (!pEvents[pid]) pEvents[pid] = initPE();
                        pEvents[pid].injured = true;
                    }
                    if (param.sub) {
                        const inId = String(param.sub.player_in);
                        const outId = String(param.sub.player_out);
                        if (!pEvents[inId]) pEvents[inId] = initPE();
                        if (!pEvents[outId]) pEvents[outId] = initPE();
                        pEvents[inId].subIn = true;
                        pEvents[outId].subOut = true;
                    }
                });
            });
        });

        // Build event icons string for a player
        const eventIcons = (pid) => {
            const e = pEvents[String(pid)];
            if (!e) return '';
            let s = '';
            if (e.goals) s += (e.goals > 1 ? e.goals + '×' : '') + '⚽';
            if (e.assists) s += (e.assists > 1 ? e.assists + '×' : '') + '👟';
            if (e.yellows) s += (e.yellows > 1 ? e.yellows + '×' : '') + '🟨';
            if (e.reds) s += (e.reds > 1 ? e.reds + '×' : '') + '🟥';
            if (e.injured) s += '<span style="color:#ff3c3c;font-size:13px;font-weight:800">✚</span>';
            if (e.subIn) s += '🔼';
            if (e.subOut) s += '🔽';
            return s;
        };

        // Format name: "M. Radic" from "V. Tutić" or nameLast="Tutić", name="V. Tutić"
        const fmtName = (p) => {
            const full = p.name || '';
            const last = p.nameLast || '';
            if (last && full) {
                const firstChar = full.charAt(0);
                return `${firstChar}. ${last}`;
            }
            return last || full;
        };

        // Match rating color (1-10 scale, 5.0 = cutoff between red and green)
        const ratingColor = (r) => {
            if (!r || r === 0) return '#5a7a48';
            const v = Number(r);
            if (v >= 9.0) return '#00c040';
            if (v >= 8.5) return '#00dd50';
            if (v >= 8.0) return '#22e855';
            if (v >= 7.5) return '#44ee55';
            if (v >= 7.0) return '#66dd44';
            if (v >= 6.5) return '#88cc33';
            if (v >= 6.0) return '#99bb22';
            if (v >= 5.5) return '#aacc00';
            if (v >= 5.0) return '#bbcc00';
            if (v >= 4.5) return '#dd9900';
            if (v >= 4.0) return '#ee7733';
            if (v >= 3.5) return '#ee5533';
            if (v >= 3.0) return '#dd3333';
            if (v >= 2.0) return '#cc2222';
            return '#bb1111';
        };
        const r5Color = (v) => {
            if (!v) return '#5a7a48';
            // Below 95: piecewise HSL tiers
            // 95-120: explicit per-integer colors for max visual differentiation
            const hsl2rgb = (h, s, l) => {
                s /= 100; l /= 100;
                const c = (1 - Math.abs(2 * l - 1)) * s;
                const x = c * (1 - Math.abs((h / 60) % 2 - 1));
                const m = l - c / 2;
                let r, g, b;
                if (h < 60) { r = c; g = x; b = 0; }
                else if (h < 120) { r = x; g = c; b = 0; }
                else { r = 0; g = c; b = x; }
                return '#' + [r + m, g + m, b + m].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
            };
            // Explicit lookup for 95-120 — each integer has a unique, distinguishable color
            const topColors = {
                95: '#8db024', // olive-yellow-green
                96: '#7aad22', // yellow-green
                97: '#68a820', // limey green
                98: '#57a31e', // lime green
                99: '#479e1c', // green-lime
                100: '#38991a', // medium green
                101: '#2e9418', // green
                102: '#258e16', // rich green
                103: '#1d8814', // deeper green
                104: '#168212', // forest green
                105: '#107c10', // vivid forest
                106: '#0c720e', // dark vivid green
                107: '#09680c', // dark green
                108: '#075e0a', // darker green
                109: '#055408', // very dark green
                110: '#044a07', // deep emerald
                111: '#034106', // deepest green
                112: '#033905', // near-black green
                113: '#023204', //
                114: '#022c04', //
                115: '#022603', // almost black-green
                116: '#012103', //
                117: '#011d02', //
                118: '#011902', // darkest
            };
            const rounded = Math.round(v);
            if (rounded >= 95) return topColors[Math.min(118, rounded)] || topColors[118];
            // Below 95: HSL tiers
            const tiers = [
                [25, 50, 0, 10, 65, 68, 28, 32],
                [50, 70, 10, 25, 68, 72, 34, 40],
                [70, 80, 25, 42, 72, 75, 42, 46],
                [80, 90, 42, 58, 75, 78, 46, 48],
                [90, 95, 58, 78, 78, 80, 48, 46],
            ];
            const clamped = Math.max(25, Math.min(95, v));
            let hue = 0, sat = 65, lit = 28;
            for (const [from, to, h0, h1, s0, s1, l0, l1] of tiers) {
                if (clamped <= to) {
                    const t = (clamped - from) / (to - from);
                    hue = h0 + t * (h1 - h0);
                    sat = s0 + t * (s1 - s0);
                    lit = l0 + t * (l1 - l0);
                    break;
                }
            }
            return hsl2rgb(hue, sat, lit);
        };

        // Captain IDs from match_data
        const captains = mData.match_data.captain || {};
        const homeCaptainId = String(captains.home || '');
        const awayCaptainId = String(captains.away || '');

        const renderList = (team, color, clubName, logoId, side) => {
            const captainId = side === 'home' ? homeCaptainId : awayCaptainId;
            let h = '';
            team.starters.forEach(p => {
                const pid = String(p.player_id);
                const evts = eventIcons(p.player_id);
                const isCaptain = pid === captainId;
                const isMom = matchEnded && Number(p.mom) === 1;
                h += `<div class="rnd-lu-player rnd-lu-clickable" data-pid="${pid}">`;
                h += `<div class="rnd-lu-no" style="background:${color};color:#fff">${p.no}</div>`;
                h += `<span class="rnd-lu-name">${fmtName(p)}`;
                if (isCaptain) h += ` <span class="rnd-lu-captain" title="Captain">©</span>`;
                if (isMom) h += ` <span class="rnd-lu-mom" title="Man of the Match">⭐</span>`;
                h += `</span>`;
                if (evts) h += `<span class="rnd-lu-events">${evts}</span>`;
                h += `<span class="rnd-lu-pos">${p.position.toUpperCase()}</span>`;
                if (matchEnded) {
                    const rFmt = p.rating ? Number(p.rating).toFixed(2) : '-';
                    h += `<span class="rnd-lu-rating" style="color:${ratingColor(p.rating)}">${rFmt}</span>`;
                }
                h += `<span class="rnd-lu-r5" data-pid="${p.player_id}">···</span>`;
                h += `</div>`;
            });
            h += `<div class="rnd-lu-sub-header">Substitutes</div>`;
            team.subs.forEach(p => {
                const pid = String(p.player_id);
                const evts = eventIcons(p.player_id);
                const isCaptain = pid === captainId;
                const isMom = matchEnded && Number(p.mom) === 1;
                h += `<div class="rnd-lu-player rnd-lu-clickable" data-pid="${pid}">`;
                h += `<div class="rnd-lu-no" style="background:${color};color:#fff;opacity:0.6">${p.no}</div>`;
                h += `<span class="rnd-lu-name" style="color:#7a9a68">${fmtName(p)}`;
                if (isCaptain) h += ` <span class="rnd-lu-captain" title="Captain">©</span>`;
                if (isMom) h += ` <span class="rnd-lu-mom" title="Man of the Match">⭐</span>`;
                h += `</span>`;
                if (evts) h += `<span class="rnd-lu-events">${evts}</span>`;
                h += `<span class="rnd-lu-pos">${(p.fp || '').split(',')[0].toUpperCase()}</span>`;
                if (matchEnded) {
                    const rFmtS = p.rating ? Number(p.rating).toFixed(2) : '-';
                    h += `<span class="rnd-lu-rating" style="color:${ratingColor(p.rating)}">${rFmtS}</span>`;
                }
                h += `<span class="rnd-lu-r5" data-pid="${p.player_id}">···</span>`;
                h += `</div>`;
            });
            return h;
        };

        // ── Position → grid cell [row, col] (1-based) ──
        // Grid: 12 columns (home GK=1 ... away GK=12), 5 rows (L=1, CL=2, C=3, CR=4, R=5)
        // Home cols: GK=1, D=2, DM=3, M=4, OM=5, FC=6
        // Away cols: FC=7, OM=8, M=9, DM=10, D=11, GK=12
        // Rows: L=1, CL=2, C=3, CR=4, R=5  (for home DL is bottom=row5, DR is top=row1)
        const homePosMap = {
            gk: [3, 1],
            dl: [5, 2], dcl: [4, 2], dc: [3, 2], dcr: [2, 2], dr: [1, 2],
            dml: [5, 3], dmcl: [4, 3], dmc: [3, 3], dmcr: [2, 3], dmr: [1, 3],
            ml: [5, 4], mcl: [4, 4], mc: [3, 4], mcr: [2, 4], mr: [1, 4],
            oml: [5, 5], omcl: [4, 5], omc: [3, 5], omcr: [2, 5], omr: [1, 5],
            fcl: [4, 6], fc: [3, 6], fcr: [2, 6]
        };
        const awayPosMap = {
            gk: [3, 12],
            dl: [1, 11], dcl: [2, 11], dc: [3, 11], dcr: [4, 11], dr: [5, 11],
            dml: [1, 10], dmcl: [2, 10], dmc: [3, 10], dmcr: [4, 10], dmr: [5, 10],
            ml: [1, 9], mcl: [2, 9], mc: [3, 9], mcr: [4, 9], mr: [5, 9],
            oml: [1, 8], omcl: [2, 8], omc: [3, 8], omcr: [4, 8], omr: [5, 8],
            fcl: [2, 7], fc: [3, 7], fcr: [4, 7]
        };

        // SVG pitch markings (horizontal: 150 wide x 100 tall, ratio 3:2 matches container)
        const lw = 0.4, clr = 'rgba(255,255,255,0.22)', clr2 = 'rgba(255,255,255,0.3)';
        const pitchSVG = `<svg class="rnd-pitch-lines" viewBox="0 0 150 100" preserveAspectRatio="xMidYMid meet">
            <!-- outer boundary -->
            <rect x="0" y="0" width="150" height="100" fill="none" stroke="${clr}" stroke-width="0.5"/>
            <!-- halfway line -->
            <line x1="75" y1="0" x2="75" y2="100" stroke="${clr}" stroke-width="${lw}"/>
            <!-- center circle & spot -->
            <circle cx="75" cy="50" r="13" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <circle cx="75" cy="50" r="1.2" fill="${clr2}"/>
            <!-- LEFT penalty area (24 deep, 60 wide centered) -->
            <rect x="0" y="20" width="24" height="60" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- LEFT goal area (8 deep, 28 wide centered) -->
            <rect x="0" y="36" width="8" height="28" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- LEFT penalty spot -->
            <circle cx="16" cy="50" r="1.2" fill="${clr2}"/>
            <!-- LEFT penalty arc (D) -->
            <path d="M 24 39.75 A 13 13 0 0 1 24 60.25" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- RIGHT penalty area -->
            <rect x="126" y="20" width="24" height="60" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- RIGHT goal area -->
            <rect x="142" y="36" width="8" height="28" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- RIGHT penalty spot -->
            <circle cx="134" cy="50" r="1.2" fill="${clr2}"/>
            <!-- RIGHT penalty arc (D) -->
            <path d="M 126 39.75 A 13 13 0 0 0 126 60.25" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <!-- corner arcs -->
            <path d="M 0 1.5 A 1.5 1.5 0 0 1 1.5 0" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 0 98.5 A 1.5 1.5 0 0 0 1.5 100" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 148.5 0 A 1.5 1.5 0 0 1 150 1.5" fill="none" stroke="${clr}" stroke-width="${lw}"/>
            <path d="M 150 98.5 A 1.5 1.5 0 0 0 148.5 100" fill="none" stroke="${clr}" stroke-width="${lw}"/>
        </svg>`;

        // Build face image URL from udseende2 data
        const faceUrl = (p, clubColor) => {
            const u = p.udseende2 || {};
            const clrHex = clubColor.replace('#', '');
            return `https://trophymanager.com/pics/player_pic2.php?face=${u.face || 1}&nose=${u.nose || 1}&eyes=${u.eyes || 1}&ears=${u.ears || 1}&mouth=${u.mouth || 1}&brows=${u.brows || 1}&hcolor=${u.hair_color || 1}&scolor=${u.skin_color || 1}&hair=${u.hair || 1}&age=${p.age || 25}&rgb=${clrHex}&w=96`;
        };
        const faceNode = (p, clubColor) => {
            const url = faceUrl(p, clubColor);
            return `<div class="rnd-pitch-face" style="border:2.5px solid ${clubColor}">`
                + `<img src="${url}" alt="${p.no}"></div>`;
        };

        // Build grid cells: 5 rows × 12 cols = 60 cells
        // Use active roster (subs in, reds out) for pitch placement
        const roster = computeActiveRoster(mData, curMin, curEvtIdx);
        const allLineup = { ...mData.lineup.home, ...mData.lineup.away };

        const cellMap = {};  // "row-col" → html
        const cellPidMap = {};  // "row-col" → player id
        const placeNode = (pid, posMap, color, overridePos) => {
            const p = allLineup[pid];
            if (!p) return;
            const posKey = overridePos || p.position;
            const pos = posMap[posKey];
            if (!pos) return;
            const [row, col] = pos;
            const key = `${row}-${col}`;
            const evts = eventIcons(p.player_id);
            const rFmt = (matchEnded && p.rating) ? Number(p.rating).toFixed(1) : '';
            const isCaptain = String(p.player_id) === homeCaptainId || String(p.player_id) === awayCaptainId;
            const isMom = matchEnded && Number(p.mom) === 1;
            cellPidMap[key] = pid;
            let h = faceNode(p, color);
            // Captain armband indicator on face
            if (isCaptain) h += `<div class="rnd-pitch-captain">C</div>`;
            // MOM star on face
            if (isMom) h += `<div class="rnd-pitch-mom">⭐</div>`;
            h += `<div class="rnd-pitch-info">`;
            h += `<div class="rnd-pitch-label">${p.nameLast || fmtName(p)}</div>`;
            if (rFmt) h += `<div class="rnd-pitch-rating" style="color:${ratingColor(p.rating)}">${rFmt}</div>`;
            if (evts) h += `<div class="rnd-pitch-events">${evts}</div>`;
            h += `</div>`;
            cellMap[key] = h;
        };
        roster.homeActive.forEach(pid => {
            const overridePos = roster.subbedPositions.get(pid);
            placeNode(pid, homePosMap, homeColor, overridePos);
        });
        roster.awayActive.forEach(pid => {
            const overridePos = roster.subbedPositions.get(pid);
            placeNode(pid, awayPosMap, awayColor, overridePos);
        });

        // Build grid HTML
        let gridHTML = '';
        for (let r = 1; r <= 5; r++) {
            for (let c = 1; c <= 12; c++) {
                const key = `${r}-${c}`;
                const pidAttr = cellPidMap[key] ? ` data-pid="${cellPidMap[key]}"` : '';
                gridHTML += `<div class="rnd-pitch-cell"${pidAttr}>${cellMap[key] || ''}</div>`;
            }
        }

        let html = '';

        // ── Build per-side tactics HTML ──
        const md = mData.match_data;
        const mentalityMap = { 1: 'Very Defensive', 2: 'Defensive', 3: 'Slightly Defensive', 4: 'Normal', 5: 'Slightly Attacking', 6: 'Attacking', 7: 'Very Attacking' };
        const styleMap = { 1: 'Balanced', 2: 'Direct', 3: 'Wings', 4: 'Short Passing', 5: 'Long Balls', 6: 'Through Balls' };
        const focusMap = { 1: 'Balanced', 2: 'Left', 3: 'Central', 4: 'Right' };
        const focusIcons = { Balanced: '⚖️', Left: '⬅️', Central: '⬆️', Right: '➡️' };

        // Compute live mentality (apply mentality_change events up to current minute)
        const homeClubId = String(mData.club.home.id);
        const awayClubId = String(mData.club.away.id);
        const liveMentality = {
            home: Number(md.mentality ? md.mentality.home : 4),
            away: Number(md.mentality ? md.mentality.away : 4)
        };
        {
            const rpt = mData.report || {};
            Object.keys(rpt).forEach(minKey => {
                const eMin = Number(minKey);
                (rpt[minKey] || []).forEach((evt, si) => {
                    if (!isEventVisible(eMin, si, curMin, curEvtIdx)) return;
                    if (!evt.parameters) return;
                    evt.parameters.forEach(param => {
                        if (param.mentality_change) {
                            const mc = param.mentality_change;
                            const teamId = String(mc.team);
                            if (teamId === homeClubId) liveMentality.home = Number(mc.mentality);
                            else if (teamId === awayClubId) liveMentality.away = Number(mc.mentality);
                        }
                    });
                });
            });
        }

        const buildTactics = (side) => {
            const future = isMatchFuture(mData);
            let t = '<div class="rnd-tactics-section"><div class="rnd-tactics-grid">';
            // Avg R5 (filled async)
            t += `<div class="rnd-tactic-row r5-row" data-avg-r5="${side}">
                <span class="rnd-tactic-icon">⭐</span>
                <span class="rnd-tactic-label">Avg R5</span>
                <div class="rnd-tactic-meter"><div class="rnd-r5-side-meter-fill ${side}" style="width:0%"></div></div>
                <span class="rnd-r5-side-val" style="font-size:11px;font-weight:800;color:#e0f0cc;min-width:36px;text-align:right">···</span>
            </div>`;
            // Mentality (live) — skip for future matches
            if (!future) {
                const lvl = liveMentality[side];
                const val = mentalityMap[lvl] || lvl;
                t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">⚔️</span>
                    <span class="rnd-tactic-label">Mentality</span>
                    <div class="rnd-tactic-meter"><div class="rnd-tactic-meter-fill ${side}" style="width:${Math.round(lvl / 7 * 100)}%"></div></div>
                    <span class="rnd-tactic-value">${val}</span>
                </div>`;
            }
            // Attacking Style — skip for future matches
            if (!future && md.attacking_style) {
                const sVal = styleMap[md.attacking_style[side]] || md.attacking_style[side];
                t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">🎯</span>
                    <span class="rnd-tactic-label">Style</span>
                    <span class="rnd-tactic-value-pill ${side}">${sVal}</span>
                </div>`;
            }
            // Focus Side — skip for future matches
            if (!future && md.focus_side) {
                const fVal = focusMap[md.focus_side[side]] || md.focus_side[side];
                const fIcon = focusIcons[fVal] || '⬆️';
                t += `<div class="rnd-tactic-row">
                    <span class="rnd-tactic-icon">◎</span>
                    <span class="rnd-tactic-label">Focus</span>
                    <span class="rnd-tactic-value-pill ${side}">${fIcon} ${fVal}</span>
                </div>`;
            }
            t += '</div></div>';
            return t;
        };

        const isLive = liveState && !liveState.ended;

        // During live: if rnd-lu-wrap already exists, update ONLY the wrap content
        // This avoids destroying/recreating the Unity viewport (no blink)
        const existingWrap = body.find('.rnd-lu-wrap');
        if (isLive && existingWrap.length) {
            // Build only the wrap content (lists + pitch)
            let wrapHtml = '';
            wrapHtml += `<div class="rnd-lu-list">${renderList(home, homeColor, mData.club.home.club_name, homeId, 'home')}${buildTactics('home')}</div>`;
            wrapHtml += `<div class="rnd-pitch-wrap">
              <div class="rnd-pitch">${pitchSVG}<div class="rnd-pitch-grid">${gridHTML}</div></div>
            </div>`;
            wrapHtml += `<div class="rnd-lu-list">${renderList(away, awayColor, mData.club.away.club_name, awayId, 'away')}${buildTactics('away')}</div>`;
            existingWrap.html(wrapHtml);
        } else {
            // First render or match ended: full rebuild — save canvas first
            saveUnityCanvas();
            if (isLive) {
                html += '<div class="rnd-lu-outer">';
            }
            // Unity viewport row: feed | viewport | stats (hide when match ended)
            if (isMatchPage && isLive) {
                html += '<div class="rnd-unity-row">';
                html += '<div class="rnd-unity-feed" id="rnd-unity-feed"></div>';
                html += '<div id="rnd-unity-viewport" class="rnd-unity-viewport" style="display:none;flex:1 1 auto;"></div>';
                html += '<div class="rnd-unity-stats" id="rnd-unity-stats"></div>';
                html += '</div>';
            }
            html += '<div class="rnd-lu-wrap">';
            html += `<div class="rnd-lu-list">${renderList(home, homeColor, mData.club.home.club_name, homeId, 'home')}${buildTactics('home')}</div>`;
            html += `<div class="rnd-pitch-wrap">
              <div class="rnd-pitch">${pitchSVG}<div class="rnd-pitch-grid">${gridHTML}</div></div>
            </div>`;
            html += `<div class="rnd-lu-list">${renderList(away, awayColor, mData.club.away.club_name, awayId, 'away')}${buildTactics('away')}</div>`;
            html += '</div>';
            if (isLive) html += '</div>';

            body.html(html);

            // Player card dialog click handler
            body.on('click', '.rnd-lu-clickable', function () {
                const clickedPid = $(this).data('pid');
                if (!clickedPid) return;
                // Read live state at click time, not at render time
                const cMin = liveState ? liveState.min : 999;
                const cIdx = liveState ? liveState.curEvtIdx : 999;
                const cParamIdx = (liveState && !liveState.ended && !liveState.curEvtComplete) ? cIdx - 1 : cIdx;
                showPlayerDialog(clickedPid, mData, cMin, cParamIdx);
            });

            // Initialize stats panel with zeros
            updateUnityStats();

            // ── Pitch hover tooltip ──
            const GK_SKILL_NAMES = ['Str', 'Pac', 'Jum', 'Sta', 'One', 'Ref', 'Aer', 'Com', 'Kic', 'Thr', 'Han'];
            const FIELD_SKILL_NAMES = ['Str', 'Sta', 'Pac', 'Mar', 'Tac', 'Wor', 'Pos', 'Pas', 'Cro', 'Tec', 'Hea', 'Fin', 'Lon', 'Set'];
            let pitchTooltipEl = null;
            let pitchTooltipTimer = null;

            const removePitchTooltip = () => {
                clearTimeout(pitchTooltipTimer);
                if (pitchTooltipEl) { pitchTooltipEl.remove(); pitchTooltipEl = null; }
            };

            const skillValColor = (v) => {
                const n = parseInt(v);
                if (n >= 20) return '#d4af37';
                if (n >= 19) return '#c0c0c0';
                if (n >= 16) return '#66dd44';
                if (n >= 12) return '#cccc00';
                if (n >= 8) return '#ee9900';
                return '#ee6633';
            };

            body.on('mouseenter', '.rnd-pitch-cell[data-pid], .rnd-lu-player[data-pid]', function (e) {
                const cell = $(this);
                const pid = String(cell.data('pid'));
                removePitchTooltip();

                // Create tooltip with loading state
                pitchTooltipEl = $('<div class="rnd-pitch-tooltip"><div class="rnd-pitch-tooltip-loading">Loading...</div></div>').appendTo('body');
                const tt = pitchTooltipEl;

                // Position tooltip
                const rect = this.getBoundingClientRect();
                const ttLeft = rect.right + 8;
                const ttTop = rect.top;
                tt.css({ left: ttLeft + 'px', top: ttTop + 'px' });

                // Show after brief delay
                pitchTooltipTimer = setTimeout(() => {
                    tt.addClass('visible');
                }, 80);

                // Fetch player data
                fetchTooltip(pid).then(rawData => {
                    if (!pitchTooltipEl || pitchTooltipEl !== tt) return; // tooltip was removed
                    const player = JSON.parse(JSON.stringify(rawData.player));
                    const lineupP = allLineup[pid];
                    if (routineMap.has(pid)) player.routine = String(routineMap.get(pid));
                    if (positionMap.has(pid)) player.favposition = positionMap.get(pid);

                    const asi = parseNum(player.skill_index);
                    const xp = parseNum(player.routine);
                    const positions = player.favposition.split(',');
                    const posIdx = getPositionIndex(positions[0]);
                    const skills = extractSkills(player, posIdx);
                    const isGK = posIdx === 9;
                    const skillNames = isGK ? GK_SKILL_NAMES : FIELD_SKILL_NAMES;

                    let r5 = Number(calculateR5(posIdx, skills, asi, xp));
                    let rec = Number(calculateRemainders(posIdx, skills, asi).rec);
                    if (positions.length > 1) {
                        const posIdx2 = getPositionIndex(positions[1]);
                        if (posIdx2 !== posIdx) {
                            const r5_2 = Number(calculateR5(posIdx2, skills, asi, xp));
                            const rec_2 = Number(calculateRemainders(posIdx2, skills, asi).rec);
                            if (r5_2 > r5) r5 = r5_2;
                            if (rec_2 > rec) rec = rec_2;
                        }
                    }

                    let h = '<div class="rnd-pitch-tooltip-header">';
                    h += `<div><div class="rnd-pitch-tooltip-name">${player.name || lineupP?.name || ''}</div>`;
                    const ageYears = Number(player.age || lineupP?.age || 0);
                    const ageMonths = Number(player.months || 0);
                    const ageDisplay = ageMonths ? `${ageYears}.${ageMonths}` : String(ageYears || '?');
                    let infoLine = `${(lineupP?.position || '').toUpperCase()} · #${lineupP?.no || ''} · Age ${ageDisplay}`;
                    if (player.country) {
                        const flagUrl = `https://trophymanager.com/pics/flags/gradient/${player.country}.png`;
                        infoLine += ` · <img src="${flagUrl}" style="height:11px;vertical-align:-1px;margin:0 2px" onerror="this.style.display='none'">`;
                    }
                    h += `<div class="rnd-pitch-tooltip-pos">${infoLine}</div></div>`;
                    h += '<div class="rnd-pitch-tooltip-badges">';
                    h += `<span class="rnd-pitch-tooltip-badge" style="color:${r5Color(r5)}">R5 ${r5.toFixed(2)}</span>`;
                    h += '</div></div>';

                    // Skills two-column layout
                    const fieldLeft = [0, 1, 2, 3, 4, 5, 6];    // Str,Sta,Pac,Mar,Tac,Wor,Pos
                    const fieldRight = [7, 8, 9, 10, 11, 12, 13]; // Pas,Cro,Tec,Hea,Fin,Lon,Set
                    const gkLeft = [0, 3, 1];                // Str,Sta,Pac
                    const gkRight = [10, 4, 5, 6, 2, 7, 8, 9];    // Han,One,Ref,Aer,Jum,Com,Kic,Thr
                    const leftIdx = isGK ? gkLeft : fieldLeft;
                    const rightIdx = isGK ? gkRight : fieldRight;

                    const renderCol = (indices) => {
                        let c = '<div class="rnd-pitch-tooltip-skills-col">';
                        indices.forEach(i => {
                            const val = typeof skills[i] === 'number' ? skills[i] : parseInt(skills[i]);
                            const display = val >= 20 ? '★' : val >= 19 ? '★' : String(val);
                            c += `<div class="rnd-pitch-tooltip-skill">`;
                            c += `<span class="rnd-pitch-tooltip-skill-name">${skillNames[i] || ''}</span>`;
                            c += `<span class="rnd-pitch-tooltip-skill-val" style="color:${skillValColor(val)}">${display}</span>`;
                            c += '</div>';
                        });
                        c += '</div>';
                        return c;
                    };
                    h += '<div class="rnd-pitch-tooltip-skills">';
                    h += renderCol(leftIdx);
                    h += renderCol(rightIdx);
                    h += '</div>';

                    // Footer: ASI, REC, Routine, Rating
                    h += '<div class="rnd-pitch-tooltip-footer">';
                    h += `<div class="rnd-pitch-tooltip-stat"><div class="rnd-pitch-tooltip-stat-val" style="color:#e0f0cc">${parseNum(player.skill_index).toLocaleString()}</div><div class="rnd-pitch-tooltip-stat-lbl">ASI</div></div>`;
                    h += `<div class="rnd-pitch-tooltip-stat"><div class="rnd-pitch-tooltip-stat-val" style="color:${getColor(rec, REC_THRESHOLDS)}">${rec}</div><div class="rnd-pitch-tooltip-stat-lbl">REC</div></div>`;
                    h += `<div class="rnd-pitch-tooltip-stat"><div class="rnd-pitch-tooltip-stat-val" style="color:#8abc78">${parseFloat(player.routine).toFixed(1)}</div><div class="rnd-pitch-tooltip-stat-lbl">Routine</div></div>`;
                    h += '</div>';

                    tt.html(h);

                    // Reposition if off-screen
                    const ttRect = tt[0].getBoundingClientRect();
                    if (ttRect.right > window.innerWidth - 10) {
                        tt.css('left', (rect.left - ttRect.width - 8) + 'px');
                    }
                    if (ttRect.bottom > window.innerHeight - 10) {
                        tt.css('top', Math.max(10, window.innerHeight - ttRect.height - 10) + 'px');
                    }
                }).catch(() => {
                    if (pitchTooltipEl === tt) {
                        tt.html('<div class="rnd-pitch-tooltip-loading">No data</div>');
                    }
                });
            });

            body.on('mouseleave', '.rnd-pitch-cell[data-pid], .rnd-lu-player[data-pid]', removePitchTooltip);

            // ── Unity: move canvas into viewport on match page ──
            if (isMatchPage && unityState.available) {
                setTimeout(() => {
                    const vp = document.getElementById('rnd-unity-viewport');
                    if (vp) {
                        moveUnityCanvas();
                        vp.style.display = 'block';
                    }
                }, 100);
            }
        }



        // Async: fetch R5 for all players
        const routineMap = new Map();
        const positionMap = new Map();
        const allPlayers = [...Object.values(mData.lineup.home), ...Object.values(mData.lineup.away)];
        allPlayers.forEach(p => {
            routineMap.set(p.player_id, parseFloat(p.routine));
            if (p.fp) positionMap.set(p.player_id, p.fp);
        });
        // Active roster IDs for avg R5 (based on current live minute — subs/reds applied)
        const homeActiveIds = roster.homeActive;
        const awayActiveIds = roster.awayActive;
        Promise.all(allPlayers.map(p =>
            getPlayerData(p.player_id, routineMap, positionMap)
                .then(d => ({ id: p.player_id, r5: d.R5 }))
                .catch(() => ({ id: p.player_id, r5: null }))
        )).then(results => {
            const homeR5s = [], awayR5s = [];
            results.forEach(({ id, r5 }) => {
                const el = body.find(`.rnd-lu-r5[data-pid="${id}"]`);
                if (el.length && r5 !== null) {
                    el.text(r5.toFixed(2)).css('background', r5Color(r5));
                }
                // Only currently active players count for avg R5
                if (r5 !== null) {
                    if (homeActiveIds.has(String(id))) homeR5s.push(r5);
                    else if (awayActiveIds.has(String(id))) awayR5s.push(r5);
                }
            });
            // Fill avg R5 bars (always /11 even if red card reduced count)
            const fillAvg = (side, vals) => {
                if (!vals.length) return;
                const avg = vals.reduce((a, b) => a + b, 0) / 11;
                const pct = Math.min(100, Math.max(0, Math.round((avg - 40) / (120 - 40) * 100)));
                const card = body.find(`[data-avg-r5="${side}"]`);
                card.find('.rnd-r5-side-meter-fill').css('width', pct + '%');
                card.find('.rnd-r5-side-val').text(avg.toFixed(2)).css('color', r5Color(avg));
            };
            fillAvg('home', homeR5s);
            fillAvg('away', awayR5s);
            // Update header R5 chips
            const headerR5 = (side, vals) => {
                if (!vals.length) return;
                const avg = (vals.reduce((a, b) => a + b, 0) / 11).toFixed(2);
                $(`#rnd-chip-r5-${side} .chip-val`).text(avg);
            };
            headerR5('home', homeR5s);
            headerR5('away', awayR5s);
        });
    };

    // ── Player Card Dialog (Lineups click) ──
    const showPlayerDialog = (playerId, mData, curMin = 999, curEvtIdx = 999) => {
        // Remove any existing dialog
        $('.rnd-plr-overlay').remove();

        const pid = String(playerId);
        const homeId = mData.club.home.id;
        const isHome = !!mData.lineup.home[pid];
        const lineup = isHome ? mData.lineup.home : mData.lineup.away;
        const p = lineup[pid];
        if (!p) return;

        const clubColor = '#' + ((isHome ? mData.club.home : mData.club.away).colors?.club_color1 || '4a9030');
        const clubName = (isHome ? mData.club.home : mData.club.away).club_name || '';

        // Face URL
        const u = p.udseende2 || {};
        const clrHex = clubColor.replace('#', '');
        const fUrl = `https://trophymanager.com/pics/player_pic2.php?face=${u.face || 1}&nose=${u.nose || 1}&eyes=${u.eyes || 1}&ears=${u.ears || 1}&mouth=${u.mouth || 1}&brows=${u.brows || 1}&hcolor=${u.hair_color || 1}&scolor=${u.skin_color || 1}&hair=${u.hair || 1}&age=${p.age || 25}&rgb=${clrHex}&w=96`;

        // Rating color helper
        const ratClr = (r) => {
            if (!r || r === 0) return '#5a7a48';
            const v = Number(r);
            if (v >= 9.0) return '#00c040';
            if (v >= 8.5) return '#00dd50';
            if (v >= 8.0) return '#22e855';
            if (v >= 7.5) return '#44ee55';
            if (v >= 7.0) return '#66dd44';
            if (v >= 6.5) return '#88cc33';
            if (v >= 6.0) return '#99bb22';
            if (v >= 5.5) return '#aacc00';
            if (v >= 5.0) return '#bbcc00';
            if (v >= 4.5) return '#dd9900';
            if (v >= 4.0) return '#ee7733';
            if (v >= 3.5) return '#ee5533';
            if (v >= 3.0) return '#dd3333';
            if (v >= 2.0) return '#cc2222';
            return '#bb1111';
        };

        // Player names map for accordion rendering
        const playerNames = buildPlayerNames(mData);

        // ── Compute player stats from video segments ──
        const PASS_VIDS = /^(short|preshort|through|longball|gkthrow|gkkick)/;
        const CROSS_VIDS = /^(wing(?!start)|cornerkick|freekick)/;
        const DEFWIN_VIDS = /^defwin/;
        const FINISH_VIDS = /^(finish|finishlong|header|acrobat)/;
        const RUN_DUEL_VIDS = /^finrun/;
        const report = mData.report || {};
        const sortedMins = Object.keys(report).map(Number).sort((a, b) => a - b);
        const st = {
            sp: 0, up: 0, sc: 0, uc: 0,                     // passes & crosses
            sh: 0, sot: 0, shf: 0, sotf: 0, gf: 0,         // shooting (foot)
            shh: 0, soth: 0, gh: 0,                          // shooting (head)
            sv: 0, g: 0, a: 0, kp: 0,                        // goals, assists, key passes
            dw: 0, dl: 0,                                     // duels
            int: 0, tkl: 0, hc: 0, tf: 0,                    // defending
            fouls: 0, yc: 0, rc: 0,                           // discipline
        };
        const isGK = p.position === 'gk';
        const playerEvents = []; // all events where this player was involved

        for (const min of sortedMins) {
            const evts = report[String(min)] || [];
            for (let si = 0; si < evts.length; si++) {
                if (!isEventVisible(min, si, curMin, curEvtIdx)) continue;
                const evt = evts[si];
                const vids = evt.chance?.video;
                const evtHasShot = evt.parameters?.some(pr => pr.shot);
                const evtShotOnTarget = evt.parameters?.find(pr => pr.shot)?.shot?.target === 'on';
                let involved = false;
                let action = '';

                if (vids && Array.isArray(vids)) {
                    for (let vi = 0; vi < vids.length; vi++) {
                        const v = vids[vi];
                        if (PASS_VIDS.test(v.video)) {
                            const passerId = /^gk(throw|kick)/.test(v.video) ? String(v.gk) : String(v.att1);
                            if (passerId === pid) {
                                const isPreshort = /^preshort/.test(v.video);
                                const textLines = (evt.chance?.text?.[vi] || []);
                                if (isPreshort && !textLines.some(l => l.includes('[player=' + passerId + ']'))) {
                                    // Skip
                                } else {
                                    const failed = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                    if (failed) { st.up++; involved = true; action = 'pass_fail'; }
                                    else {
                                        st.sp++;
                                        if (evtHasShot) st.kp++;
                                        involved = true; action = 'pass_ok';
                                    }
                                }
                            }
                        }
                        if (CROSS_VIDS.test(v.video) && String(v.att1) === pid) {
                            if (/^freekick/.test(v.video) && evtHasShot) {
                                st.sh++; st.shf++;
                                if (evtShotOnTarget) { st.sot++; st.sotf++; }
                                involved = true; action = 'shot';
                            } else {
                                const failed = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                                if (failed) { st.uc++; involved = true; action = 'cross_fail'; }
                                else {
                                    st.sc++;
                                    if (evtHasShot) st.kp++;
                                    involved = true; action = 'cross_ok';
                                }
                            }
                        }
                        if (FINISH_VIDS.test(v.video) && String(v.att1) === pid) {
                            const nextIsAlsoFinish = vi + 1 < vids.length && FINISH_VIDS.test(vids[vi + 1].video);
                            if (!nextIsAlsoFinish) {
                                const isHead = /^header/.test(v.video);
                                st.sh++;
                                if (isHead) {
                                    st.shh++;
                                    if (evtShotOnTarget) { st.sot++; st.soth++; }
                                } else {
                                    st.shf++;
                                    if (evtShotOnTarget) { st.sot++; st.sotf++; }
                                }
                                const hasGoalForShooter = evt.parameters?.some(p => p.goal && String(p.goal.player) === pid);
                                if (!hasGoalForShooter) { involved = true; action = 'shot'; }
                            }
                        }
                        if (DEFWIN_VIDS.test(v.video)) {
                            const tLines = (evt.chance?.text || []).flat();
                            const winner = [v.def1, v.def2].find(d => d && tLines.some(l => l.includes('[player=' + d + ']')));
                            if (winner && String(winner) === pid) {
                                const prevVideo = vi > 0 ? vids[vi - 1].video : '';
                                const isFinrunBefore = RUN_DUEL_VIDS.test(prevVideo);
                                const isCornerkickBefore = /^cornerkick/.test(prevVideo);
                                if (isFinrunBefore) { st.dw++; }
                                else if (!isCornerkickBefore) { st.dw++; }
                                // Defense classification
                                const defwinTextLines = evt.chance?.text?.[vi] || [];
                                const isHeader = defwinTextLines.some(l => /\bheader\b|\bhead(ed|s)?\b/i.test(l));
                                if (/^defwin5$/.test(v.video) || isHeader) { st.hc++; involved = true; action = 'header_clear'; }
                                else if (/^defwin(3|6)$/.test(v.video)) { st.tkl++; involved = true; action = 'tackle'; }
                                else { st.int++; involved = true; action = 'intercept'; }
                            }
                        }
                        if (RUN_DUEL_VIDS.test(v.video)) {
                            const nextIsDefwin = vi + 1 < vids.length && DEFWIN_VIDS.test(vids[vi + 1].video);
                            if (!nextIsDefwin) {
                                const prevVideo = vi > 0 ? vids[vi - 1].video : '';
                                if (!/^cornerkick/.test(prevVideo)) {
                                    const tLines = (evt.chance?.text || []).flat();
                                    [v.def1, v.def2].forEach(d => {
                                        if (d && String(d) === pid && tLines.some(l => l.includes('[player=' + d + ']'))) {
                                            st.dl++; involved = true; action = 'duel_lost';
                                        }
                                    });
                                }
                                // Tackle failed
                                const nextVid = vi + 1 < vids.length ? vids[vi + 1].video : '';
                                if (FINISH_VIDS.test(nextVid) && v.def1 && String(v.def1) === pid) {
                                    st.tf++; involved = true; action = 'tackle_fail';
                                }
                            }
                        }
                        if (/^save/.test(v.video) && String(v.gk) === pid) {
                            st.sv++; involved = true; action = 'save';
                        }
                        if (/^foulcall/.test(v.video) && v.def1 && String(v.def1) === pid) {
                            st.fouls++; involved = true; action = 'foul';
                        }
                    }
                }
                // Goals, assists, cards from parameters
                if (evt.parameters) {
                    evt.parameters.forEach(param => {
                        if (param.goal && String(param.goal.player) === pid) {
                            st.g++; involved = true; action = 'goal';
                            // Foot vs head goal
                            const isPenGoal = evt.parameters.some(p => p.penalty);
                            if (!isPenGoal) {
                                const evtVids = evt.chance?.video;
                                const isHeaderGoal = evtVids && Array.isArray(evtVids) && evtVids.some(v => /^header/.test(v.video));
                                if (isHeaderGoal) st.gh++;
                                else st.gf++;
                            }
                        }
                        if (param.goal && String(param.goal.assist) === pid) {
                            st.a++; involved = true; action = 'assist';
                        }
                        if (param.yellow && String(param.yellow) === pid) { st.yc++; involved = true; action = 'yellow'; }
                        if (param.yellow_red && String(param.yellow_red) === pid) { st.yc++; st.rc++; involved = true; action = 'red'; }
                        if (param.red && String(param.red) === pid) { st.rc++; involved = true; action = 'red'; }
                    });
                }
                if (involved) {
                    playerEvents.push({ min, evtIdx: si, evt, action });
                }
            }
        }

        // ── Minutes played ──
        const isSub = p.position.includes('sub');
        let minsPlayed;
        const subEvts = {};
        for (const min of sortedMins) {
            (report[String(min)] || []).forEach(evt => {
                if (!evt.parameters) return;
                evt.parameters.forEach(param => {
                    if (param.sub) {
                        if (String(param.sub.player_in) === pid) subEvts.subInMin = min;
                        if (String(param.sub.player_out) === pid) subEvts.subOutMin = min;
                    }
                });
            });
        }
        const matchEndMin = mData.match_data?.regular_last_min || Math.max(...sortedMins, 90);
        if (isSub) {
            minsPlayed = subEvts.subInMin ? (subEvts.subOutMin || matchEndMin) - subEvts.subInMin : 0;
        } else {
            minsPlayed = subEvts.subOutMin || matchEndMin;
        }

        // ── Position display ──
        const posDisplay = isSub ? (p.fp || '').split(',')[0].toUpperCase() : p.position.toUpperCase();

        // ── Build HTML ──
        const ACTION_LABELS = { pass_ok: 'pass ✓', pass_fail: 'pass ✗', cross_ok: 'cross ✓', cross_fail: 'cross ✗', shot: 'shot', save: 'save', goal: 'goal', assist: 'assist', duel_won: 'duel ✓', duel_lost: 'duel ✗', intercept: 'INT', tackle: 'TKL', header_clear: 'HC', tackle_fail: 'TF', foul: 'foul', yellow: '🟨', red: '🟥' };
        const ACTION_CLS = { pass_ok: 'shot', pass_fail: 'lost', cross_ok: 'shot', cross_fail: 'lost', shot: 'shot', save: 'shot', goal: 'goal', assist: 'goal', duel_won: 'shot', duel_lost: 'lost', intercept: 'shot', tackle: 'shot', header_clear: 'shot', tackle_fail: 'lost', foul: 'lost', yellow: 'lost', red: 'lost' };

        const playerUrl = `https://trophymanager.com/players/${pid}/#/page/history/`;
        const matchEnded = !liveState || liveState.ended;

        let html = '<div class="rnd-plr-overlay"><div class="rnd-plr-dialog" style="position:relative">';
        html += '<button class="rnd-plr-close">&times;</button>';

        // Header: face + info + R5 (loaded async)
        html += '<div class="rnd-plr-header">';
        html += `<div class="rnd-plr-face"><img src="${fUrl}" alt="${p.no}"></div>`;
        html += '<div class="rnd-plr-info">';
        html += '<div class="rnd-plr-name-row">';
        html += `<a class="rnd-plr-name" href="${playerUrl}" target="_blank">${p.name || p.nameLast || ''}</a>`;
        html += `<a class="rnd-plr-link" href="${playerUrl}" target="_blank" title="Open player profile">&#x1F517;</a>`;
        html += '</div>';
        html += '<div class="rnd-plr-badges">';
        html += `<span class="rnd-plr-badge"><span class="badge-icon">👕</span> #${p.no}</span>`;
        html += `<span class="rnd-plr-badge"><span class="badge-icon">📍</span> ${posDisplay}</span>`;
        html += `<span class="rnd-plr-badge" id="rnd-plr-age-badge-${pid}"><span class="badge-icon">🎂</span> ${p.age || '?'}</span>`;
        if (matchEnded) html += `<span class="rnd-plr-badge"><span class="badge-icon">⏱️</span> ${minsPlayed}'</span>`;
        html += '</div></div>';
        if (matchEnded && p.rating) {
            const rVal = Number(p.rating).toFixed(2);
            html += '<div class="rnd-plr-rating-wrap">';
            html += `<div class="rnd-plr-rating-big" style="color:${ratClr(p.rating)}">${rVal}</div>`;
            html += '<div class="rnd-plr-rating-label">Rating</div>';
            html += '</div>';
        }
        html += '</div>';

        // Body: profile + stats + chances
        html += '<div class="rnd-plr-body">';

        // ── Player Profile (skills, ASI, R5, REC, Routine) — loaded async ──
        html += '<div class="rnd-plr-section-title"><span class="sec-icon">🧑</span> Player Profile</div>';
        html += `<div class="rnd-plr-profile-wrap" id="rnd-plr-profile-${pid}"><div class="rnd-plr-profile-loading">⏳ Loading player data...</div></div>`;

        // ── Shooting ──
        html += '<div class="rnd-plr-section-title"><span class="sec-icon">🎯</span> Shooting</div>';
        html += '<div class="rnd-plr-stats-row">';
        const convPct = st.sh > 0 ? Math.round(st.g / st.sh * 100) : 0;
        const onTargetPct = st.sh > 0 ? Math.round(st.sot / st.sh * 100) : 0;
        if (isGK) {
            [{ icon: '🧤', lbl: 'Saves', val: st.sv, cls: st.sv > 0 ? 'green' : '' },
             { icon: '⚽', lbl: 'Goals', val: st.g, cls: st.g > 0 ? 'gold' : '' },
             { icon: '👟', lbl: 'Assists', val: st.a, cls: st.a > 0 ? 'gold' : '' },
             { icon: '🔑', lbl: 'Key Pass', val: st.kp, cls: st.kp > 0 ? '' : '' },
             { icon: '🎯', lbl: 'Shots', val: st.sh, cls: '' },
            ].forEach(s => {
                html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
            });
        } else {
            [{ icon: '⚽', lbl: 'Goals', val: st.g, cls: st.g > 0 ? 'gold' : '' },
             { icon: '🎯', lbl: 'Shots', val: st.sh, cls: '' },
             { icon: '✅', lbl: 'On Target', val: st.sot, cls: st.sot > 0 ? 'green' : '' },
             { icon: '🦶', lbl: 'Foot G', val: st.gf, cls: st.gf > 0 ? 'gold' : '' },
             { icon: '🗣️', lbl: 'Head G', val: st.gh, cls: st.gh > 0 ? 'gold' : '' },
            ].forEach(s => {
                html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
            });
        }
        html += '</div>';

        // ── Passing & Creativity ──
        html += '<div class="rnd-plr-section-title"><span class="sec-icon">📊</span> Passing & Creativity</div>';
        html += '<div class="rnd-plr-stats-row">';
        const totalPasses = st.sp + st.up;
        const passAcc = totalPasses > 0 ? Math.round(st.sp / totalPasses * 100) : 0;
        const totalCross = st.sc + st.uc;
        const crossAcc = totalCross > 0 ? Math.round(st.sc / totalCross * 100) : 0;
        [{ icon: '👟', lbl: 'Assists', val: st.a, cls: st.a > 0 ? 'gold' : '' },
         { icon: '🔑', lbl: 'Key Pass', val: st.kp, cls: st.kp > 0 ? '' : '' },
         { icon: '📨', lbl: `Pass ${passAcc}%`, val: `${st.sp}/${totalPasses}`, cls: passAcc >= 70 ? 'green' : totalPasses > 0 ? 'red' : '' },
         { icon: '↗️', lbl: `Cross ${crossAcc}%`, val: `${st.sc}/${totalCross}`, cls: crossAcc >= 50 ? 'green' : totalCross > 0 ? 'red' : '' },
         { icon: '📈', lbl: 'Total', val: totalPasses + totalCross, cls: '' },
        ].forEach(s => {
            html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
        });
        html += '</div>';

        // ── Defending & Duels ──
        html += '<div class="rnd-plr-section-title"><span class="sec-icon">🛡️</span> Defending & Duels</div>';
        html += '<div class="rnd-plr-stats-row">';
        const totalDuels = st.dw + st.dl;
        const duelPct = totalDuels > 0 ? Math.round(st.dw / totalDuels * 100) : 0;
        [{ icon: '👁️', lbl: 'INT', val: st.int, cls: st.int > 0 ? 'green' : '' },
         { icon: '🦵', lbl: 'TKL', val: st.tkl, cls: st.tkl > 0 ? 'green' : '' },
         { icon: '🗣️', lbl: 'HC', val: st.hc, cls: st.hc > 0 ? 'green' : '' },
         { icon: '❌', lbl: 'TF', val: st.tf, cls: st.tf > 0 ? 'red' : '' },
         { icon: '⚠️', lbl: 'Fouls', val: st.fouls, cls: st.fouls > 0 ? 'red' : '' },
        ].forEach(s => {
            html += `<div class="rnd-plr-stat-card ${s.cls}"><div class="rnd-plr-stat-icon">${s.icon}</div><div class="rnd-plr-stat-val">${s.val}</div><div class="rnd-plr-stat-lbl">${s.lbl}</div></div>`;
        });
        html += '</div>';

        // Chances list
        if (playerEvents.length) {
            html += '<div class="rnd-plr-section-title"><span class="sec-icon">⚡</span> Chances Involved (' + playerEvents.length + ')</div>';
            html += '<div class="rnd-adv-evt-list">';
            playerEvents.forEach(ev => {
                const acls = ACTION_CLS[ev.action] || '';
                const albl = ACTION_LABELS[ev.action] || '';
                html += '<div class="rnd-adv-evt">';
                if (albl) html += `<span class="adv-result-tag ${acls}">${albl}</span>`;
                html += buildReportEventHtml(ev.evt, ev.min, ev.evtIdx, playerNames, homeId);
                html += '</div>';
            });
            html += '</div>';
        } else {
            html += '<div style="text-align:center;padding:12px;color:#4a6a38;font-size:12px">No recorded chances</div>';
        }

        html += '</div></div></div>';

        // Append to body
        const $overlay = $(html).appendTo('body');

        // Close handlers
        $overlay.find('.rnd-plr-close').on('click', () => $overlay.remove());
        $overlay.on('click', (e) => { if ($(e.target).hasClass('rnd-plr-overlay')) $overlay.remove(); });

        // Wire accordion for embedded events
        $overlay.on('click', '.rnd-acc-head', function (e) {
            e.stopPropagation();
            $(this).closest('.rnd-acc').toggleClass('open');
        });

        // ── Async: load player profile (skills, ASI, R5, REC, Routine) ──
        const profileEl = $overlay.find(`#rnd-plr-profile-${pid}`);
        const routineMap = new Map();
        const positionMap = new Map();
        // Populate from lineup data
        const allLineupForCard = { ...mData.lineup.home, ...mData.lineup.away };
        Object.entries(allLineupForCard).forEach(([id, lp]) => {
            routineMap.set(id, Number(lp.routine));
            if (!lp.position.includes('sub')) positionMap.set(id, lp.position);
        });

        fetchTooltip(pid).then(rawData => {
            if (!profileEl.length || !profileEl.closest('body').length) return;
            const player = JSON.parse(JSON.stringify(rawData.player));
            if (routineMap.has(pid)) player.routine = String(routineMap.get(pid));
            if (positionMap.has(pid)) player.favposition = positionMap.get(pid);

            const asi = parseNum(player.skill_index);
            const xp = parseNum(player.routine);
            const positions = player.favposition.split(',');
            const posIdx = getPositionIndex(positions[0]);
            const skills = extractSkills(player, posIdx);
            const isGKProfile = posIdx === 9;

            const GK_NAMES = ['Str', 'Pac', 'Jum', 'Sta', 'One', 'Ref', 'Aer', 'Com', 'Kic', 'Thr', 'Han'];
            const FIELD_NAMES = ['Str', 'Sta', 'Pac', 'Mar', 'Tac', 'Wor', 'Pos', 'Pas', 'Cro', 'Tec', 'Hea', 'Fin', 'Lon', 'Set'];
            const skillNames = isGKProfile ? GK_NAMES : FIELD_NAMES;

            let r5 = Number(calculateR5(posIdx, skills, asi, xp));
            let rec = Number(calculateRemainders(posIdx, skills, asi).rec);
            if (positions.length > 1) {
                const posIdx2 = getPositionIndex(positions[1]);
                if (posIdx2 !== posIdx) {
                    const r5_2 = Number(calculateR5(posIdx2, skills, asi, xp));
                    const rec_2 = Number(calculateRemainders(posIdx2, skills, asi).rec);
                    if (r5_2 > r5) r5 = r5_2;
                    if (rec_2 > rec) rec = rec_2;
                }
            }

            const svc = (v) => {
                const n = parseInt(v);
                if (n >= 20) return '#d4af37';
                if (n >= 19) return '#c0c0c0';
                if (n >= 16) return '#66dd44';
                if (n >= 12) return '#cccc00';
                if (n >= 8) return '#ee9900';
                return '#ee6633';
            };

            // Build skills grid
            const leftIdx = isGKProfile ? [0, 3, 1] : [0, 1, 2, 3, 4, 5, 6];
            const rightIdx = isGKProfile ? [10, 4, 5, 6, 2, 7, 8, 9] : [7, 8, 9, 10, 11, 12, 13];
            const maxLen = Math.max(leftIdx.length, rightIdx.length);

            let ph = '';
            // Country row
            if (player.country) {
                const flagUrl = `https://trophymanager.com/pics/flags/gradient/${player.country}.png`;
                const countryName = player.country_name || player.country || '';
                ph += `<div class="rnd-plr-country-row">`;
                ph += `<img class="rnd-plr-country-flag" src="${flagUrl}" onerror="this.style.display='none'">`;
                ph += `<span class="rnd-plr-country-name">${countryName}</span>`;
                ph += `</div>`;
            }

            ph += '<div class="rnd-plr-skills-grid">';
            // Left column
            ph += '<div>';
            leftIdx.forEach(i => {
                const val = typeof skills[i] === 'number' ? skills[i] : parseInt(skills[i]);
                let display, starCls = '';
                if (val >= 20) { display = '★'; starCls = ' rnd-plr-skill-star'; }
                else if (val >= 19) { display = '★'; starCls = ' rnd-plr-skill-star silver'; }
                else display = String(val);
                ph += `<div class="rnd-plr-skill-row">`;
                ph += `<span class="rnd-plr-skill-name">${skillNames[i] || ''}</span>`;
                ph += `<span class="rnd-plr-skill-val${starCls}" style="color:${svc(val)}">${display}</span>`;
                ph += '</div>';
            });
            ph += '</div>';
            // Right column
            ph += '<div>';
            rightIdx.forEach(i => {
                const val = typeof skills[i] === 'number' ? skills[i] : parseInt(skills[i]);
                let display, starCls = '';
                if (val >= 20) { display = '★'; starCls = ' rnd-plr-skill-star'; }
                else if (val >= 19) { display = '★'; starCls = ' rnd-plr-skill-star silver'; }
                else display = String(val);
                ph += `<div class="rnd-plr-skill-row">`;
                ph += `<span class="rnd-plr-skill-name">${skillNames[i] || ''}</span>`;
                ph += `<span class="rnd-plr-skill-val${starCls}" style="color:${svc(val)}">${display}</span>`;
                ph += '</div>';
            });
            ph += '</div>';
            ph += '</div>';

            // Footer: ASI, R5, REC, Routine
            ph += '<div class="rnd-plr-profile-footer">';
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:#e0f0cc">${asi.toLocaleString()}</div><div class="rnd-plr-profile-stat-lbl">ASI</div></div>`;
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:${getColor(r5, R5_THRESHOLDS)}">${r5.toFixed(2)}</div><div class="rnd-plr-profile-stat-lbl">R5</div></div>`;
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:${getColor(rec, REC_THRESHOLDS)}">${rec}</div><div class="rnd-plr-profile-stat-lbl">REC</div></div>`;
            ph += `<div class="rnd-plr-profile-stat"><div class="rnd-plr-profile-stat-val" style="color:#8abc78">${parseFloat(player.routine).toFixed(1)}</div><div class="rnd-plr-profile-stat-lbl">Routine</div></div>`;
            ph += '</div>';

            profileEl.html(ph);

            // Update age badge with months
            const ageBadge = $(`#rnd-plr-age-badge-${pid}`);
            if (ageBadge.length) {
                const ageMonths = Number(player.months || 0);
                const ageYears = Number(player.age || 0);
                const ageDisplay = ageMonths ? `${ageYears}.${ageMonths}` : String(ageYears || '?');
                ageBadge.html(`<span class="badge-icon">🎂</span> ${ageDisplay}`);
            }
        }).catch(() => {
            profileEl.html('<div class="rnd-plr-profile-loading" style="color:#aa5533">Failed to load profile</div>');
        });
    };

    const renderH2HTab = (body, mData) => {
        body.html('<div style="text-align:center;padding:20px;color:#5a7a48">⏳ Loading H2H...</div>');

        const homeId = String(mData.club.home.id);
        const awayId = String(mData.club.away.id);
        const homeName = mData.club.home.club_name;
        const awayName = mData.club.away.club_name;
        const homeLogo = mData.club.home.logo || `/pics/club_logos/${homeId}_140.png`;
        const awayLogo = mData.club.away.logo || `/pics/club_logos/${awayId}_140.png`;
        const kickoff = mData.match_data.venue.kickoff || Math.floor(Date.now() / 1000);

        $.get(`/ajax/match_h2h.ajax.php?home_team=${homeId}&away_team=${awayId}&date=${kickoff}`).done(res => {
            const data = typeof res === 'string' ? JSON.parse(res) : res;

            // Compute totals for record strip
            const allStats = data.all || {};
            const hWins = allStats[homeId]?.w || 0;
            const aWins = allStats[awayId]?.w || 0;
            const draws = allStats[homeId]?.d || 0;
            const hGoalsTotal = allStats[homeId]?.gf || 0;
            const aGoalsTotal = allStats[awayId]?.gf || 0;

            let html = '<div class="rnd-h2h-wrap">';

            // Record strip: logo name [W] [D] [W] name logo
            html += `<div class="rnd-h2h-record">
                <div class="rnd-h2h-record-side">
                    <img class="rnd-h2h-record-logo" src="${homeLogo}" onerror="this.style.display='none'">
                    <span class="rnd-h2h-record-name">${homeName}</span>
                </div>
                <div class="rnd-h2h-record-stat">
                    <span class="rnd-h2h-record-num home">${hWins}</span>
                    <span class="rnd-h2h-record-label">Wins</span>
                </div>
                <div class="rnd-h2h-record-stat">
                    <span class="rnd-h2h-record-num draw">${draws}</span>
                    <span class="rnd-h2h-record-label">Draws</span>
                </div>
                <div class="rnd-h2h-record-stat">
                    <span class="rnd-h2h-record-num away">${aWins}</span>
                    <span class="rnd-h2h-record-label">Wins</span>
                </div>
                <div class="rnd-h2h-record-side away">
                    <img class="rnd-h2h-record-logo" src="${awayLogo}" onerror="this.style.display='none'">
                    <span class="rnd-h2h-record-name">${awayName}</span>
                </div>
            </div>`;

            // Goals summary line
            if (hGoalsTotal || aGoalsTotal) {
                html += `<div class="rnd-h2h-goals-summary">Goals: <span>${hGoalsTotal}</span> – <span>${aGoalsTotal}</span></div>`;
            }

            // Match history grouped by season (newest first)
            html += '<div class="rnd-h2h-matches">';
            if (data.matches) {
                const seasons = Object.keys(data.matches).sort((a, b) => Number(b) - Number(a));
                const currentSeason = SESSION?.season;
                const clubNames = {};
                clubNames[homeId] = homeName;
                clubNames[awayId] = awayName;

                seasons.forEach(season => {
                    html += `<div class="rnd-h2h-season">Season ${season}</div>`;
                    data.matches[season].forEach(m => {
                        const [hGoals, aGoals] = (m.result || '0-0').split('-').map(Number);
                        const mHomeId = String(m.hometeam);
                        const hName = clubNames[mHomeId] || m.hometeam;
                        const aName = clubNames[String(m.awayteam)] || m.awayteam;
                        const hWin = hGoals > aGoals;
                        const aWin = aGoals > hGoals;
                        const isDraw = hGoals === aGoals;
                        // Determine result class from perspective of the "home" club in H2H
                        let resultClass = 'h2h-draw';
                        if (hWin && mHomeId === homeId || aWin && mHomeId !== homeId) resultClass = 'h2h-win';
                        else if (!isDraw) resultClass = 'h2h-loss';
                        let div = m.division ? `Division ${m.division}` : (m.matchtype || '');
                        if (m.matchtype === "fl") {
                            div = "Friendly league";
                        }
                        if (m.matchtype === "f") {
                            div = "Quick match";
                        } else if (["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"].includes(m.matchtype)) {
                            div = "Cup";
                        } else if (["ueg", "ue1", "ue2"].includes(m.matchtype)) {
                            div = "Conference League";
                        } else if (["clg", "cl1", "cl2"].includes(m.matchtype)) {
                            div = "Champions League";
                        }
                        const isOldSeason = Number(season) !== currentSeason;
                        html += `<div class="rnd-h2h-match ${resultClass}${isOldSeason ? ' h2h-readonly' : ''}" data-mid="${m.id}" data-season="${season}">`;
                        html += `<div class="rnd-h2h-date">${m.date || ''}</div>`;
                        if (div) html += `<span class="rnd-h2h-type-badge">${div}</span>`;
                        html += `<div class="rnd-h2h-home${hWin ? ' winner' : ''}">${hName}</div>`;
                        html += `<div class="rnd-h2h-result">${m.result}</div>`;
                        html += `<div class="rnd-h2h-away${aWin ? ' winner' : ''}">${aName}</div>`;
                        if (m.attendance_format) html += `<div class="rnd-h2h-att">🏟 ${m.attendance_format}</div>`;
                        html += `</div>`;
                    });
                });
            }
            html += '</div></div>';

            body.html(html);

            // ── Tooltip cache & hover logic ──
            const tooltipCache = {};
            let tooltipEl = null;
            let tooltipTimer = null;
            let tooltipHideTimer = null;
            const currentSeasonNum = SESSION?.season || 0;

            // ── Tooltip from tooltip.ajax.php (older seasons, same layout as rich) ──
            const buildTooltipContent = (d) => {
                const hName = d.hometeam_name || '';
                const aName = d.awayteam_name || '';
                // Try to get team IDs for logos from the H2H context
                const hLogoId = d.hometeam || '';
                const aLogoId = d.awayteam || '';
                const hLogoUrl = hLogoId ? `/pics/club_logos/${hLogoId}_140.png` : '';
                const aLogoUrl = aLogoId ? `/pics/club_logos/${aLogoId}_140.png` : '';

                let t = '';
                // Header with logos (identical to rich tooltip)
                t += `<div class="rnd-h2h-tooltip-header">`;
                if (hLogoUrl) t += `<img class="rnd-h2h-tooltip-logo" src="${hLogoUrl}" onerror="this.style.display='none'">`;
                t += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
                t += `<span class="rnd-h2h-tooltip-score">${d.result || ''}</span>`;
                t += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
                if (aLogoUrl) t += `<img class="rnd-h2h-tooltip-logo" src="${aLogoUrl}" onerror="this.style.display='none'">`;
                t += `</div>`;

                // Meta
                t += `<div class="rnd-h2h-tooltip-meta">`;
                if (d.date) t += `<span>📅 ${d.date}</span>`;
                if (d.attendance_format) t += `<span>🏟 ${d.attendance_format}</span>`;
                t += `</div>`;

                // Events: goals & cards (same structure as rich)
                const report = d.report || {};
                const hTeamId = String(d.hometeam || hLogoId);
                const goals = [];
                const cards = [];
                Object.keys(report).forEach(k => {
                    if (k === 'mom' || k === 'mom_name') return;
                    const e = report[k];
                    if (!e || !e.minute) return;
                    const sc = e.score;
                    const isHome = String(e.team_scores) === hTeamId;
                    if (sc === 'yellow' || sc === 'red' || sc === 'orange') {
                        cards.push({ ...e, isHome });
                    } else {
                        goals.push({ ...e, isHome });
                    }
                });
                goals.sort((a, b) => Number(a.minute) - Number(b.minute));
                cards.sort((a, b) => Number(a.minute) - Number(b.minute));

                if (goals.length || cards.length) {
                    t += `<div class="rnd-h2h-tooltip-events">`;
                    goals.forEach(e => {
                        const sideClass = e.isHome ? '' : ' away-evt';
                        t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
                        t += `<span class="rnd-h2h-tooltip-evt-min">${e.minute}'</span>`;
                        t += `<span class="rnd-h2h-tooltip-evt-icon">⚽</span>`;
                        t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ''}`;
                        if (e.assist_id && e.assist_id !== '') {
                            t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.score})</span>`;
                        } else {
                            t += ` <span class="rnd-h2h-tooltip-evt-assist">${e.score}</span>`;
                        }
                        t += `</span></div>`;
                    });
                    if (goals.length && cards.length) t += `<div class="rnd-h2h-tooltip-divider"></div>`;
                    cards.forEach(e => {
                        const icon = e.score === 'yellow' ? '🟡' : e.score === 'orange' ? '🟡🟡→🔴' : '🔴';
                        const sideClass = e.isHome ? '' : ' away-evt';
                        t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
                        t += `<span class="rnd-h2h-tooltip-evt-min">${e.minute}'</span>`;
                        t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
                        t += `<span class="rnd-h2h-tooltip-evt-text">${e.scorer_name || ''}</span>`;
                        t += `</div>`;
                    });
                    t += `</div>`;
                }

                // MOM
                if (report.mom_name) {
                    t += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${report.mom_name}</span></div>`;
                }
                return t;
            };

            // ── Rich tooltip from match.ajax.php (current season) ──
            const buildRichTooltip = (mData) => {
                const md = mData.match_data || {};
                const club = mData.club || {};
                const hName = club.home?.club_name || '';
                const aName = club.away?.club_name || '';
                const hId = String(club.home?.id || '');
                const aId = String(club.away?.id || '');
                const hLogo = club.home?.logo || `/pics/club_logos/${hId}_140.png`;
                const aLogo = club.away?.logo || `/pics/club_logos/${aId}_140.png`;
                const report = mData.report || {};

                // Find final score from report
                let finalScore = '0 - 0';
                const allMins = Object.keys(report).map(Number).sort((a, b) => a - b);
                for (let i = allMins.length - 1; i >= 0; i--) {
                    const evts = report[allMins[i]];
                    if (!Array.isArray(evts)) continue;
                    for (let j = evts.length - 1; j >= 0; j--) {
                        const p = evts[j].parameters;
                        if (p) {
                            const goal = Array.isArray(p) ? p.find(x => x.goal) : p.goal ? p : null;
                            if (goal) {
                                const g = goal.goal || goal;
                                if (g.score) { finalScore = g.score.join(' - '); break; }
                            }
                        }
                    }
                    if (finalScore !== '0 - 0') break;
                }
                // If halftime has score, at least use that
                if (finalScore === '0 - 0' && md.halftime?.chance?.text) {
                    const htText = md.halftime.chance.text.flat().join(' ');
                    const sm = htText.match(/(\d+)-(\d+)/);
                    if (sm) finalScore = sm[1] + ' - ' + sm[2];
                }

                let t = '';
                // Header with logos
                t += `<div class="rnd-h2h-tooltip-header">`;
                t += `<img class="rnd-h2h-tooltip-logo" src="${hLogo}" onerror="this.style.display='none'">`;
                t += `<span class="rnd-h2h-tooltip-team">${hName}</span>`;
                t += `<span class="rnd-h2h-tooltip-score">${finalScore}</span>`;
                t += `<span class="rnd-h2h-tooltip-team">${aName}</span>`;
                t += `<img class="rnd-h2h-tooltip-logo" src="${aLogo}" onerror="this.style.display='none'">`;
                t += `</div>`;

                // Meta
                t += `<div class="rnd-h2h-tooltip-meta">`;
                const ko = md.venue?.kickoff_readable || '';
                if (ko) {
                    const d = new Date(ko.replace(' ', 'T'));
                    t += `<span>📅 ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>`;
                }
                if (md.venue?.name) t += `<span>🏟 ${md.venue.name}</span>`;
                if (md.attendance) t += `<span>👥 ${Number(md.attendance).toLocaleString()}</span>`;
                t += `</div>`;

                // Key events: goals, cards, subs — extracted from report
                const keyEvents = [];
                allMins.forEach(min => {
                    const evts = report[min];
                    if (!Array.isArray(evts)) return;
                    evts.forEach(evt => {
                        if (!evt.parameters) return;
                        const params = Array.isArray(evt.parameters) ? evt.parameters : [evt.parameters];
                        const clubId = String(evt.club || '');
                        const isHome = clubId === hId;
                        params.forEach(p => {
                            if (p.goal) {
                                const scorer = mData.lineup?.home?.[p.goal.player] || mData.lineup?.away?.[p.goal.player];
                                const assistPlayer = mData.lineup?.home?.[p.goal.assist] || mData.lineup?.away?.[p.goal.assist];
                                keyEvents.push({
                                    min, type: 'goal', isHome,
                                    name: scorer?.nameLast || scorer?.name || '?',
                                    assist: assistPlayer?.nameLast || assistPlayer?.name || '',
                                    score: p.goal.score ? p.goal.score.join('-') : ''
                                });
                            }
                            if (p.yellow) {
                                const pl = mData.lineup?.home?.[p.yellow] || mData.lineup?.away?.[p.yellow];
                                keyEvents.push({ min, type: 'yellow', isHome, name: pl?.nameLast || pl?.name || '?' });
                            }
                            if (p.yellow_red) {
                                const pl = mData.lineup?.home?.[p.yellow_red] || mData.lineup?.away?.[p.yellow_red];
                                keyEvents.push({ min, type: 'red', isHome, name: pl?.nameLast || pl?.name || '?' });
                            }
                            if (p.red) {
                                const pl = mData.lineup?.home?.[p.red] || mData.lineup?.away?.[p.red];
                                keyEvents.push({ min, type: 'red', isHome, name: pl?.nameLast || pl?.name || '?' });
                            }
                            if (p.sub) {
                                const plIn = mData.lineup?.home?.[p.sub.player_in] || mData.lineup?.away?.[p.sub.player_in];
                                const plOut = mData.lineup?.home?.[p.sub.player_out] || mData.lineup?.away?.[p.sub.player_out];
                                keyEvents.push({
                                    min, type: 'sub', isHome,
                                    nameIn: plIn?.nameLast || plIn?.name || '?',
                                    nameOut: plOut?.nameLast || plOut?.name || '?'
                                });
                            }
                        });
                    });
                });

                // Goals & cards section
                const goals = keyEvents.filter(e => e.type === 'goal');
                const cards = keyEvents.filter(e => e.type === 'yellow' || e.type === 'red');

                if (goals.length || cards.length) {
                    t += `<div class="rnd-h2h-tooltip-events">`;
                    goals.forEach(e => {
                        const sideClass = e.isHome ? '' : ' away-evt';
                        t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
                        t += `<span class="rnd-h2h-tooltip-evt-min">${e.min}'</span>`;
                        t += `<span class="rnd-h2h-tooltip-evt-icon">⚽</span>`;
                        t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}`;
                        if (e.assist) t += ` <span class="rnd-h2h-tooltip-evt-assist">(${e.assist})</span>`;
                        t += `</span>`;
                        t += `</div>`;
                    });
                    if (goals.length && cards.length) t += `<div class="rnd-h2h-tooltip-divider"></div>`;
                    cards.forEach(e => {
                        const icon = e.type === 'yellow' ? '🟡' : '🔴';
                        const sideClass = e.isHome ? '' : ' away-evt';
                        t += `<div class="rnd-h2h-tooltip-evt${sideClass}">`;
                        t += `<span class="rnd-h2h-tooltip-evt-min">${e.min}'</span>`;
                        t += `<span class="rnd-h2h-tooltip-evt-icon">${icon}</span>`;
                        t += `<span class="rnd-h2h-tooltip-evt-text">${e.name}</span>`;
                        t += `</div>`;
                    });
                    t += `</div>`;
                }

                // Stats: possession, shots
                const poss = md.possession;
                const statsData = md.statistics || {};
                const shotsH = statsData.home_shots || 0;
                const shotsA = statsData.away_shots || 0;
                const onTargetH = statsData.home_on_target || 0;
                const onTargetA = statsData.away_on_target || 0;

                if (poss || shotsH || shotsA) {
                    t += `<div class="rnd-h2h-tooltip-stats">`;
                    if (poss) {
                        const hP = poss.home || 0, aP = poss.away || 0;
                        t += `<span class="rnd-h2h-tooltip-stat-home${hP > aP ? ' leading' : ''}">${hP}%</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-label">Possession</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-away${aP > hP ? ' leading' : ''}">${aP}%</span>`;
                    }
                    if (shotsH || shotsA) {
                        t += `<span class="rnd-h2h-tooltip-stat-home${shotsH > shotsA ? ' leading' : ''}">${shotsH}</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-label">Shots</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-away${shotsA > shotsH ? ' leading' : ''}">${shotsA}</span>`;
                    }
                    if (onTargetH || onTargetA) {
                        t += `<span class="rnd-h2h-tooltip-stat-home${onTargetH > onTargetA ? ' leading' : ''}">${onTargetH}</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-label">On Target</span>`;
                        t += `<span class="rnd-h2h-tooltip-stat-away${onTargetA > onTargetH ? ' leading' : ''}">${onTargetA}</span>`;
                    }
                    t += `</div>`;
                }

                // MOM
                const allPlayers = [...Object.values(mData.lineup?.home || {}), ...Object.values(mData.lineup?.away || {})];
                const mom = allPlayers.find(p => p.mom === 1 || p.mom === '1');
                if (mom) {
                    t += `<div class="rnd-h2h-tooltip-mom">⭐ Man of the Match: <span>${mom.nameLast || mom.name}</span> (${parseFloat(mom.rating).toFixed(1)})</div>`;
                }

                return t;
            };

            const showTooltip = (el, mid, season) => {
                clearTimeout(tooltipHideTimer);
                if (tooltipEl) tooltipEl.remove();
                const isCurrentSeason = Number(season) === currentSeasonNum;
                tooltipEl = $('<div class="rnd-h2h-tooltip"></div>');
                $(el).append(tooltipEl);

                if (tooltipCache[mid]) {
                    const cached = tooltipCache[mid];
                    tooltipEl.html(cached._rich ? buildRichTooltip(cached) : buildTooltipContent(cached));
                    requestAnimationFrame(() => tooltipEl.addClass('visible'));
                } else {
                    tooltipEl.html('<div class="rnd-h2h-tooltip-loading">⏳ Loading...</div>');
                    requestAnimationFrame(() => tooltipEl.addClass('visible'));
                    if (isCurrentSeason) {
                        // Current season → full match data endpoint
                        $.get(`/ajax/match.ajax.php?id=${mid}`)
                            .done(r => {
                                const d = typeof r === 'string' ? JSON.parse(r) : r;
                                d._rich = true;
                                tooltipCache[mid] = d;
                                if (tooltipEl && tooltipEl.closest('.rnd-h2h-match').data('mid') == mid) {
                                    tooltipEl.html(buildRichTooltip(d));
                                }
                            })
                            .fail(() => {
                                if (tooltipEl) tooltipEl.html('<div class="rnd-h2h-tooltip-loading" style="color:#ff6b6b">Failed</div>');
                            });
                    } else {
                        console.log('Fetching tooltip data for older season match', mid);
                        // Older season → tooltip endpoint
                        $.post('/ajax/tooltip.ajax.php', { type: 'match', match_id: mid, season: season })
                            .done(r => {
                                const d = typeof r === 'string' ? JSON.parse(r) : r;
                                // Attach team IDs from H2H context for logos
                                d._homeId = homeId;
                                d._awayId = awayId;
                                tooltipCache[mid] = d;
                                if (tooltipEl && tooltipEl.closest('.rnd-h2h-match').data('mid') == mid) {
                                    tooltipEl.html(buildTooltipContent(d));
                                }
                            })
                            .fail(() => {
                                if (tooltipEl) tooltipEl.html('<div class="rnd-h2h-tooltip-loading" style="color:#ff6b6b">Failed</div>');
                            });
                    }
                }
            };

            const hideTooltip = () => {
                tooltipHideTimer = setTimeout(() => {
                    if (tooltipEl) { tooltipEl.remove(); tooltipEl = null; }
                }, 100);
            };

            body.on('mouseenter', '.rnd-h2h-match', function () {
                const el = this;
                const mid = $(el).data('mid');
                const season = $(el).data('season');
                clearTimeout(tooltipTimer);
                tooltipTimer = setTimeout(() => showTooltip(el, mid, season), 300);
            });
            body.on('mouseleave', '.rnd-h2h-match', function () {
                clearTimeout(tooltipTimer);
                hideTooltip();
            });

            // Click on match → open in new tab (current season only)
            body.on('click', '.rnd-h2h-match', function () {
                if ($(this).hasClass('h2h-readonly')) return;
                const mid = $(this).data('mid');
                if (mid) window.open('/matches/' + mid, '_blank');
            });
        }).fail(() => {
            body.html('<div style="text-align:center;padding:20px;color:#ff6b6b">Failed to load H2H data</div>');
        });
    };

    // ─── Loading indicator ───────────────────────────────────────────────
    const cleanupPage = () => {
        if (liveState && liveState.timer) clearTimeout(liveState.timer);
        liveState = null;
        $('#rnd-overlay').remove();
        $('body').css('overflow', '');
        unityState = {
            available: false, ready: false, playing: false,
            pendingMinute: null, loadedMinutes: [], playedMinutes: [],
            canvasParent: null, tmPaused: false,
            clipTextQueue: [], clipTextCursor: 0,
            clipTextGroups: [], clipGroupCursor: 0,
            clipPostQueue: [], activeMinute: null,
            clipFirstShown: false, clipSkippedFirst: false
        };
    };

    const initForCurrentPage = () => {
        cleanupPage();
        injectStyles();
        initUnity();
        const matchId = window.location.pathname.match(/\/matches\/(\d+)/)?.[1];
        if (!matchId) return;
        // Remove TM's default Rounds widget and ad placeholder
        try { $('.banner_placeholder.rectangle')[0].parentNode.removeChild($('.banner_placeholder.rectangle')[0]); } catch (e) { }
        try { $('.column3_a .box').has('h2').filter(function () { return $(this).find('h2').text().trim().toUpperCase() === 'ROUNDS'; }).remove(); } catch (e) { }
        const pollInterval = setInterval(() => {
            if ($('body').length && document.readyState !== 'loading') {
                clearInterval(pollInterval);
                openMatchDialog(matchId);
            }
        }, 500);
    };

    initForCurrentPage();
})();