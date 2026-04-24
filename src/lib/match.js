/**
 * lib/match.js — Canonical Match model
 *
 * A match is a competitive football event between two clubs.  It has three
 * distinct lifecycle phases:
 *   'future'  — kickoff hasn't happened yet  (liveMin < 0 or null before kickoff)
 *   'live'    — match is in progress         (liveMin > 0)
 *   'ended'   — final whistle blown
 *
 * The model separates five concerns that the raw API entangles:
 *
 *   competition  — who organized the match (league? cup? type? division?)
 *   venue        — the physical place and conditions (stadium, weather, pitch)
 *   side         — each team in this specific match:
 *                     club      : who they are (Club identity)
 *                     tactics   : how they set up for THIS match
 *                     lineup    : which players (Player.create() + match context)
 *                     ratings   : derived performance metrics (avgR5, line ratings)
 *   result       — outcome data (score, possession, attendance)
 *   engine       — normalized plays and raw report (immutable after load)
 *   broadcast    — derived views updated on each replay step (events, score)
 *
 * Lineup players are Player.create() objects augmented with match-specific
 * context fields that do NOT belong in the player model:
 *   position    string   pitch slot in this match: "gk", "dcr", "sub2", …
 *   fp          string   favored natural positions: "dc,dmc"
 *   captain     boolean  is armband holder for this match
 *   rec         number   recommendation level 1–5 in this match
 *   rating      number   post-match player rating (null = not yet known)
 *   mom         number   man of the match: 0 | 1
 *   grouped     array    event icon summary [{ key, label, icon, count }]
 *   perMinute   array    flat action objects for this player this match
 *   minsPlayed  number   minutes spent on pitch
 */

import { Club } from './club.js';

// ─── Competition ──────────────────────────────────────────────────────────
// What kind of match this is and in which competition it takes place.
// Separated from Venue because the tournament is an organizational fact,
// not a property of the physical location.
const createCompetition = () => ({
    name: null,         // "Super Liga Srbije"
    type: null,         // "league" | "cup" | "friendly" | "friendly_league"
                        //   | "international_cup" | "ntq"
    typeRaw: null,      // raw API code: "l", "fl", "f", "fq", "p1"–"p9",
                        //   "ueg", "ue1", "ue2", "clg", "cl1", "cl2", "ntq"
    division: null,     // 1, 2, 3 … (for league matches)
    url: null,          // canonical URL for the competition page
});

// ─── Venue ────────────────────────────────────────────────────────────────
// Physical location and pitch conditions only.
// kickoff timestamp belongs on the match, not here.
// tournament belongs in competition, not here.
const createVenue = () => ({
    name: null,             // "Renzo Barbera"
    city: null,
    capacity: null,
    weather: null,          // "sunny3", "cloudy2", "rainy1", "snow1", "overcast1"
    pitchCondition: null,   // 0–100
    facilities: {
        sprinklers: null,   // 0 | 1
        draining: null,
        pitchcover: null,
        heating: null,
    },
    picture: null,          // stadium art variant (integer)
});

// ─── Tactics ─────────────────────────────────────────────────────────────
// The tactical setup a team chose for THIS specific match.
// Mentality and formation can change during the match (deriveMatchData updates them).
const createTactics = () => ({
    mentality: null,    // 1 (Very Defensive) → 7 (Very Attacking)
    style: null,        // "1" Balanced / "2" Direct / "3" Wings /
                        //   "4" Short Passing / "5" Long Balls / "6" Through Balls
    focus: null,        // "1" Balanced / "2" Left / "3" Central / "4" Right
    formation: null,    // "4-4-2" (derived from lineup positions or match_data)
});

// ─── Side ratings ─────────────────────────────────────────────────────────
// Aggregated R5 / age / routine metrics for a team in this match.
// All null until deriveMatchData + generateTeamData runs.
const createRatings = () => ({
    avg: null,          // average R5 of the starting XI (= avgR5)
    subs: null,         // average R5 of bench players
    GK: null,           // average R5 of goalkeeper line
    DEF: null,          // average R5 of defensive line
    MID: null,          // average R5 of midfield line
    ATT: null,          // average R5 of attacking line
    avgAge: null,
    avgRoutine: null,
});

