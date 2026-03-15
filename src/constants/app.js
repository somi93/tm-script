/**
 * constants/app.js — Application-wide settings and gameplay calibration
 */

export const POLL_INTERVAL_MS  = 60000;  // transfer sidebar / live polling interval
export const DEFAULT_PAGE_SIZE = 50;     // default pagination page size

// ─── Gameplay calibration ─────────────────────────────────────────────
export const GAMEPLAY = {
    HOME_ADVANTAGE:  0.04,  // ~4% home advantage applied in match prediction
    BLOOM_THRESHOLD: 18,    // skill level at which efficiency drops to lowest bracket
};
