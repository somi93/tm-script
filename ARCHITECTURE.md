# TMScripts — Architecture & Import Hierarchy

> Last updated: March 2026

---

## Import Hierarchy (strict, top → bottom)

```
pages/
  └─▶  components/{match,player,squad,shared}/
         └─▶  lib/
                └─▶  (constants)
                       └─▶  lib/tm-constants.js
```

**Rule**: imports only go **downward**. A component must never import from `pages/`.  
A `lib/` module must never import from `components/`.  
Violating this risks circular dependency build failures.

---

## Directory Guide

### `src/pages/`  *(entry points, 1 per userscript)*
| File | Userscript | Notes |
|------|-----------|-------|
| `match.js` | TM Match Viewer | Live replay, Unity, tab orchestration |
| `player.js` | TM Player Viewer | Tooltip, sidebar, skills, history |
| `transfer.js` | TM Transfer | Transfer sidebar, bid logic |
| `squad.js` | TM Squad | Squad table |
| `import.js` | TM Import | Batch DB import |
| `dbinspect.js` | TM DB Inspect | IndexedDB viewer |
| `dbrepair.js` | TM DB Repair | IndexedDB repair tool |
| `history.js` | TM History | Match history |
| `league.js` | TM League | League table |
| `players.js` | TM Players | Players list |
| `r5history.js` | TM R5 History | Player R5 tracking |
| `shortlist.js` | TM Shortlist | Shortlist management |
| `stats.js` | TM Stats | Aggregate stats |

### `src/components/match/`  *(match viewer tabs)*
| File | Purpose |
|------|---------|
| `tm-match-utils.js` | Core event parsing utilities (`eachEvent`, `extractStats`, `buildPlayerEventStats`, `renderRichEvents`) |
| `tm-match-lineups.js` | Lineups tab renderer (pitch grid, player list, tactics) |
| `tm-match-player-dialog.js` | Per-player detail overlay (extracted from lineups) |
| `tm-match-statistics.js` | Statistics tab renderer |
| `tm-match-analysis.js` | Pre-match squad analysis tab |
| `tm-match-league.js` | League fixtures & standings tab |
| `tm-match-h2h.js` | Head-to-head tab |
| `tm-match-h2h-tooltip.js` | H2H match mini-tooltip |
| `tm-match-dialog.js` | Match dialog (round history popup) |
| `tm-match-venue.js` | Venue/stadium tab |
| `tm-match-styles.js` | All CSS injected by the match viewer |

### `src/components/player/`  *(player page components)*
| File | Purpose |
|------|---------|
| `tm-player-card.js` | Main player info card (skills, ASI, R5) |
| `tm-player-sidebar.js` | Transfer/notes sidebar |
| `tm-player-tooltip.js` | Tooltip overlay on hover |
| `tm-skills-grid.js` | Reusable skills grid widget |
| `tm-graphs-mod.js` | Skills graph modification |
| `tm-history-mod.js` | History page tab additions |
| `tm-tabs-mod.js` | Player page tab controller |
| `tm-scout-mod.js` | Scout feature additions |
| `tm-training-mod.js` | Training page additions |
| `tm-sidebar-nav.js` | Sidebar navigation widget |
| `tm-asi-calculator.js` | ASI calculator component |
| `tm-best-estimate.js` | Transfer value estimator |

### `src/components/shared/`  *(cross-component UI primitives)*
| File | Purpose |
|------|---------|
| `tm-ui.js` | `TmUI` — loading/error/empty states, shared UI helpers |
| `tm-render.js` | `TmRender` — structured rendering (`<tm-card>`, `<tm-divider>`, etc.) |

### `src/components/squad/`
| File | Purpose |
|------|---------|
| `tm-squad-table.js` | Squad table component |

### `src/lib/`  *(shared utilities, no component dependencies)*
| File | Exports | Notes |
|------|---------|-------|
| `tm-constants.js` | `TmConst` | All game constants: skills, positions, thresholds, action labels |
| `tm-utils.js` | `TmUtils` | Color helpers, formatting, skill math |
| `tm-lib.js` | `TmLib` | API response parsers, club/player formatters |
| `tm-services.js` | `TmApi` | All fetch calls (tooltip, lineup, fixtures…) |
| `tm-playerdb.js` | `TmPlayerDB` | IndexedDB layer — get/set/sync players |
| `tm-dbsync.js` | `TmDbSync` | Bulk DB sync logic |
| `tm-squad.js` | `TmSquad` | Squad computation helpers |
| `tm-position.js` | `TmPosition` | Position classification utilities |

---

## Adding a New Component

1. Create `src/components/{domain}/tm-{name}.js`
2. `export const TmMyComponent = { ... };`
3. Imports: only from `lib/` or `components/shared/` (or same domain siblings)
4. Import it in the relevant `src/pages/*.js` entry point
5. No need to update `build.js` — esbuild discovers it through the import graph

---

## Build

```
node build.js --local     # dev build (file:// paths in @require)
node build.js             # production build
```

Output: `dist/tm-bundle.js` (all pages bundled separately), `tm.user.js` (meta-script).

---

## Key Invariants

- **No circular imports** — enforced by the one-way hierarchy above
- **jQuery (`$`)** — global, injected by TrophyManager page — no import needed
- **TmConst** — all game constants belong here; if a value appears in 2+ files, move it here
- **TmUtils** — pure utility functions (no DOM, no fetch); color helpers, formatters
- **TmUI** — any DOM helper that creates loading/error/empty states
