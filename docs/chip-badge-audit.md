# Chip And Badge Audit

Date: 2026-03-20

Scope:
- reviewed local chip, badge, and pill-like UI in `src/**/*.js`
- separated true shared-chip candidates from richer badge patterns
- treated `TmPosition.chip(...)` as already shared and therefore out of scope for migration

Rule used for this audit:
- `TmUI.chip(...)` is currently suitable for short, single-text chips
- local UI that contains label + value, embedded links, icons, or more complex status semantics is listed under `needs shared badge primitive`
- files that already style `.tmu-chip` are considered already on the shared chip path

## Already On Shared Chip Path

### `src/pages/national-teams.js`
- Status: already shared
- Why: styles target `.tmu-chip` directly rather than defining a separate local chip implementation
- Note: this is a shared-chip override, not a local chip replacement target

### `src/lib/tm-position.js`
- Status: shared path already in use across the repo
- Why: `TmPosition.chip(...)` is the shared position-chip renderer used by many tables and dialogs
- Note: not part of the `replace local chip with shared chip` backlog

## Directly Migratable To `TmUI.chip`

### `src/pages/import.js`
- Location: `gk-badge` in the DB list table
- Example use: `GK`
- Why it fits: single short token, no nested markup, no link/value split
- Priority: high

### `src/pages/training.js`
- Location: `tmvu-tr-mode-badge`
- Example use: `GK`, `Standard`, `Custom`, training type labels
- Why it fits: short single-text mode pills
- Priority: high

### `src/pages/scouts.js`
- Location: `tmvu-scouts-chip`
- Example use: `Loading`, `Age 18`, `Now 19.04`
- Why it fits: short text-only chip content
- Priority: medium

Status update:
- `src/pages/import.js` migrated to shared chip
- `src/pages/training.js` migrated to shared chip
- `src/pages/scouts.js` migrated to shared chip

## Needs Shared Badge Primitive

### `src/pages/friendly-league.js`
- Location: `tmvu-fl-pill`
- Example use: `Your Rank` + `#1`, `Points` + value, `Goals` + value
- Why it does not fit current chip: metric pill with label/value structure
- Status: migrated to shared chip after chip gained label/value support

### `src/pages/finances.js`
- Location: `tmvu-fin-chip`
- Example use: `Current Balance` + bold value
- Why it does not fit current chip: metric pill with emphasized value node
- Status: migrated to shared chip after chip gained label/value support

### `src/pages/cup.js`
- Location: `tmvu-cup-pill`
- Example use: plain text pill, linked round pill, and injected `changeHtml`
- Why it does not fit current chip: supports nested markup and links
- Status: migrated to shared chip after chip gained slot support

### `src/components/match/tm-match-header.js`
- Location: `rnd-dlg-chip`
- Example use: icon + label/value pair such as mentality, style, focus, R5
- Why it does not fit current chip: structured content with nested `.chip-val`
- Status: migrated to shared badge primitive

### `src/components/player/tm-player-card.js`
- Location: `tmpc-badge-chip`
- Example use: `ASI` + value, `TI` + value
- Why it does not fit current chip: compact metric badge pattern
- Status: migrated to shared badge primitive

### `src/components/player/tm-player-card.js`
- Location: `tmpc-nt`
- Example use: `NT`
- Why it does not fit current chip: semantically a status badge; likely belongs with a broader badge primitive rather than plain chip
- Status: migrated to shared badge primitive

### `src/pages/dbinspect.js`
- Location: `dbi-badge*`
- Example use: `INTERP`, `INTERP2`, `ESTIMATED`, `REAL`, `LOCKED`, `LIVE`
- Why it does not fit current chip: status badge family with multiple semantic tones
- Status: migrated to shared badge primitive

### `src/components/player/tm-player-tooltip.js`
- Location: `tmpt-badge`
- Example use: `R5` + value, `TI` + value
- Why it does not fit current chip: compact metric badge pattern
- Status: migrated to shared badge primitive

