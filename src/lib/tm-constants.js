/**
 * tm-constants.js — Barrel re-export for TrophyManager shared constants
 *
 * All constants live in src/constants/  grouped by domain:
 *   skills.js    — ASI weight matrices, skill definitions, rating thresholds
 *   player.js    — Position maps, age thresholds, wage constants
 *   match.js     — Match video patterns, tactic maps, action labels
 *   stats.js     — Player stat column definitions (all three rendering surfaces)
 *   training.js  — Training groups, routine mechanics, calibration values
 *   app.js       — Application-wide settings and gameplay calibration
 *
 * Exposed as: TmConst  (unchanged public API — all consumers import TmConst)
 */

import * as Skills from '../constants/skills.js';
import * as Player from '../constants/player.js';
import * as Match from '../constants/match.js';
import * as Stats from '../constants/stats.js';
import * as Training from '../constants/training.js';
import * as App from '../constants/app.js';

export const TmConst = {
    ...Skills,
    ...Player,
    ...Match,
    ...Stats,
    ...Training,
    ...App,
};

