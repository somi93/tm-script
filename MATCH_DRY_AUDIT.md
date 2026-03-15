# Match DRY Audit

## Scope

Audit covers the match feature centered around:

- `src/pages/match.js`
- `src/components/match/*.js`
- `src/components/stats/tm-stats-match-processor.js`
- shared helpers used by the match page

Goal of this document is to isolate duplication and near-duplication in the match domain, especially around `mData.plays`, player enrichment, tactical labels, and shared UI behaviors.

## Architecture Map

### Orchestrator

- `src/pages/match.js`
  - owns `liveState` and `unityState`
  - drives live replay flow, report stepping, Unity clip sync, tab routing
  - passes shared helpers to match components

### Shared Domain Helpers

- `src/components/match/tm-match-utils.js`
  - `extractStats(...)`
  - `buildPlayerEventStats(...)`
  - `isEventVisible(...)`
  - `buildPlayerNames(...)`
  - `faceUrl(...)`

### Renderers

- `src/components/match/tm-match-lineups.js`
- `src/components/match/tm-match-statistics.js`
- `src/components/match/tm-match-player-dialog.js`
- `src/components/match/tm-match-analysis.js`
- `src/components/match/tm-match-dialog.js`
- `src/components/match/tm-match-h2h.js`
- `src/components/match/tm-match-venue.js`
- `src/components/match/tm-match-league.js`

### External Consumer of Match-Domain Logic

- `src/components/stats/tm-stats-match-processor.js`

## Main DRY Findings

## 1. Repeated Iteration Over `plays`

### Status

This is the largest DRY issue in the match feature.

The same nested traversal appears in many places:

```js
for (const minKey of Object.keys(plays)) {
    const eMin = Number(minKey);
    for (const play of (plays[minKey] || [])) {
        if (!isEventVisible(eMin, play.reportEvtIdx, curMin, curEvtIdx)) continue;
        // ...
    }
}
```

### Main occurrences

- `src/pages/match.js` in `updateUnityStats`
- `src/pages/match.js` in `scoreAtStep`
- `src/pages/match.js` in `computeActiveRoster`
- `src/pages/match.js` in `updateLiveHeader`
- `src/pages/match.js` in `renderDetailsTab`
- `src/components/match/tm-match-utils.js` in `extractStats`
- `src/components/match/tm-match-utils.js` in `buildPlayerEventStats`
- `src/components/match/tm-match-statistics.js` in `_buildAttackingStyles`
- `src/components/match/tm-match-statistics.js` in `_buildPlayerStats`
- `src/components/match/tm-match-lineups.js` in live mentality derivation

### Classification

True duplication.

### Suggested extraction

Add one shared iterator in `tm-match-utils.js`:

```js
forEachVisiblePlay(plays, opts, callback)
```

Optional second layer:

```js
forEachVisibleAction(plays, opts, callback)
```

### Why it matters

- reduces repeated minute parsing and visibility filtering
- makes future play schema changes safer
- makes component code smaller and more declarative

## 2. Substitution Mapping Is Rebuilt Repeatedly

### Main occurrences

- `src/components/match/tm-match-statistics.js`
- `src/components/match/tm-match-player-dialog.js`
- `src/components/stats/tm-stats-match-processor.js`
- related but broader logic in `src/pages/match.js` `computeActiveRoster`

### Pattern

Each file rebuilds some version of:

```js
subEvents[playerIn].subInMin = min;
subEvents[playerOut].subOutMin = min;
```

### Classification

True duplication.

### Suggested extraction

```js
buildSubstitutionMap(plays)
```

Potential return shape:

```js
{
  [playerId]: {
    subInMin,
    subOutMin,
    replacedPlayerId,
    replacementPlayerId
  }
}
```

### Why it matters

- same event semantics are encoded multiple times
- minutes played logic becomes consistent across tabs and processors

## 3. Team-Level Match Stats Are Counted in More Than One Place

### Main occurrences

- `src/components/match/tm-match-utils.js` `extractStats(...)`
- `src/pages/match.js` `updateUnityStats(...)`
- `src/components/stats/tm-stats-match-processor.js` local `matchStats` build

### Stats repeated

- shots
- shots on target
- goals
- yellow cards
- red cards
- set pieces
- penalties

### Classification

True duplication at business-rule level.

### Suggested extraction

Keep `extractStats(...)` as the canonical team stat selector and either:

- reuse it directly where possible, or
- split it into smaller selectors for UI-specific uses

Possible helper set:

```js
extractTeamMatchStats(...)
extractAttackingStyleStats(...)
extractTimelineEvents(...)
```

### Why it matters

- same counting rules currently live in multiple files
- card semantics and penalty semantics can drift over time

## 4. Goal, Assist, Card, Injury and Sub Parsing Is Repeated

### Main occurrences