### `src/components/shared/tm-scout-report-cards.js`
- Location: `tmsc-yd-badge`, `tmsc-conf`
- Example use: `YD`, confidence percentages like `85%`
- Why it does not fit current chip: compact status and confidence badge pattern
- Status: migrated to shared badge primitive

### `src/components/player/tm-training-mod.js`
- Location: `tmt-readonly-badge`
- Example use: `View only`
- Why it does not fit current chip: warning/state badge pattern

### `src/components/squad/tm-squad-table.js`
- Location: `tmsq-bteam-badge`, `tmsq-sale-badge`
- Example use: `B`, `💰`
- Why it does not fit current chip: tiny status indicators tied to table-row semantics
- Status: migrated to shared badge primitive

### `src/components/match/tm-match-player-dialog.js`
- Location: `rnd-plr-badge`
- Example use: shirt number, age, minutes, sub status
- Why it does not fit current chip: icon-led metadata badges
- Status: migrated to shared badge primitive

### `src/components/match/tm-match-report.js`
- Location: `rnd-report-evt-badge`
- Example use: goal, card, injury, substitution event badges
- Why it does not fit current chip: event/status badge family with strong semantic tones
- Status: migrated to shared badge primitive

### `src/components/match/tm-match-league.js`
- Location: `rnd-league-minute-badge`
- Example use: live minute badge
- Why it does not fit current chip: time/status badge
- Status: migrated to shared badge primitive

### `src/components/match/tm-match-h2h.js`
- Location: `rnd-h2h-type-badge`
- Example use: H2H type marker
- Why it does not fit current chip: semantic badge, not just decorative chip
- Status: migrated to shared badge primitive

## Suggested Next Steps

1. Continue shared badge rollout for:
   - status badges
   - metric pills with label + value
   - icon + text badge patterns

2. Revisit the remaining badge-heavy modules now that that primitive exists:
   - `src/components/player/tm-training-mod.js`
   - `src/components/squad/tm-squad-table.js`
   - `src/components/match/tm-match-player-dialog.js`
   - `src/components/match/tm-match-report.js`
   - `src/components/match/tm-match-league.js`
   - `src/components/match/tm-match-h2h.js`

## Short Take

The main backlog is now `badge`, not `chip`.

The plain chip pass is effectively complete for the audited targets. The remaining local implementations are mostly badge or metric-pill patterns, so the next cleanups should standardize on the shared badge primitive rather than stretching `TmUI.chip(...)` further.

## Metric Rollout Status

Shared `TmMetric` is now established as the default pattern for page-level overview, KPI, and label/value summary blocks.

Completed metric migrations:
- `src/pages/friendly-league.js`
- `src/pages/cup.js`
- `src/pages/finances.js`
- `src/pages/national-teams.js`
- `src/pages/scouts.js`
- `src/pages/training.js`
- `src/pages/quickmatch.js`
- `src/pages/youth-development.js`
- `src/pages/fixtures.js`
- `src/components/match/tm-match-player-dialog.js`
- `src/components/shared/tm-scout-report-cards.js`

Remaining work is no longer a broad page-level rollout. It is mostly isolated local `label/value` leftovers or intentionally custom layouts such as stars, special controls, or shadow-DOM surfaces.

Shared `TmTooltipStats` now covers the repeated possession/shots/on-target triplets in history and H2H hover tooltips.

Shared `TmMatchTooltip` now covers the common H2H, hover-card, and history tooltip shell, header/meta/event/match-summary rendering.

History tabs now use shared `TmUI.loading(...)`, `TmUI.empty(...)`, and `TmUI.error(...)` for standard state surfaces, while repeated history progress/counting flows now go through `TmHistoryHelpers.progressState(...)`.

Repeated history season-toolbar markup and prev/next/select navigation now go through `TmHistoryHelpers.seasonBar(...)` and `TmHistoryHelpers.bindSeasonBar(...)` in matches and transfers.

Stats player/team filter groups and shared match-type filter buttons now go through `TmStatsFilterGroup`, removing repeated render/bind loops from `stats.js`, `tm-stats-player-tab.js`, and `tm-stats-team-tab.js`.