// ─── Match side ───────────────────────────────────────────────────────────
// One participant (home or away) in a match.
// club     : Club identity (who they are, independent of this match)
// tactics  : how they were set up for THIS match
// lineup   : the 18 players they fielded (Player.create() + match context)
// playerIds: Set<string> built from lineup during normalization — fast side lookup
// ratings  : derived performance metrics (populated by deriveMatchData)
const createSide = () => ({
    club: { ...Club },      // id, name, nick, country, division, stadium, …
    color: null,            // resolved primary kit color "#3884ff"
    captain: null,          // player id (Number) of the armband holder
    playerIds: null,        // Set<string> — computed once from lineup on load
    tactics: createTactics(),
    lineup: [],             // Player.create() objects + match context fields
    // ── Derived (populated by deriveMatchData / generateTeamData) ──────
    goals: null,
    goalsAgainst: null,
    stats: null,            // { shots, shotsOnTarget, saves, passes,
                            //   passesCompleted, crosses, fouls,
                            //   yellowCards, redCards, advanced }
    ratings: createRatings(),
});

// ─── Match ────────────────────────────────────────────────────────────────
export const Match = {
    create() {
        return {
            // ── Identity ─────────────────────────────────────────────────
            id: null,               // match id (number or string)
            season: null,           // season number

            // ── When ─────────────────────────────────────────────────────
            date: null,             // "YYYY-MM-DD"
            kickoff: null,          // Unix timestamp of scheduled kick-off
            kickoffTime: null,      // "17:00" time of day

            // ── What competition ──────────────────────────────────────────
            competition: createCompetition(),

            // ── Where ─────────────────────────────────────────────────────
            venue: createVenue(),

            // ── Who ───────────────────────────────────────────────────────
            home: createSide(),
            away: createSide(),

            // ── Outcome ───────────────────────────────────────────────────
            result: {
                home: null,             // goals scored by home (null = not played yet)
                away: null,
                halftime: { home: null, away: null },
            },
            possession: { home: null, away: null }, // % at full time
            attendance: null,

            // ── Lifecycle status ──────────────────────────────────────────
            // Explicit — no more inferring from 4 different fields.
            status: null,           // 'future' | 'live' | 'ended'
            // liveMin: elapsed real-world minutes since kickoff when status='live'.
            // Negative when status='future' (|liveMin| = minutes until kickoff).
            liveMin: null,

            // ── Duration (populated from API, meaningful when ended) ──────
            duration: {
                regular: null,      // 90 (or last minute of regulation)
                total: null,        // 94 (including all stoppage time)
                extra: null,        // 4 (added minutes)
            },

            // ── Play engine (immutable after normalizeMatchData) ───────
            // report: raw minute-keyed API events.
            //         normalizeReport() promotes each event's parameters array
            //         to direct properties on the event object (e.g. evt.goal,
            //         evt.yellow, evt.sub) so consumers never touch .parameters.
            // plays:  one Play per attacking chance sequence, built by
            //         buildNormalizedPlays() from the normalized report.
            //         Shape: { [min: string]: Play[] }
            //         Play = { min, team, style, outcome, segments,
            //                  reportEventIndex, severity }
            //         Segment = { clips: Clip[], actions: GameAction[],
            //                     text: string[] }
            //         These two objects never change after normalization.
            report: {},
            plays: {},

            // ── Broadcast state (rebuilt by deriveMatchData each replay step) ──
            // visiblePlays: time-gate of plays — same shape as plays, contains
            //               only the plays at or before the current cursor.
            //               { [min: string]: Play[] }
            visiblePlays: {},

            // events: indexed action log — extracted from the segment.actions of
            //         all visiblePlays.  Rebuilt from visiblePlays each step.
            //
            //         Instead of a generic flat array that every consumer has
            //         to re-filter, the structure pre-indexes by the categories
            //         actually needed at broadcast time:
            //
            //   log          — full chronological list of GameActions (source of truth)
            //                  GameAction = { action, by, player, teamId, home,
            //                                min, evtIdx, …type-specific fields }
            //   score        — current goals.  Maintained as log grows — O(1) read.
            //   mentality    — last recorded mentality for each side — O(1) read.
            //   goals        — subset of log where action='shot' && goal.
            //                  Used for: timeline, goal notifications, scoreline.
            //   cards        — subset of log where action ∈ {yellow,yellowRed,red}.
            //                  Used for: discipline board, player icon overlays.
            //   subs         — subset of log where action ∈ {subIn,subOut}.
            //                  Used for: active lineup reconstruction (much smaller
            //                  than scanning the full log).
            events: {
                log: [],
                score: { home: 0, away: 0 },
                mentality: { home: null, away: null },
                goals: [],
                cards: [],
                subs: [],
            },

            // ── Enrichment state ──────────────────────────────────────────
            // profilesReady: false until the tm:match-profiles-ready event fires
            // and lineup players receive their full skill / r5 / asi data.
            // Until then every player has base identity fields only.
            profilesReady: false,
        };
    },
};

