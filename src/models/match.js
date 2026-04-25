/**
 * models/match.js — TmMatchModel facade
 *
 * Thin orchestration layer between pages / components and the match service.
 * Mirrors the TmPlayerModel pattern — delegates everything to TmMatchService
 * and exposes a stable, intention-revealing API.
 *
 * Match lifecycle:
 *   1. fetchMatch(id)                     → normalizeRawMatch + buildNormalizedPlays
 *   2. deriveMatchData(liveState)         → fills visiblePlays, actions, team stats
 *   3. tm:match-profiles-ready event      → enriches lineup players with skills / ratings
 */

import { TmMatchService } from '../services/match.js';
import { normalizeRawMatch } from '../utils/normalize/match.js';
import { _get } from '../services/engine.js';
import { TmPlayerModel } from './player.js';

export const TmMatchModel = {

    /**
     * Fetch and normalize a match.
     * Returns a canonical Match object (lib/match.js shape).
     * Derived fields (goals, stats, ratings, visiblePlays, actions) are
     * populated by calling TmMatchUtils.deriveMatchData(liveState) afterwards.
     *
     * @param {string|number} matchId
     * @param {{ dbSync?: boolean }} [options]
     * @returns {Promise<object|null>}
     */
    async fetchMatch(matchId) {
        return TmMatchService.fetchMatch(matchId);
    },

    /**
     * Fetch a match from cache (compresses and stores on first load).
     * Returns a canonical Match object.
     *
     * @param {string|number} matchId
     * @returns {Promise<object|null>}
     */
    async fetchMatchCached(matchId) {
        return TmMatchService.fetchMatchCached(matchId);
    },

    /**
     * Fetch match data without triggering the async player-profile enrichment.
     * Use when only static match facts are needed (stats page, history, etc.).
     *
     * @param {string|number} matchId
     * @returns {Promise<object|null>}
     */
    /**
     * Fetch a match and process it through the stats pipeline.
     *
     * @param {object} matchInfo
     * @param {string|number} clubId
     * @param {{ dbSync?: boolean }} [options]
     * @returns {Promise<object|null>}
     */
    async fetchMatchForStats(matchInfo, clubId) {
        return TmMatchService.fetchMatchForStats(matchInfo, clubId);
    },

    /**
     * Build a play-by-play schedule from a raw plays array.
     *
     * @param {Array} plays
     * @param {number} [lineInterval=3]
     * @returns {object}
     */
    buildSchedule(plays, lineInterval = 3) {
        return TmMatchService.buildSchedule(plays, lineInterval);
    },

    /**
     * Fetch the head-to-head history between two clubs.
     *
     * @param {string|number} homeId
     * @param {string|number} awayId
     * @param {number} kickoffTs  Unix timestamp of the reference match kickoff
     * @returns {Promise<object|null>}
     */
    fetchH2H(homeId, awayId, kickoffTs) {
        return TmMatchService.fetchMatchH2H(homeId, awayId, kickoffTs);
    },

    /**
     * Fetch the match tooltip (past season results) from the tooltip endpoint.
     *
     * @param {string|number} matchId
     * @param {string|number} season
     * @returns {Promise<object|null>}
     */
    fetchTooltip(matchId, season) {
        return TmMatchService.fetchMatchTooltip(matchId, season);
    },

    /**
     * Build a canonical Match object directly from a known raw payload.
     * Useful in tests, offline tools, or when a raw response is already in hand.
     *
     * @param {object} raw  match.ajax.php response
     * @returns {object}    Match.create() with static fields populated
     */
    fromRaw(raw) {
        return normalizeRawMatch(raw);
    },

    /**
     * Strip unnecessary display / cache fields from a raw match response.
     * See TmMatchService.compressMatch for the full list of removed fields.
     *
     * @param {object} raw
     * @returns {object}  compressed raw (still raw shape, not a Match object)
     */
    compress(raw) {
        return TmMatchService.compressMatch(raw);
    },

    /**
     * Fetch, normalize and synchronously enrich a match with full player profiles.
     * Unlike fetchMatch (which enriches async/fire-and-forget), this awaits all
     * tooltip fetches before returning — needed by the match player overlay so
     * positions/skills are available on first render.
     *
     * @param {string|number} matchId
     * @returns {Promise<object|null>}  normalized match with plays built
     */
    async fetchMatchWithProfiles(matchId) {
        const raw = await _get(`/ajax/match.ajax.php?id=${matchId}`);
        if (!raw) return null;

        const allRawPlayers = [
            ...Object.values(raw.lineup?.home || {}),
            ...Object.values(raw.lineup?.away || {}),
        ];
        const results = await Promise.allSettled(
            allRawPlayers.map(p => TmPlayerModel.fetchPlayerTooltip(Number(p.player_id)))
        );
        const playersById = new Map();
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value)
                playersById.set(r.value.id, r.value);
        });

        // plays are now built inside normalizeRawMatch
        return normalizeRawMatch(raw, playersById, String(matchId));
    },
};