Stats tactic dropdown rendering and interaction now go through `TmStatsTacticDropdown`, leaving only aggregation/filter semantics in `tm-stats-team-tab.js`.

Stats tactic filter state access/reset is now centralized in `stats.js` through generic `getTacticFilter(...)`, `setTacticFilter(...)`, and `resetTacticFilters(...)`, and `tm-stats-team-tab.js` consumes that generic API instead of six separate getter/setter props.

Shortlist filter-bar button rendering and filter input binding now go through `TmShortlistFilters`, so `tm-shortlist-panel.js` no longer wires position/side/numeric filters manually.

Repeated `.rnd-acc-head` click/toggle wiring in the match feature now goes through `TmMatchAccordion`, so report/statistics/player-dialog modules keep only their local rendering and overlay behavior.

Repeated home-vs-away split stat rows in the live match sidebar and league hover tooltip now go through `TmMatchComparisonRow`, keeping shared percentage/lead-state rendering in one match-level helper while preserving local layouts and classes.

Repeated squad-profile cards in match analysis now go through `TmMatchAnalysisProfile`, so the analysis module defines the metrics as data while the shared card shell stays in one helper.

Repeated tactic info rows in match analysis now go through `TmMatchAnalysisTactic`, so the analysis module defines tactic fields as data instead of hand-writing four identical row templates per side.

League stats and transfers now use a shared `TmLeagueTable` element for sortable table shells, so stats/transfer views no longer hand-build `<table>` wrappers and sort binding separately for each table variant.

Shortlist player/indexed tables now mount through `TmShortlistTable` table elements instead of panel-local string rendering plus separate header-click binding, so the shortlist panel keeps pagination/filter/tooltip orchestration while the table element owns its own shell.

Transfer market breakdown and skills-mode table shells now mount through `TmTransferTable` table elements instead of page-local table HTML assembly plus header sort binding, so `transfer.js` keeps countdown/tooltip/expand orchestration while the table component owns the shell.

Player history and scout tabular views now use `TmPlayerDataTable` for the shared table shell, so those modules keep tab/data/action logic while the table structure is centralized for national-team, career-history, scouts, and interested-clubs tables.

Match statistics player and goalkeeper tables now mount through `TmMatchPlayerStatsTable`, so `tm-match-statistics.js` keeps section composition and player-dialog orchestration while the table shell lives in one match-level element.

Import page DB player list now mounts through `TmImportDbTable`, so `import.js` keeps only player-record aggregation while the import-level element owns the searchable, sortable table shell.

Import parsed-player preview and bad-routine results now mount through `TmImportParsedTable` and `TmImportRoutinePanel`, so `import.js` keeps file parsing, DB checks, and fix orchestration while those import panels own their own table shells.

Import DB list, parsed preview, and bad-routine tables now render through shared `TmTable`; import-level components keep only panel/search/fix orchestration and import-specific wrappers.

League stats/transfers and player history/scout table adapters now also render through shared `TmTable`, so those feature-level wrappers keep grouped-header or tab-content orchestration without maintaining a separate table engine.

Shortlist player/indexed tables and transfer market table shells now also route through shared `TmTable`; those feature adapters keep only row markup, countdown/tooltip hooks, and page-specific orchestration.

History transfer/match/league KPI strips, squad overview summaries, club fixtures summary, and stats team-tab summary now render through shared `TmSummaryStrip`; the remaining feature modules keep only data shaping and tone-specific value coloring.

Shortlist now uses a shared outer `tmu-panel` shell instead of a feature-local page wrapper, and shared cards now support `soft` and `sidebar` variants so quickmatch, scouts, training, squad, and player sidebar no longer need as much `.tmu-card`-level override CSS.

Shared cards now also support an `embedded` variant used by stats shells and the player skills grid, which reduced the remaining `.tmu-card` overrides to a small set of legitimate local cases: fixture round navigator head layout, squad overview body spacing, and nested scout report best-estimate cards.

Residual custom layouts that should stay separate from `TmMetric` unless a new primitive is introduced:
- comparative stat-bar rows in match and stats views
- star/recommendation rows in youth development
- shadow-DOM-only surfaces such as player training mod