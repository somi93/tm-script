# Native Button Audit

Scope: `src/**/*.js`

Rule used for this audit:
- Included: files that contain native `<button>` markup or `document.createElement('button')`
- Excluded: files that use `TmButton` or `TmUI.button`
- Excluded on purpose: `src/components/shared/tm-button.js` because it is the shared button implementation itself

## Pages using native button instead of shared button

- `src/pages/dbinspect.js`
- `src/pages/dbrepair.js`
- `src/pages/fixtures.js`
- `src/pages/import.js`
- `src/pages/r5history.js`

## Components using native button instead of shared button

- `src/components/history/tm-history-matches.js`
- `src/components/history/tm-history-transfers.js`
- `src/components/league/tm-league-fixtures.js`
- `src/components/league/tm-league-panel.js`
- `src/components/league/tm-league-picker.js`
- `src/components/league/tm-league-standings.js`
- `src/components/league/tm-league-stats.js`
- `src/components/league/tm-league-totr.js`
- `src/components/match/tm-match-header.js`
- `src/components/match/tm-match-player-dialog.js`
- `src/components/player/tm-tabs-mod.js`
- `src/components/player/tm-training-mod.js`
- `src/components/shared/tm-app-shell-header.js`
- `src/components/shared/tm-fixture-round-cards.js`
- `src/components/shared/tm-modal.js`
- `src/components/shared/tm-standings-table.js`
- `src/components/shared/tm-tabs.js`
- `src/components/shortlist/tm-shortlist-panel.js`
- `src/components/transfer/tm-transfer-sidebar.js`
- `src/components/transfer/tm-transfer-table.js`

## Mixed or intentionally excluded files

- `src/components/shared/tm-render.js`
  Uses native `button`, but also uses `TmButton`, so it is not listed above under the strict `button a ne tm-button` rule.

## Files already using shared button helper

- `src/pages/friendly-league.js`
- `src/pages/league.js`
- `src/pages/quickmatch.js`
- `src/pages/training.js`
- `src/pages/youth-development.js`

## Notes

- This is a static source audit only.
- The list is based on direct button usage in source files, not on what gets rendered indirectly through shared helpers.
- Example: the `Change tournament` action on `/international-cup/` is mounted through `TmHeroCard.button(...)`, but that helper now delegates button rendering to the shared `TmButton` component.