- `src/pages/match.js` `buildReportEventHtml(...)`
- `src/pages/match.js` `renderDetailsTab(...)`
- `src/components/match/tm-match-utils.js` `extractStats(...)`
- `src/components/match/tm-match-utils.js` `buildPlayerEventStats(...)`

### Pattern

Files repeatedly flatten actions and then look for:

- `finish`
- `assist`
- `card`
- `sub`
- `injury`

### Classification

Near-duplication.

The outputs are not identical, but the domain parsing logic is.

### Suggested extraction

Helpers like:

```js
getPlayActions(play)
extractGoalDetails(play)
extractDisplayEvents(play)
extractCardDetails(play)
```

### Why it matters

- reduces repeated `flatMap(...).find(...)`
- centralizes play-to-display semantics

## 5. Player Name Lookup Is Shared but Recomputed Repeatedly

### Main occurrences

- `src/pages/match.js` multiple times
- `src/components/match/tm-match-statistics.js`
- `src/components/match/tm-match-player-dialog.js`
- `src/components/stats/tm-stats-match-processor.js` currently rebuilds manually

### Classification

Minor duplication plus missed caching opportunity.

### Suggested extraction

Build once per `mData` lifecycle and reuse:

```js
mData._playerNames = TmMatchUtils.buildPlayerNames(mData)
```

Or pass it once via shared opts.

### Why it matters

- low complexity win
- removes unnecessary repeated lineup scans

## 6. `tm-stats-match-processor.js` Reimplements Match Helpers

### Main occurrences

- manual `playerNames` map
- manual `subEvents` map
- local `matchStats` aggregation
- local attacking style aggregation

### Classification

Mix of true duplication and acceptable specialization.

### Recommendation

This file should lean harder on `TmMatchUtils` for:

- player name lookup
- substitution map
- base match stats

It can keep custom output shaping for analytics-specific needs.

## 7. Player Tooltip/Profile Enrichment Pipeline Exists Twice

### Main occurrences

- `src/components/match/tm-match-lineups.js` tooltip hover
- `src/components/match/tm-match-player-dialog.js` profile panel

### Shared pipeline

Both flows do nearly the same thing:

1. `fetchTooltip(pid)`
2. deep clone `rawData.player`
3. apply routine override
4. apply position override
5. `TmApi.normalizePlayer(...)`
6. derive `skills`, `isGK`, `r5`, `rec`
7. build UI from enriched data

### Classification

Near-duplication.

### Suggested extraction

```js
enrichTooltipPlayer(rawData, { routineMap, positionMap, pid })
```

or

```js
getMatchPlayerProfileData(pid, rawData, routineMap, positionMap)
```

### Why it matters

- same data preparation logic is duplicated
- UI can stay separate while data normalization becomes shared

## 8. Full-Squad R5 Fetch Pipeline Exists Twice

### Main occurrences

- `src/components/match/tm-match-analysis.js`
- `src/components/match/tm-match-lineups.js`

### Pattern

Both build:

- `routineMap`
- `positionMap`
- `Promise.all(allPlayers.map(p => getPlayerData(...)))`

### Classification

True duplication.

### Suggested extraction

```js
fetchMatchPlayerMetrics(allPlayers, getPlayerData)
```

Possible return:

```js
Map<playerId, { R5, REC, Age }>
```

### Why it matters

- reduces repeated async orchestration code
- makes R5-derived tabs consistent

## 9. Tactical Label Maps Are Duplicated in Multiple Variants

### Main occurrences

- `src/components/match/tm-match-dialog.js`
- `src/components/match/tm-match-lineups.js`
- `src/components/match/tm-match-analysis.js`
- `src/components/stats/tm-stats-match-processor.js` partially via `TmConst`

### Current state

- some mappings already come from `TmConst`
- others are redefined locally in short or long form

### Classification

True duplication for constants, with legitimate short/full presentation variants.

### Suggested extraction

Move all canonical label maps into `TmConst`, for example:

```js
MENTALITY_MAP
MENTALITY_MAP_SHORT
FOCUS_MAP
FOCUS_MAP_SHORT
STYLE_MAP
STYLE_MAP_SHORT
```

### Why it matters

- avoids drift between tabs
- lets UI choose short or full presentation without redefining values

## 10. Accordion Toggle Wiring Is Repeated

### Main occurrences

- `src/pages/match.js`
- `src/components/match/tm-match-statistics.js`
- `src/components/match/tm-match-player-dialog.js`

### Classification

Small true duplication.

### Recommendation

Low priority. Could be extracted only if more accordion UIs are added.

## 11. `renderDetailsTab(...)` Still Contains A Lot of Local Domain Parsing

### Main occurrences

- `src/pages/match.js` `renderDetailsTab(...)`

### What it does locally

- loops visible plays
- detects goals, yellows, yellow-reds, subs, injuries
- converts them into timeline rows
- applies side-aware rendering

