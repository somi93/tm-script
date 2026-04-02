# Optimization Plan

## Purpose

This file tracks the next optimization and cleanup work that is still not done.

It should stay aligned with the unfinished parts of `docs/UI_STANDARDIZATION_TODO.md`, plus only the remaining optimization work that still has acceptable ROI.

## Current Position

- Low-risk listener/delegation cleanup sweep is effectively done.
- Low-risk render-path micro-optimizations are mostly done.
- The next useful work is no longer blind micro-cleanup.
- The next useful work is finishing selected unfinished standardization and cleanup items.
- Local validation baseline after the latest pass: `node build.js --local` passes.

## Active Next Work

### 1. Phase 1 Finish: Shared Utility Classes

Status:

- Still not done in `docs/UI_STANDARDIZATION_TODO.md`.

What to do next:

- Add a small shared utility-class layer only for semantic recurring cases.
- Keep it narrow and intentional.
- Do not create generic random spacing/color helpers.

Good candidates:

- repeated muted/helper text wrappers
- repeated strong/accent text wrappers
- repeated small panel-label/meta wrappers
- repeated embedded border/surface helper cases where shared primitives already rely on the same meaning

### 2. Phase 6 Finish: Static Style Cleanup

Status:

- Still open in `docs/UI_STANDARDIZATION_TODO.md`.
- Most easy wins are already done.
- What remains is selective cleanup of static inline/background/border/text values where they still behave like shared semantics.

What to do next:

1. Remove remaining static inline semantic color/background/border values where a token-backed class is clearer.
2. Keep inline style only for runtime-calculated values.
3. Introduce semantic helper classes only where the same meaning repeats enough to justify them.

Priority targets:

1. `src/components/player/tm-player-card.js`
2. `src/components/player/tm-best-estimate.js`
3. `src/components/shared/tm-scout-report-cards.js`
4. `src/components/transfer/tm-transfer-table.js`
5. `src/components/shortlist/tm-shortlist-table.js`

Latest status:

- The first Phase 6 priority wave is now complete for the listed offenders above.
- The next useful cleanup step is no longer another table/card utility adoption pass.
- The next useful cleanup step is continuing Phase 8 page work, starting with `src/pages/home.js` and then `player` page structure.
- The first small Phase 8 structural passes are now in place in both `home` and `player` page entry files.

### 3. Phase 8 Continue: Page Cleanup Candidates

Status:

- `Training` is done.
- `League` verification is done.
- `Home` and `Player` are still open.

What to do next:

#### Home

- reduce remaining page-local styling
- extract any still-repeated section wrapper patterns
- avoid changing dashboard-specific composition that is intentionally custom

#### Player

- keep player-page layout local
- continue pushing reusable section structure into shared primitives
- avoid broad redesigns of player-specific feature sections

## Optimization Work We Still Accept

Optimization work is still valid, but only when it is one of these:

- repeated rerender path cleanup
- repeated init/idempotency cleanup
- repeated aggregation cleanup in summary/render helpers
- repeated lookup cleanup inside dense render loops

## Optimization Work We Do Not Prioritize Now

Avoid spending time on these unless there is a concrete bug or measurable slowdown:

- canvas drag/zoom/hover logic
- tooltip timing flows
- PM/app-shell interaction flows
- large parser rewrites
- broad shared primitive redesigns done only in the name of optimization

## Working Order From Here

Use this order unless a stronger hotspot appears:

1. finish one small shared utility-class pass
2. continue `home` page cleanup when another repeated section-shell pattern is identified
3. continue `player` page shared-structure cleanup around rail and section composition
4. only return to Phase 6 when a clearly repeated semantic offender remains
5. only then resume targeted micro-optimization in actual hotspots

## Decision Rule Before Any Next Change

Before starting the next task, confirm:

- is this still an unfinished item from the active backlog?
- is the change local and low-risk?
- does it improve shared consistency or a real repeated path?
- can it be validated with diagnostics plus `node build.js --local`?

If not, skip it.