// ─── Example ──────────────────────────────────────────────────────────────
// A realistic completed league match, fully populated.
// This is the shape every component receives as `mData` (or `liveState.mData`)
// after normalizeMatchData() + deriveMatchData() have run.
export const exampleMatch = Match.create();

Object.assign(exampleMatch, {
    id: '12345678',
    season: 26,
    date: '2026-03-13',
    kickoff: 1773356400,
    kickoffTime: '17:00',
    competition: { name: 'Super Liga Srbije', type: 'league', typeRaw: 'l', division: 1 },
    venue: {
        name: 'Renzo Barbera', city: 'Beograd', capacity: 64000,
        weather: 'sunny3', pitchCondition: 72,
        facilities: { sprinklers: 1, draining: 0, pitchcover: 1, heating: 0 },
        picture: 9,
    },
    result: { home: 2, away: 1, halftime: { home: 1, away: 0 } },
    possession: { home: 55, away: 45 },
    attendance: 42500,
    status: 'ended',
    liveMin: null,
    duration: { regular: 90, total: 94, extra: 4 },
    // At full time, events holds the complete broadcast-state snapshot:
    events: {
        log: [],   // populated with all GameAction objects by deriveMatchData
        score: { home: 2, away: 1 },
        mentality: { home: 5, away: 4 },
        goals: [],  // two home goal actions + one away goal action
        cards: [],  // yellow/red card actions
        subs: [],   // sub actions (used for active lineup reconstruction)
    },
});

Object.assign(exampleMatch.home, {
    club: { id: '1001', name: 'FK Partizan', nick: 'PAR', country: 'Serbia', division: 1, group: '1', manager_name: 'Marko Kovač', fanclub: 18000, stadium: 'Renzo Barbera' },
    color: '#3884ff',
    captain: 137172448,
    playerIds: new Set(),   // populated with player id strings during normalization
    tactics: { mentality: 5, style: '3', focus: '2', formation: '4-3-3' },
    lineup: [], // Player.create() + { position, fp, captain, rec, rating, mom, … }
    goals: 2, goalsAgainst: 1,
    stats: { shots: 14, shotsOnTarget: 6, saves: 3, passes: 412, passesCompleted: 327, crosses: 18, fouls: 11, yellowCards: 2, redCards: 0, advanced: {} },
    ratings: { avg: 6.82, subs: 6.45, GK: 7.1, DEF: 6.9, MID: 6.8, ATT: 6.7, avgAge: 25.3, avgRoutine: 58.4 },
});

Object.assign(exampleMatch.away, {
    club: { id: '1002', name: 'FK Vojvodina', nick: 'VOJ', country: 'Serbia', division: 1, group: '1', manager_name: 'Nikola Petrović', fanclub: 9500, stadium: 'Karađorđe stadion' },
    color: '#e63030',
    captain: 139575032,
    playerIds: new Set(),
    tactics: { mentality: 3, style: '2', focus: '1', formation: '4-4-2' },
    lineup: [],
    goals: 1, goalsAgainst: 2,
    stats: { shots: 8, shotsOnTarget: 3, saves: 5, passes: 298, passesCompleted: 210, crosses: 9, fouls: 14, yellowCards: 3, redCards: 0, advanced: {} },
    ratings: { avg: 6.51, subs: 6.10, GK: 6.8, DEF: 6.5, MID: 6.4, ATT: 6.6, avgAge: 27.0, avgRoutine: 55.1 },
});
