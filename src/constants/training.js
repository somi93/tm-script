/**
 * constants/training.js — Training groups, routine mechanics, and calibration values
 */

export const _TRAINING1 = new Date('2023-01-16T23:00:00Z');
export const _SEASON_DAYS = 84;

export const ROUTINE_CAP = 40.0;  // max routine value (%)
export const ROUTINE_DECAY = 0.1;   // routine point loss per game missed
export const SMOOTH_WEIGHT = 0.5;   // Laplace smoothing for custom training dot weights

// Training group → weight-matrix index (standard focus mapping)
export const STD_FOCUS = { '1': 3, '2': 0, '3': 1, '4': 5, '5': 4, '6': 2 };

/* Training group definitions — index into SKILL_KEYS_OUT/GK.
   TRAINING_GROUPS_OUT: 6 groups [Str/Wor/Sta, Mar/Tac, Cro/Pac, Pas/Tec/Set, Hea/Pos, Fin/Lon]
   TRAINING_GROUPS_GK : 1 group  [all 11 GK skills] */
export const TRAINING_GROUPS_OUT = [[0, 5, 1], [3, 4], [8, 2], [7, 9, 13], [10, 6], [11, 12]];
export const TRAINING_GROUPS_GK = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];

/* Human-readable names for standard training type IDs 1-6 */
export const TRAINING_NAMES = { '1': 'Technical', '2': 'Fitness', '3': 'Tactical', '4': 'Finishing', '5': 'Defending', '6': 'Wings' };
/* Per-group meta (parallel to TRAINING_GROUPS_OUT) */
export const TRAINING_CUSTOM = [
   { label: 'Strength/Workrate/Stamina', color: 'var(--tmu-success)' },
   { label: 'Marking/Tackling', color: 'var(--tmu-info-strong)' },
   { label: 'Crossing/Pace', color: 'var(--tmu-warning)' },
   { label: 'Passing/Technique/Set Pieces', color: 'var(--tmu-warning-soft)' },
   { label: 'Heading/Positioning', color: 'var(--tmu-purple)' },
   { label: 'Finishing/Long Shots', color: 'var(--tmu-danger)' },
];

export const ROUTINE_SCALE = 4.2;  // routine max = ROUTINE_SCALE * (ageYears - ROUTINE_AGE_MIN)
export const ROUTINE_AGE_MIN = 15;   // minimum age for routine accumulation
