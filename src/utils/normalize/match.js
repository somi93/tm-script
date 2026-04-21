/**
 * utils/normalize/match.js — Raw API → Match model mapping
 *
 * The raw match.ajax.php response tangles several concerns that the canonical
 * Match model keeps separate:
 *
 *   raw.match_data.venue.tournament   → match.competition.name
 *   raw.match_data.venue.matchtype    → match.competition.typeRaw / .type
 *   raw.match_data.venue.kickoff      → match.kickoff  (not in venue!)
 *   raw.match_data.attacking_style.*  → match.home/away.tactics.style
 *   raw.match_data.mentality.*        → match.home/away.tactics.mentality
 *   raw.match_data.focus_side.*       → match.home/away.tactics.focus
 *   raw.match_data.captain.*          → match.home/away.captain
 *   raw.club[side].*                  → match.home/away.club.*
 *
 * After normalization, derived fields (goals, stats, ratings, visiblePlays,
 * actions) are still null / [].  They are populated at runtime by
 * TmMatchService.deriveMatchData() (called via TmMatchUtils.deriveMatchData).
 */

import { Match } from '../../lib/match.js';

// ─── Competition type resolver ────────────────────────────────────────────
// Maps the raw matchtype code from the API to a semantic type string.
const resolveCompetitionType = (typeRaw) => {
    if (!typeRaw) return null;
    if (typeRaw === 'l')                        return 'league';
    if (typeRaw === 'fl')                       return 'friendly_league';
    if (typeRaw === 'f' || typeRaw === 'fq')   return 'friendly';
    if (/^p\d+$/.test(typeRaw))                return 'cup';
    if (typeRaw === 'ntq')                      return 'ntq';
    // ueg, ue1, ue2, clg, cl1, cl2 etc.
    if (/^(ue|cl)\w*$/.test(typeRaw))          return 'international_cup';
    return null;
};


// ─── Club normalizer ──────────────────────────────────────────────────────
/**
 * Map the club section of a raw match API response to Club identity shape.
 *
 * Only fields defined in Club are mapped.  Extra fields (form, colors, logos,
 * user_id, pro_geek_expiry, etc.) are intentionally excluded — those belong
 * to a richer club profile, not the Club identity used inside a match.
 *
 * @param {object} rawClub  raw.club.home or raw.club.away
 * @returns {object}
 */
export const normalizeRawMatchClub = (rawClub) => ({
    id: rawClub.id || null,
    name: rawClub.club_name || null,
    nick: rawClub.club_nick || null,
    country: rawClub.country || null,
    division: rawClub.division ? Number(rawClub.division) : null,
    group: rawClub.group || null,
    manager_name: rawClub.manager_name || null,
    fanclub: rawClub.fanclub || null,
    stadium: rawClub.stadium || null,
    city: rawClub.city || null,
});

// ─── Match normalizer ─────────────────────────────────────────────────────
/**
 * Apply match context fields (position slot, captain, rec, faceUrl, …) onto
 * an already-normalized player object returned by fetchPlayerTooltip.
 *
 * @param {object} player     normalized player from fetchPlayerTooltip
 * @param {object} p          raw lineup entry from match.ajax.php
 * @param {number} captainId  captain id for this side
 */
const applyMatchContext = (player, p, captainId) => {
    player.position   = p.position || null;
    // Reflect match slot in positions[] so getPlayerSlot() works (same pattern as tactics)
    if (player.position) {
        player.positions = player.positions || [];
        for (const pos of player.positions) pos.playing = false;
        const key = player.position.toLowerCase();
        let pos = player.positions.find(pos => pos.key === key);
        if (!pos) player.positions.push(pos = { key });
        pos.playing = true;
    }
    player.captain    = Number(p.player_id) === captainId;
    player.rating     = (typeof p.rating === 'number' && p.rating > 0) ? p.rating : null;
    player.mom        = p.mom ?? 0;
    player.grouped    = [];
    player.perMinute  = [];
    player.minsPlayed = null;
    return player;
};

/**
 * @param {object} raw         raw match.ajax.php response
 * @param {Map<number,object>} playersById  pid → normalized player from fetchPlayerTooltip
 */
