/**
 * constants/player.js — Player position maps, age thresholds, and wage constants
 */

export const POSITION_MAP = {
    gk:  { id: 9, position: 'GK',  ordering: 0, color: 'var(--tmu-success-strong)' },
    dc:  { id: 0, position: 'DC',  ordering: 1, color: 'var(--tmu-info-dark)' },
    dcl: { id: 0, position: 'DCL', ordering: 1, color: 'var(--tmu-info-dark)' },
    dcr: { id: 0, position: 'DCR', ordering: 1, color: 'var(--tmu-info-dark)' },
    dl:  { id: 1, position: 'DL',  ordering: 2, color: 'var(--tmu-info-dark)' },
    dr:  { id: 1, position: 'DR',  ordering: 2, color: 'var(--tmu-info-dark)' },
    dmc:  { id: 2, position: 'DMC',  ordering: 3, color: 'var(--tmu-warning)' },
    dmcl: { id: 2, position: 'DMCL', ordering: 3, color: 'var(--tmu-warning)' },
    dmcr: { id: 2, position: 'DMCR', ordering: 3, color: 'var(--tmu-warning)' },
    dml: { id: 3, position: 'DML', ordering: 4, color: 'var(--tmu-warning)' },
    dmr: { id: 3, position: 'DMR', ordering: 4, color: 'var(--tmu-warning)' },
    mc:  { id: 4, position: 'MC',  ordering: 5, color: 'var(--tmu-warning)' },
    mcl: { id: 4, position: 'MCL', ordering: 5, color: 'var(--tmu-warning)' },
    mcr: { id: 4, position: 'MCR', ordering: 5, color: 'var(--tmu-warning)' },
    ml:  { id: 5, position: 'ML',  ordering: 6, color: 'var(--tmu-warning)' },
    mr:  { id: 5, position: 'MR',  ordering: 6, color: 'var(--tmu-warning)' },
    omc:  { id: 6, position: 'OMC',  ordering: 8, color: 'var(--tmu-warning-soft)' },
    omcl: { id: 6, position: 'OMCL', ordering: 8, color: 'var(--tmu-warning-soft)' },
    omcr: { id: 6, position: 'OMCR', ordering: 8, color: 'var(--tmu-warning-soft)' },
    oml: { id: 7, position: 'OML', ordering: 7, color: 'var(--tmu-warning-soft)' },
    omr: { id: 7, position: 'OMR', ordering: 7, color: 'var(--tmu-warning-soft)' },
    fc:  { id: 8, position: 'FC',  ordering: 9, color: 'var(--tmu-danger-deep)' },
    fcl: { id: 8, position: 'FCL', ordering: 9, color: 'var(--tmu-danger-deep)' },
    fcr: { id: 8, position: 'FCR', ordering: 9, color: 'var(--tmu-danger-deep)' },
};

export const AGE_THRESHOLDS = [30, 28, 26, 24, 22, 20, 0];

export const WAGE_RATE      = 15.8079;
export const MIN_WAGE_FOR_TI = 30000;  // minimum wage for TI calculation
