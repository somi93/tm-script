/**
 * constants/player.js — Player position maps, age thresholds, and wage constants
 */

export const POSITION_MAP = {
    gk:  { id: 9, position: 'GK',  ordering: 0, color: '#4ade80' },
    dc:  { id: 0, position: 'DC',  ordering: 1, color: '#60a5fa' },
    dl:  { id: 1, position: 'DL',  ordering: 2, color: '#60a5fa' },
    dr:  { id: 1, position: 'DR',  ordering: 2, color: '#60a5fa' },
    dmc: { id: 2, position: 'DMC', ordering: 3, color: '#fbbf24' },
    dml: { id: 3, position: 'DML', ordering: 4, color: '#fbbf24' },
    dmr: { id: 3, position: 'DMR', ordering: 4, color: '#fbbf24' },
    mc:  { id: 4, position: 'MC',  ordering: 5, color: '#fbbf24' },
    ml:  { id: 5, position: 'ML',  ordering: 6, color: '#fbbf24' },
    mr:  { id: 5, position: 'MR',  ordering: 6, color: '#fbbf24' },
    omc: { id: 6, position: 'OMC', ordering: 8, color: '#fbbf24' },
    oml: { id: 7, position: 'OML', ordering: 7, color: '#fbbf24' },
    omr: { id: 7, position: 'OMR', ordering: 7, color: '#fbbf24' },
    fc:  { id: 8, position: 'FC',  ordering: 9, color: '#f87171' },
};

// Full 24-slot position ordering (ascending: GK=0 … FCR=23)
export const POSITION_ORDER = {
    gk: 0, dl: 1, dcl: 2, dc: 3, dcr: 4, dr: 5,
    dml: 6, dmcl: 7, dmc: 8, dmcr: 9, dmr: 10,
    ml: 11, mcl: 12, mc: 13, mcr: 14, mr: 15,
    oml: 16, omcl: 17, omc: 18, omcr: 19, omr: 20,
    fcl: 21, fc: 22, fcr: 23
};

export const AGE_THRESHOLDS = [30, 28, 26, 24, 22, 20, 0];

export const WAGE_RATE      = 15.8079;
export const MIN_WAGE_FOR_TI = 30000;  // minimum wage for TI calculation