export const normalizeRawMatch = (raw, playersById = new Map()) => {
    const match = Match.create();
    const md = raw.match_data || {};
    const venue = md.venue || {};

    // ── Identity ─────────────────────────────────────────────────────────
    match.id = raw.match_id ?? raw.id ?? null;
    match.season = raw.season ?? null;

    // ── When ─────────────────────────────────────────────────────────────
    // kickoff_readable is "YYYY-MM-DD HH:MM" — we take the date part only.
    // kickoff is always the authoritative Unix timestamp.
    const readable = venue.kickoff_readable || '';
    match.date = readable.split(' ')[0] || null;
    match.kickoff = venue.kickoff ? Number(venue.kickoff) : null;
    match.kickoffTime = md.match_time_of_day || null;

    // ── Competition ───────────────────────────────────────────────────────
    // venue.tournament + venue.matchtype are COMPETITION facts, not venue facts.
    // They tell us who organised the match, not where it was played.
    const typeRaw = venue.matchtype || null;
    match.competition.name = venue.tournament || null;
    match.competition.typeRaw = typeRaw;
    match.competition.type = resolveCompetitionType(typeRaw);
    // Division comes from the club data — use home side as the source of truth
    const homeDivision = raw.club?.home?.division;
    match.competition.division = homeDivision ? Number(homeDivision) : null;

    // ── Venue ─────────────────────────────────────────────────────────────
    // Only physical location and pitch conditions.
    // kickoff, tournament, matchtype all moved above.
    match.venue.name = venue.name || null;
    match.venue.city = venue.city || null;
    match.venue.capacity = venue.capacity ? Number(venue.capacity) : null;
    match.venue.weather = venue.weather || null;
    match.venue.pitchCondition = venue.pitch_condition ? Number(venue.pitch_condition) : null;
    match.venue.facilities.sprinklers = venue.sprinklers ?? null;
    match.venue.facilities.draining = venue.draining ?? null;
    match.venue.facilities.pitchcover = venue.pitchcover ?? null;
    match.venue.facilities.heating = venue.heating ?? null;
    match.venue.picture = venue.picture ?? null;

    // ── Duration ─────────────────────────────────────────────────────────
    match.duration.regular = md.regular_last_min ? Number(md.regular_last_min) : null;
    match.duration.total = md.last_min ? Number(md.last_min) : null;
    match.duration.extra = md.extra_time ? Number(md.extra_time) : null;

    // ── Outcome context ───────────────────────────────────────────────────
    match.possession.home = md.possession?.home ?? null;
    match.possession.away = md.possession?.away ?? null;
    match.attendance = md.attendance ? Number(md.attendance) : null;

    // Half-time score is buried in the halftime hint text ("0-1.").
    // Actual final goals require deriveMatchData to process the report.
    const htRaw = md.halftime?.chance;
    if (htRaw) {
        const htText = Array.isArray(htRaw.text) ? htRaw.text[0] : htRaw.text;
        const htLine = Array.isArray(htText) ? htText[0] : htText;
        const htMatch = typeof htLine === 'string' ? htLine.match(/(\d+)-(\d+)\.$/) : null;
        if (htMatch) {
            match.result.halftime.home = Number(htMatch[1]);
            match.result.halftime.away = Number(htMatch[2]);
        }
    }

    // ── Status ────────────────────────────────────────────────────────────
    // Explicit status enum instead of forcing consumers to infer from 4 fields.
    // live_min<0: countdown (future).  live_min>0: in progress (live).
    // No live_min: compare kickoff timestamp against now to determine future vs ended.
    const rawLiveMin = md.live_min;
    if (typeof rawLiveMin === 'number' && rawLiveMin < 0) {
        match.status = 'future';
        match.liveMin = rawLiveMin;
    } else if (typeof rawLiveMin === 'number' && rawLiveMin > 0) {
        match.status = 'live';
        match.liveMin = rawLiveMin;
    } else {
        const kickoffTs = Number(venue.kickoff);
        const now = Math.floor(Date.now() / 1000);
        match.status = (kickoffTs && kickoffTs > now) ? 'future' : 'ended';
        match.liveMin = null;
    }

    // ── Sides ─────────────────────────────────────────────────────────────
    for (const side of ['home', 'away']) {
        const rawClub = raw.club?.[side] || {};
        const rawLineup = raw.lineup?.[side] || {};
        const captainId = Number(md.captain?.[side] || 0);
        const color = '#' + (rawClub.colors?.club_color1 || (side === 'home' ? '4a9030' : '5b9bff'));

        // Club identity — who they are, independent of this match
        match[side].club = normalizeRawMatchClub(rawClub);

        // Match-specific side data
        match[side].color = color;
        match[side].captain = captainId || null;
        match[side].tactics.mentality = md.mentality?.[side] != null ? Number(md.mentality[side]) : null;
        match[side].tactics.style = md.attacking_style?.[side] || null;
        match[side].tactics.focus = md.focus_side?.[side] || null;

        // Lineup: use pre-fetched tooltip players, apply match context on top
        match[side].lineup = Object.values(rawLineup).map(p => {
            const pid = Number(p.player_id);
            const player = playersById.get(pid);
            if (!player) return null;
            return applyMatchContext(player, p, captainId);
        }).filter(Boolean);

        // Player set for O(1) side lookup (key = string player_id)
        match[side].playerIds = new Set(Object.keys(rawLineup));
    }

    // ── Engine data ───────────────────────────────────────────────────────
    // report is kept as-is; plays are built separately by
    // TmMatchService.buildNormalizedPlays() after normalizeReport() runs.
    match.report = raw.report || {};
    match.plays = {};

    return match;
};
