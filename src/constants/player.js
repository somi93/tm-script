/**
 * constants/player.js — Player position maps, field layout, bench config, and player constants
 */

// row: 0=GK, 1=DEF, 2=DM, 3=MID, 4=OM, 5=FWD
// col: 0=L, 1=CL, 2=C, 3=CR, 4=R
// section: 'gk' | 'def' | 'mid' | 'wing' | 'fwd'
//   wing = row 2-4, col 0 or 4 (extreme wide); mid = row 2-4, col 1-3 (central)
export const POSITION_MAP = {
    gk:   { id: 9, position: 'GK',   main: true,  row: 0, col: 2, ordering: 0, section: 'gk',   color: 'var(--tmu-success-strong)' },
    dl:   { id: 1, position: 'DL',   main: true,  row: 1, col: 0, ordering: 2, section: 'def',  color: 'var(--tmu-info-dark)' },
    dcl:  { id: 0, position: 'DCL',  main: false, row: 1, col: 1, ordering: 1, section: 'def',  color: 'var(--tmu-info-dark)' },
    dc:   { id: 0, position: 'DC',   main: true,  row: 1, col: 2, ordering: 1, section: 'def',  color: 'var(--tmu-info-dark)' },
    dcr:  { id: 0, position: 'DCR',  main: false, row: 1, col: 3, ordering: 1, section: 'def',  color: 'var(--tmu-info-dark)' },
    dr:   { id: 1, position: 'DR',   main: true,  row: 1, col: 4, ordering: 2, section: 'def',  color: 'var(--tmu-info-dark)' },
    dml:  { id: 3, position: 'DML',  main: true,  row: 2, col: 0, ordering: 4, section: 'wing', color: 'var(--tmu-warning)' },
    dmcl: { id: 2, position: 'DMCL', main: false, row: 2, col: 1, ordering: 3, section: 'mid',  color: 'var(--tmu-warning)' },
    dmc:  { id: 2, position: 'DMC',  main: true,  row: 2, col: 2, ordering: 3, section: 'mid',  color: 'var(--tmu-warning)' },
    dmcr: { id: 2, position: 'DMCR', main: false, row: 2, col: 3, ordering: 3, section: 'mid',  color: 'var(--tmu-warning)' },
    dmr:  { id: 3, position: 'DMR',  main: true,  row: 2, col: 4, ordering: 4, section: 'wing', color: 'var(--tmu-warning)' },
    ml:   { id: 5, position: 'ML',   main: true,  row: 3, col: 0, ordering: 6, section: 'wing', color: 'var(--tmu-warning)' },
    mcl:  { id: 4, position: 'MCL',  main: false, row: 3, col: 1, ordering: 5, section: 'mid',  color: 'var(--tmu-warning)' },
    mc:   { id: 4, position: 'MC',   main: true,  row: 3, col: 2, ordering: 5, section: 'mid',  color: 'var(--tmu-warning)' },
    mcr:  { id: 4, position: 'MCR',  main: false, row: 3, col: 3, ordering: 5, section: 'mid',  color: 'var(--tmu-warning)' },
    mr:   { id: 5, position: 'MR',   main: true,  row: 3, col: 4, ordering: 6, section: 'wing', color: 'var(--tmu-warning)' },
    oml:  { id: 7, position: 'OML',  main: true,  row: 4, col: 0, ordering: 7, section: 'wing', color: 'var(--tmu-warning-soft)' },
    omcl: { id: 6, position: 'OMCL', main: false, row: 4, col: 1, ordering: 8, section: 'mid',  color: 'var(--tmu-warning-soft)' },
    omc:  { id: 6, position: 'OMC',  main: true,  row: 4, col: 2, ordering: 8, section: 'mid',  color: 'var(--tmu-warning-soft)' },
    omcr: { id: 6, position: 'OMCR', main: false, row: 4, col: 3, ordering: 8, section: 'mid',  color: 'var(--tmu-warning-soft)' },
    omr:  { id: 7, position: 'OMR',  main: true,  row: 4, col: 4, ordering: 7, section: 'wing', color: 'var(--tmu-warning-soft)' },
    fcl:  { id: 8, position: 'FCL',  main: false, row: 5, col: 1, ordering: 9, section: 'fwd',  color: 'var(--tmu-danger-deep)' },
    fc:   { id: 8, position: 'FC',   main: true,  row: 5, col: 2, ordering: 9, section: 'fwd',  color: 'var(--tmu-danger-deep)' },
    fcr:  { id: 8, position: 'FCR',  main: false, row: 5, col: 3, ordering: 9, section: 'fwd',  color: 'var(--tmu-danger-deep)' },
};

/**
 * Field layout for rendering — FWD first (top of pitch), GK last (bottom).
 * Each zone has exactly 5 column entries (col 0..4); null = no posKey at that column.
 * A slot renders as active if its posKey is in the current formation's activeKeys,
 * as a ghost (empty slot) if active but unoccupied, or as a spacer if not active.
 */
export const FIELD_ZONES = [
    { key: 'fwd', row: 5, cols: [null, 'fcl', 'fc', 'fcr', null] },
    { key: 'om', row: 4, cols: ['oml', 'omcl', 'omc', 'omcr', 'omr'] },
    { key: 'mid', row: 3, cols: ['ml', 'mcl', 'mc', 'mcr', 'mr'] },
    { key: 'dm', row: 2, cols: ['dml', 'dmcl', 'dmc', 'dmcr', 'dmr'] },
    { key: 'def', row: 1, cols: ['dl', 'dcl', 'dc', 'dcr', 'dr'] },
    { key: 'gk', row: 0, cols: [null, null, 'gk', null, null] },
];

// posKey → zone key lookup (e.g. 'dcl' → 'def') — derived from FIELD_ZONES
export const POSKEY_TO_ZONE = Object.fromEntries(
    FIELD_ZONES.flatMap(z => z.cols.filter(Boolean).map(pk => [pk, z.key]))
);

// Bench slot role keys
export const BENCH_SLOTS = ['sub1', 'sub2', 'sub3', 'sub4', 'sub5'];
export const SPECIAL_SLOTS = ['captain', 'corner', 'penalty', 'freekick'];
export const BENCH_LABELS = {
    sub1: 'GK', sub2: 'DEF', sub3: 'MID', sub4: 'Wing', sub5: 'FWD',
    captain: 'Captain', corner: 'Corners', penalty: 'Penalty', freekick: 'Free Kick',
};

export const AGE_THRESHOLDS = [30, 28, 26, 24, 22, 20, 0];
export const WAGE_RATE = 15.8079;
export const MIN_WAGE_FOR_TI = 30000;