### Classification

Near-duplication with the rest of match event parsing.

### Suggested extraction

```js
buildMatchTimelineEvents(mData, opts)
```

This should produce normalized display events and leave only rendering local.

## 12. Some Local Helpers Are Fine and Should Stay Local

### Keep as-is for now

- `src/pages/match.js` `computeActiveRoster(...)`
- `src/pages/match.js` `buildSchedule(...)`
- `src/pages/match.js` Unity-specific helpers
- `src/pages/match.js` `countPlayLines(...)` unless another file needs it

### Why

These are tightly coupled to match replay orchestration rather than general match-domain reuse.

## DRY Improvements Already Done Well

These are already good extractions and should remain the central source of truth:

- `src/components/match/tm-match-utils.js` `buildPlayerEventStats(...)` ✅
- `src/components/match/tm-match-utils.js` `buildSubstitutionMap(...)` ✅ _(added — migrated 3 consumers)_
- `src/components/match/tm-match-utils.js` `extractStats(...)`
- `src/components/match/tm-match-utils.js` `isEventVisible(...)`
- `src/components/match/tm-match-utils.js` `buildPlayerNames(...)`
- `src/components/match/tm-match-utils.js` `faceUrl(...)`
- `src/components/match/tm-match-lineups.js` now using `buildPlayerEventStats(...)` ✅
- `src/components/match/tm-match-lineups.js` sub/injury second pass removed ✅
- `src/components/match/tm-match-statistics.js` sub loop → `buildSubstitutionMap` ✅
- `src/components/match/tm-match-player-dialog.js` sub loop → `buildSubstitutionMap` ✅
- `src/components/stats/tm-stats-match-processor.js` sub loop → `buildSubstitutionMap` ✅

## Recommended Refactor Order

### Phase 1 ✅ DONE

- ~~add `forEachVisiblePlay(...)`~~ _(deferred — low priority without a clear caller)_
- ✅ add `buildSubstitutionMap(...)`
- ✅ switch `tm-match-statistics.js`, `tm-match-player-dialog.js`, and `tm-stats-match-processor.js`

### Phase 2 ✅ DONE

- ✅ fixed `extractStats` yellow_red bug (now counts as yellow + red, previously only red)
- ✅ `updateUnityStats` in `match.js` — replaced 30-line plays loop with `TmMatchUtils.extractStats` call
- ✅ `tm-stats-match-processor.js` — removed per-action matchStats counting from plays loop; now calls `TmMatchUtils.extractStats` before the loop; plays loop is attacking-styles only

### Phase 3 ✅ DONE

- ✅ added `buildMatchMaps(mData)` to `TmMatchUtils` — builds `routineMap` + `positionMap` from `mData.allPlayers` once
- ✅ added `enrichMatchPlayer(rawData, pid, routineMap, positionMap)` to `TmMatchUtils` — clone + routine/position overrides + `normalizePlayer`
- ✅ `tm-match-lineups.js` R5 fetch: replaced 5-line map build with `buildMatchMaps`; replaced 5-line enrichment in tooltip hover with `enrichMatchPlayer`
- ✅ `tm-match-analysis.js` R5 fetch: replaced identical 5-line map build with `buildMatchMaps`
- ✅ `tm-match-player-dialog.js`: replaced 7-line map build with `buildMatchMaps`; replaced 5-line enrichment with `enrichMatchPlayer`
- Added `TmPlayerDB` + `TmApi` imports to `tm-match-utils.js`

### Phase 4 ✅ DONE

- ✅ added `MENTALITY_MAP_LONG`, `STYLE_MAP_SHORT`, `FOCUS_MAP` to `TmConst` (exported)
- ✅ `tm-match-dialog.js` — added `TmConst` import; removed 3 local map consts; uses `TmConst.MENTALITY_MAP`, `TmConst.STYLE_MAP_SHORT`, `TmConst.FOCUS_MAP`
- ✅ `tm-match-lineups.js` — replaced local `mentalityMap`/`focusMap` with `TmConst.MENTALITY_MAP_LONG`/`TmConst.FOCUS_MAP`
- ✅ `tm-match-analysis.js` — replaced 3 inline local map consts with `TmConst` references
- ✅ `match.js` — replaced inline `mentalityMapH` literal with `TmConst.MENTALITY_MAP`
- _(accordion wiring deferred — no new accordion UIs planned)_

## Summary

The match feature is already moving in the right direction: the biggest reusable logic has started to migrate into `tm-match-utils.js`.

The next real DRY win is not generic cleanup. It is specifically:

1. centralizing traversal over `plays`
2. centralizing substitution mapping
3. centralizing repeated event parsing semantics
4. centralizing player enrichment for tooltip/profile UIs

That sequence gives the highest reduction in duplicate logic with the lowest risk to behavior.