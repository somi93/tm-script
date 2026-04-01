# UI Standardization Todo

## Goal

Reduce one-off styling and move the app toward a single shared UI system for theme, layout, primitives, states, and feature composition.

## Principles

- Shared theme defines values.
- Shared primitives define behavior and structure.
- Feature components choose variants, not raw colors.
- Pages compose sections; they should not act as mini design systems.
- Inline style stays only for truly dynamic runtime values.

## Phase 1: Theme Foundation

- [x] Pick one canonical theme source and remove duplicated surface/token definitions between shared UI and app shell.
- [x] Define a stable token set for surfaces, borders, text, intents, spacing, radius, shadows, and transitions.
- [x] Move remaining shared primitive hardcoded colors to theme tokens.
- [x] Document token naming rules and when feature-local CSS may use them.
- [ ] Add shared utility classes only for semantic use, not random one-off styling.

### Token Rules

- `--tmu-surface-*` is only for fills and background layers of shared primitives.
- `--tmu-border-*` is only for outline, divider, and control edge values.
- `--tmu-text-*` is only for semantic text tiers like strong, main, muted, dim, disabled, and inverse.
- Intent tokens stay semantic: `--tmu-success`, `--tmu-warning`, `--tmu-danger`, `--tmu-info`, `--tmu-accent`.
- Feature-local CSS may consume tokens, but should not redefine shared primitive internals like `.tmu-card`, `.tmu-tab`, `.tmu-btn`.
- Inline style is acceptable only for runtime-calculated values such as widths, percentages, chart colors, or threshold-driven values.
- If a value repeats across two shared primitives, it belongs in theme tokens before adding another local color constant.

## Phase 2: Primitive Enforcement

- [x] Define the canonical primitive set: Card, SectionCard, Button, Tabs, Badge, State, Table, Input, Notice, SummaryStrip.
- [x] Audit where native buttons/tabs/cards are still used instead of shared primitives.
- [x] Replace high-traffic native button usage with `TmButton` first.
- [x] Replace local tab shells with shared `TmTabs` where possible.
- [x] Standardize card header/body/flush behavior across all shared card variants.

### Canonical Primitive Set

- `Card`: base shell produced by `tm-card` in `TmRender`; owns canonical header/body/flush/variant structure and should stay the default container shell for feature sections.
- `SectionCard`: ergonomic wrapper around `tm-card` for page/component composition; use when a feature needs title/subtitle/body refs without rebuilding card markup.
- `Button`: `TmButton` is the canonical action primitive for clickable commands, links rendered as buttons, and button-like affordances.
- `Tabs`: `TmTabs` is the canonical tab primitive for segmented navigation and local view switching.
- `Badge`: `TmBadge` is the canonical compact status/count/intent chip for semantic emphasis that is not interactive.
- `State`: `TmState` plus `TmUI.loading/empty/error/info` is the canonical primitive for loading, empty, error, and neutral informational shells.
- `Table`: `TmTable` is the canonical tabular data primitive whenever the surface is still fundamentally rows and columns.
- `Input`: `TmInput` is the canonical text/number/form-entry primitive; wrappers like `TmAutocomplete` should compose it rather than restyle native inputs from scratch.
- `Notice`: `TmNotice` is the canonical inline explanatory/warning/info callout inside cards, forms, and detail views.
- `SummaryStrip`: `TmSummaryStrip` is the canonical compact summary-metrics strip for top-of-section KPI rows.

### Primitive Boundaries

- `TmUI` is a convenience facade, not a separate primitive layer. New feature work should still think in terms of the underlying primitives above.
- `TmHeroCard` is a shared composition pattern built on shared primitives, not a replacement for the base `Card` shell.
- `TmRender` owns shared shell hydration for `tm-card`, `tm-button`, `tm-input`, `tm-stat`, and list-item wrappers; feature modules should prefer extending those hooks over inventing parallel mini-primitives.
- Page files may compose primitives, but should not redefine card/button/tab behavior that already exists in shared components.

### Current Phase 2 Notes

- A fresh audit pass across `src/` confirmed that most page-level card shells now already route through `tm-card`, `TmSectionCard`, `TmHeroCard`, and `TmTable`, while the remaining native-card references are mostly source-parsing hooks against TM markup (`.box_head`, `.box_body`, `.box_sub_header`) rather than app-owned replacement shells.
- The high-traffic button hotspot pass is now complete for the main app-owned CTA shells: `sponsors` action and refresh CTAs, the main app-owned CTA rows in `tm-social-feed`, the injected post action bar in `tm-native-feed`, and the app-shell PM/feed trigger and list-action surfaces now route through shared `TmUI.button` or `TmButton` helpers.
- The remaining raw button markup in this repo is now mostly intentional: richer interaction chips like comment-count pills, more-comments cards, and selected-option cards still own custom structure/state and are no longer part of the “high-traffic native button” backlog.
- The tab-shell backlog is also shrinking: `stats` top-level tabs, match-type tabs, and player-category subtabs now all route through shared `TmUI.tabs` instead of older local filter-group shells. The remaining tab work is increasingly concentrated in TM-markup preservation flows rather than app-owned mini tab systems.
- The remaining local/native tab handling is now concentrated in TM-markup preservation flows such as `teamsters`, app-shell PM dialog chrome, and native-feed wrappers where the source DOM contract still matters. For the app-owned shells in this repo sweep, the practical `TmTabs` migration work is complete.
- The shared card contract is now also consolidated: `TmHeroCard` mounts through the canonical `tm-card` flush shell instead of carrying a parallel outer surface, and `tm-card` hydration now supports extra shell classes plus explicit body refs. That means `Card`, `SectionCard`, and `HeroCard` now share the same outer card/body/flush mechanics even when their inner compositions differ.
- Because this audit is now explicit, the primitive-enforcement backlog can focus on a short hotspot list instead of continuing repo-wide blind searches.

## Phase 3: Layout System

- [x] Create shared page layout patterns for 2-column, 3-rail, sidebar-stack, section-stack, and card-grid pages.
- [x] Stop defining ad hoc page grids directly inside page files when a shared layout fits.
- [x] Standardize gap and padding scales used by pages and major feature sections.
- [x] Add responsive rules to shared layout patterns instead of repeating them per page.

### Current Phase 3 Notes

- Shared page-level layout primitives now exist in `tm-page-layout`: `tmu-page-layout-2col`, `tmu-page-layout-3rail`, `tmu-page-sidebar-stack`, `tmu-page-section-stack`, `tmu-page-rail-stack`, and `tmu-page-card-grid`, with shared responsive collapse rules for 3-rail and narrow-width sidebar stacking.
- The first adoption wave moved the repeated article/pro pages (`about-pro`, `buy-pro`, `support-pro`, `free-pro`, `donations`) onto the shared 2-column plus section-stack/sidebar-stack patterns instead of each file redefining the same `184px + main` grid and vertical main stack.
- The finances family (`finances`, `finances-wages`, `finances-maintenance`) now also shares the same 3-rail page contract and stack classes instead of each page carrying its own copy of the `184px + main + 340px` shell.
- A follow-up adoption wave moved `user-guide`, both `teamsters` layouts, and `sponsors` onto the same shared page-shell classes; the page files now keep only feature-local content layout and any intentional breakpoint overrides instead of redefining the baseline scaffold.
- The shared layout contract now also exposes a configurable main track, so pages with intentional `0.9fr` or `0.96fr` center-column proportions can still adopt the shared 3-rail shell; `friendly-league`, `national-teams`, and `scouts-hire` now use that shared scaffold while keeping their local proportion variables and breakpoint tuning.
- The same shared shell now also covers `forum`, `youth-development`, and `cup`: `forum` keeps its custom sidebar composition but no longer owns the baseline `240px + main` scaffold, while `youth-development` and `cup` now use the shared 2-column and 3-rail page contracts with only feature-local hero/content layout left behind.
- Another adoption pass moved the remaining side-menu-plus-main pages `national-teams-rankings`, `quickmatch`, and `scouts` onto the shared 2-column scaffold, leaving only their inner feature layouts and content grids local to those files.
- Shared layout spacing helpers now also exist for compact, regular, and roomy page/section density plus card-grid density, so page-shell spacing can move onto named shared scales instead of continuing to hardcode `14px` or `16px` per file. The current compact page-shell adopters are `forum` and `youth-development`.
- The broad shared-layout adoption set now also uses explicit density classes instead of relying on implicit defaults: most 2-column and 3-rail pages now declare `tmu-page-density-regular`, while the current tighter page-shell exceptions declare `tmu-page-density-compact`.
- Card-grid spacing now follows the same named scale as page-shell spacing: the shared layout layer includes a tight card-grid density for the current `donations` legendary grid, so that view no longer carries its `6px` grid gap as a one-off raw value.
- Shared responsive layout helpers now also cover the early single-column stack case used by `forum`, via `tmu-page-stack-early`, so that page no longer needs to locally restate its page-shell collapse rule.
- The spacing contract is now also being used outside strict side-menu page shells: `home` keeps its custom 2-column dashboard grid, but its left and right vertical content rails now use the shared roomy stack contract instead of owning another local `20px` stack definition.
- Shared section-level stack helpers now also cover common `10px` and `12px` vertical list/card-body spacing. `quickmatch`, `scouts`, and `national-teams` now route several card bodies and content lists through that shared stack contract instead of re-declaring the same flex-column gap rules per file.
- Another adoption pass moved `bids` and `training` onto the shared 2-column shell as well, while `home` continued shedding one-off wrapper stacks: its list, calendar, next-match, and forum sections now use the shared stack-density helpers instead of keeping separate local flex-column gap rules.
- Another low-risk cleanup wave pushed more inner page layouts onto the same shared spacing contract: `sponsors` now uses shared card-grid and stack helpers for its target picker and offer stack, `cup` uses the shared card-grid helper for its overview metric strip, `training` card bodies now route through the shared regular stack density, and `youth-development` uses the shared regular stack for its player-card list instead of a one-column local grid.
- The same spacing pass now also covers more finance and league internals: `finances` routes its hero metrics plus the balance/highlight side cards through shared card-grid and tight stack helpers, and `friendly-league` no longer keeps a one-off local `10px` chat-list stack rule.
- The rest of the finance family now follows that same inner-spacing contract too: `finances-wages` routes its hero metrics and summary cards through shared card-grid/tight-stack helpers, and `finances-maintenance` now uses shared stack helpers for its summary cards and the inner infrastructure panel stack.
- Another small follow-up cleared two more repeated `10px` content stacks without changing feature structure: `about-pro` quote testimonials and the main `forum` post list now both use the shared tight stack helper instead of local flex-column gap rules.
- With the latest `quickmatch`, `scouts-hire`, `teamsters`, `about-tm`, and `sponsors` follow-ups, the named spacing scales now cover the baseline page shells plus the repeated major section wrappers that were still carrying raw `10px`/`12px`/`14px`/`16px` values in page files. What remains local at this point is mostly deliberate feature-specific micro layout, plus a small legacy tournament-route override that is better handled with the shared tournament card wrapper than with another page-level spacing rule.
- The remaining shared-layout cleanup threshold is now also met for baseline page scaffolds: repeated 2-column and 3-rail page shells have been moved onto `tm-page-layout`, and the last `cup` tournament-route/history duplicate now lives only in the shared tournament-card wrapper. The custom page wrappers still left in page files are intentional exceptions like the `home` dashboard, the player detail layout, or simple single-column article wrappers rather than missed shared-layout candidates.
- Shared responsive shell handling now also includes an explicit early 3-rail collapse helper for pages that need the rail to drop under the main column before the default breakpoint. `sponsors` now uses that shared helper instead of carrying another local page-shell media override; the remaining page-local media rules are mostly feature-content adjustments or page-specific proportion tuning rather than repeated baseline shell behavior.
- With that split now explicit, the remaining media queries in page files are no longer carrying the repo's baseline responsive shell contract. They mostly tune hero/content internals, feature-specific grids, or page-specific track proportions (`friendly-league`, `national-teams`, `cup`) rather than restating the shared 2-column/3-rail collapse behavior itself.
- The remaining Phase 3 work is mostly about continuing adoption, not inventing more page-shell variants: several pages still carry local grid rules because their inner content layouts are genuinely feature-specific, but the baseline page scaffolds no longer need to be duplicated.

## Phase 4: State Standardization

- [x] Make `TmState` the default for loading, empty, error, and no-results surfaces.
- [x] Audit pages/components that still render custom loading or error HTML.
- [x] Add any missing shared state variants before replacing local ones.

### Current Phase 4 Notes

- `fixtures` empty-filter fallback plus history match-tooltip/transfers and `nt-save` result-empty surfaces now use shared `TmUI.empty/loading/error` helpers instead of local placeholder divs; the follow-up pass removed the dead `tmcf-empty/tmcf-error`, `tmh-tooltip-loading`, and `tmvu-nt-save-empty` selectors after the shared state swap.
- `import` file-parse fallbacks and `squad` page load failures now also route through shared `TmUI.error` instead of one-off inline-colored error divs, keeping those small failure surfaces aligned with the rest of the Phase 4 pass.
- Phase 4 state-surface audit is complete for the current repo sweep: page-level and panel-level loading/empty/error shells now overwhelmingly route through `TmUI`/`TmState`, while the remaining custom cases are classified as intentional feature-local exceptions rather than missed generic shells. Current exceptions are mostly embedded content placeholders like the scouts report-card fallback copy, the social-feed likes-dialog subtitle text, and native-markup preservation such as the bids raw HTML fallback.
- `TmState` now includes a shared neutral `info` variant for embedded informational/pending states, and the scouts report-card fallback copy now uses that shared surface instead of a one-off dashed local box. That closes the current shared-variant gap surfaced by the Phase 4 audit.
- `sponsors` offer loading/missing/empty branches plus its target-selection empty/unavailable states now render through shared `TmUI.loading/info/empty` helpers instead of local note divs, so another page-level card flow no longer carries its own state shell markup.
- `r5history` sync-issues success fallback now also uses shared `TmUI.info`, which closes one more inline state-only message. For this repo sweep, shared `TmUI`/`TmState` is now the default for loading, empty, error, and no-results surfaces; the remaining local exceptions are progress indicators, inline status text, and native-markup preservation rather than separate state shells.

## Phase 5: Shadow DOM Policy

- [x] Decide whether Shadow DOM is allowed only for isolation from TM native styles.
- [x] Refactor `tm-training-mod` so it does not manually duplicate shared button/tab theme logic.
- [x] If Shadow DOM remains, provide a shared way to inject theme tokens and shared primitive CSS into shadow roots.

### Current Phase 5 Notes

- The current repo policy is now explicit: Shadow DOM is allowed only when a feature genuinely needs isolation from TrophyManager's native page CSS or markup leakage. It is not the default composition model for new app-owned UI.
- The only active Shadow DOM usage in this repo sweep is `tm-training-mod`, which is a compact embedded control that benefits from style isolation inside the player page. It now consumes shared theme and primitive CSS through `ensureTmTheme(...)` plus shared injectors instead of carrying a parallel private theme layer.
- New feature work should prefer the normal shared-light-DOM primitives first. Shadow roots should remain the exception for hostile native-style environments, not a convenience wrapper around app-owned cards, buttons, tabs, or layout shells.

## Phase 6: Static Style Cleanup

- [ ] Remove static inline background/color styles where a shared class or token-backed class should be used.
- [ ] Keep inline style only for dynamic values like widths, chart colors, position colors, and threshold-driven values.
- [ ] Introduce semantic helper classes for repeated status/value patterns such as success, warning, muted, and accent text.
- [ ] Refactor the worst offenders first: player card, best estimate, scout report cards, transfer table, shortlist table.

### Current Phase 6 Notes

- `tm-best-estimate` confidence pills now use shared `TmUI.badge`, and repeated static muted/unknown subtext moved off inline spans; remaining inline colors there are mostly runtime threshold values for bars, percentages, and estimate emphasis.
- `tm-player-card` static card chrome, muted labels, club link, wage highlight, and non-runtime badge text now use shared tokens/local semantic classes; remaining inline styles there are primarily dynamic position and threshold colors.
- `tm-scout-report-cards` static report chrome now uses shared tokens, specialty fallback color uses semantic metric classes, and local error boxes were replaced with shared `TmUI.error`; remaining hardcoded colors there are threshold-driven scout outputs.
- Transfer table and transfer page now use shared state surfaces for loading/empty/error, while table fallback/value spans use shared `tms-*` classes instead of repeated inline muted/static text styling; remaining inline colors are mostly dynamic threshold and position values.
- Shortlist table now uses shared tokens for static table/filter chrome plus reusable `tmsl-*` helper classes for muted, ASI, pending, and last-seen states; remaining inline colors there are primarily dynamic threshold and position values.
- The latest cleanup wave pushed more Phase 6 static chrome onto shared tokens across `league`, `transfer`, and `shortlist`: league feed/sidebar/modal text states, transfer sidebar/table/tooltip/modal shells, and shortlist indexed-position fallbacks no longer carry their own hardcoded palette for static surfaces. Remaining local colors in those areas are mostly opacity overlays, native-feed decoration, or genuine runtime threshold/position outputs.
- The follow-up multi-file pass also moved another batch of small static inline colors onto shared tokens across `dbrepair`, `dbinspect`, `import`, `history`, `national-teams`, `league-fixtures`, `league-stats`, `shortlist-filters`, `tm-position`, `tm-skill`, and `tm-training-mod`. Those modules still keep local inline colors only where the value is genuinely runtime-driven, position-driven, or chart/threshold-specific.
- The newest pass extended that cleanup into shared standings, player tooltip, squad table, and match helper modules: `tm-standings-table`, `tm-player-tooltip`, `tm-squad-table`, `tm-match-statistics`, and `tm-match-analysis` now use shared semantic tokens for static win/draw/loss, fallback, ASI, injury, and default home/away label colors. Remaining inline colors there are still the runtime threshold values and feature-owned team/chart data.
- Another follow-up pass pushed shared semantic tokens deeper into the shared/history/import layer: `tm-table`, `tm-modal`, `tm-history-styles`, `tm-import-styles`, and the remaining static text accents in `tm-player-tooltip` no longer hardcode their link/title/summary tones. Those files still keep their feature-local gradients and structural styling, but shared semantic text/accent colors now come from the canonical theme.
- The latest sweep covered more shared/page-shell and player helper surfaces: `tm-fixture-match-row`, `tm-history-mod`, `tm-scout-mod`, `tm-r5history-styles`, `tm-side-menu`, `fixtures`, `forum`, plus several article-style pages (`about-tm`, `buy-pro`, `donations`, `free-pro`, `support-pro`, `teamsters`, `user-guide`) now use shared semantic accent/text tokens for static score, nav, link, title, and status coloring. Remaining colors there are mostly gradients, chart lines, or feature-owned domain palettes.
- Another stats/db/shared-helper pass moved more static semantic colors onto the canonical theme in `tm-stats-team-tab`, `tm-stats-styles`, `tm-dbrepair-styles`, `tm-dbinspect-styles`, `tm-autocomplete`, `tm-progress`, and the remaining totals in `tm-history-mod`. Those modules still keep domain-specific position, medal, chart, and interpolation palettes local, but generic success/warning/danger/strong/accent tones now come from shared tokens.
- The newest club/league/shared-shell wave extended that same treatment into `tm-club-fixtures-styles`, `tm-league-picker`, `tm-league-stats`, `tm-league-standings`, plus more shared shell styles in `tm-modal`, `tm-chip`, `tm-fixture-match-row`, `tm-progress`, and the top-level stats tab shell. Static venue/result/nav/button/title accents in those files now pull from shared semantic tokens; remaining raw colors there are mostly gradients, position palettes, or feature-owned runtime indicators.
- Another shared-shell pass aligned the feed and tournament wrappers with the canonical theme: `tm-native-feed`, `tm-social-feed`, `tm-international-cup-overview-page`, and `tm-tournament-cards` now use shared semantic success/strong tokens for static titles, active tabs, link accents, and action states. Remaining hardcoded colors in those files are primarily structural backgrounds, gradients, or deliberately decorative surfaces rather than duplicated semantic text tokens.
- The latest follow-up pass tightened more static semantic styling in `tm-import-styles`, `tm-training-mod`, `tm-side-menu`, `tm-autocomplete`, `tm-native-feed`, and `tm-stats-styles`: sorted/active/import progress states, training saved/PRO badges and totals, side-menu hover text, autocomplete hover text, native-feed hover/link strong states, and remaining stats tab button emphasis now resolve through shared success/strong tokens. Remaining raw colors in those files are mostly structural fills, decorative gradients, or runtime/domain palettes.
- Another page-shell follow-up moved more title/link/badge strong states onto shared tokens across `tm-hero-card`, `tm-player-sidebar`, `home`, `forum`, `teamsters`, `bids`, `quickmatch`, `scouts-hire`, `scouts`, and `sponsors`, plus the remaining import heading tones in `tm-import-styles`. These files now rely more consistently on shared `text-strong`/`success`/`accent` tokens for static emphasis while still keeping local gradients and feature-owned palette logic where it is structural or runtime-driven.
- The newest follow-up cleaned another page/helper layer across `cup`, `finances`, `finances-maintenance`, `finances-wages`, `national-teams-rankings`, `national-teams`, `training`, `friendly-league`, `tm-scout-mod`, `tm-asi-calculator`, `tm-graphs-mod`, and the international-cup wrapper pages. Static strong link/title/value/status colors in those files now use shared semantic tokens; remaining local colors there are mainly chart lines, dot palettes, trophy/position colors, or other runtime/domain-specific visuals.
- Another final safe pass removed the remaining low-risk `text-strong`/`success` literals from `tm-standings-table`, `tm-international-cup-coefficients-page`, `national-teams`, `scouts`, `sponsors`, `quickmatch`, and the non-palette fallback in `youth-development`. At this point, most leftover literal colors in the repo are either the canonical theme token definitions themselves, deliberate runtime/domain palettes, or debug/console styling strings rather than unresolved static semantic UI chrome.
- A small follow-up aligned `tm-national-teams-nt-save` with the same shared theme semantics: its static title, status, progress, summary, and table text tones now resolve through `text-strong`, `text-main`, `text-muted`, and panel-label tokens instead of a feature-local literal text palette. Structural gradients, rgba surfaces, and tag intent colors remain local.
- Another safe follow-up tightened `tm-import-styles` and `tm-scout-mod`: remaining static table/header/body text, muted labels, dropzone/log/status copy, warning stars, and divider/border-adjacent semantic tones now resolve through shared text, warning, and embedded-border tokens. Structural surfaces, gradients, and runtime/domain-owned value palettes remain local.
- A further safe pass cleaned the remaining static semantic text tones in `bids`: warning price text plus shortlisted/grid header/grid body text now resolve through shared warning/main/faint/inverse tokens, while the status badge rgba fills and grid overlay borders remain local decorative structure for now.
- Began a staged `tm-match-styles` cleanup instead of a single risky sweep: the first two passes moved dialog/live/venue/report/stat-header plus advanced-stats/player-dialog/action-list strong/main/faint/panel-label and embedded-border cases onto shared theme tokens. Large gradients, tactic/pitch palettes, substitution/result highlight colors, and lower sections still remain local for follow-up passes.
- The next staged `tm-match-styles` pass finished the remaining low-risk text-token sweep in compact stats, lineups, unity feed, pitch tooltip, H2H/league labels, and analysis section labels: the base `text-strong`/`text-main`/`text-muted`/`text-panel-label`/`text-faint` plus embedded-border literals in those areas are now mapped to shared tokens. What remains there is primarily gradients, intent/result palettes, pitch/tactic fills, and other feature-owned runtime/decorative colors.
- A follow-up medium-risk `tm-match-styles` pass then mapped the obvious shared surface/border/fill cases as well: dialog/live shells, player-card borders, lineup separators, H2H/league neutral chrome, analysis/tactic neutral labels, and shared home-comparison gradients now use canonical theme tokens where the mapping was clear. At this point, the notable leftovers in that file are essentially venue-specific gauge gradients and other genuinely feature-owned result/pitch/tactic palettes rather than generic shared semantic chrome.
- A small follow-up cleaned the remaining `%c` debug-log color literals in `import`, `players`, `services/player`, `tm-import-sync`, `tm-playerdb`, and `tm-league-skill-table` without introducing new theme indirection there; debug paths can keep simple inline console colors while the actual UI cleanup stays focused on shared semantic chrome.
- Another low-risk page-shell pass moved more article/body and helper text tones onto shared tokens in `about-pro`, `donations`, `buy-pro`, `support-pro`, `teamsters`, and `user-guide`; those files now lean on shared `text-main`/`text-strong`/`text-panel-label` semantics for static copy while keeping their structural surfaces and decorative accents intact.
- A further low-risk pass extended that same static text cleanup into `cup`, `friendly-league`, `sponsors`, `national-teams-rankings`, and `quickmatch`: muted bylines, helper copy, note/meta labels, and neutral link-adjacent text now resolve through the shared text tiers, while feature-owned result states, gradients, and interaction-specific visuals remain local.
- Another low-risk follow-up covered `scouts-hire`, `scouts`, and `training`: descriptive copy, muted metadata, kicker labels, and neutral helper subtext now use the shared text tiers, while threshold colors, fire/danger actions, star fills, and other live feature-owned semantics remain local.
- Another low-risk pass extended the same cleanup into `national-teams`, `youth-development`, and the small `r5history` stats panel: subcopy, neutral table/body text, helper labels, and muted fallback copy now use shared text tiers, while position colors, revealed-threshold values, fixture-type chips, and other genuinely feature-owned semantics stay local.
- Another safe page-shell follow-up cleaned the remaining obvious neutral copy in `about-tm`, `free-pro`, `forum`, `finances-maintenance`, `finances-wages`, and one last `sponsors` offer block: article text, pager/meta helper copy, finance notes/table labels, and sponsor contract/expiry text now resolve through shared main/muted/faint/panel-label tokens, while gradients, button chrome, and feature-owned finance/sponsor visuals remain local.
- A small shared-primitives follow-up then finished the same neutral text-token cleanup in `tm-stat`, `tm-summary-strip`, `tm-checkbox`, and `tm-table`: base stat rows, summary labels/values, checkbox copy, and table header/body/hover/group-average text now consume canonical shared text tiers instead of repeating literal neutral colors.
- Another small shared-helper pass extended that same cleanup into `tm-match-row`, `tm-autocomplete`, `tm-standings-table`, and `tm-social-feed`: neutral team/list/table text, standings header/rank fallback tones, and social-feed composer/subtitle copy now use shared main/muted/faint/panel-label tokens, while live zone colors, result intents, and decorative feed accents stay local.
- Another low-risk mixed pass cleaned a few remaining neutral helper tones in `tm-native-feed`, `tm-fixture-match-row`, `tm-match-tooltip`, `finances`, and `home`: feed tabs/root textarea/action copy, fixture team text, tooltip MOM helper text, finance table labels, and home forum/previous-match links now resolve through shared text tiers while feature-owned live/result palettes remain local.
- Another compact shared-UI follow-up cleaned the remaining obvious neutral text literals in `tm-app-shell-pm`, `tm-chip`, `tm-modal`, and more of `tm-social-feed`: PM reply/thread copy, muted/default chip tones, modal base/message copy, and feed composer/comment helper text now use canonical shared text tiers instead of repeating local neutral colors.
- Another narrow helper sweep then cleaned the remaining obvious neutral text leftovers in `tm-native-feed`, `tm-side-menu`, `tm-match-row`, and `tm-tournament-cards`: button/option helper copy, side-menu default/subtitle text, match rating placeholders, and cup/tournament route/history helper text now resolve through shared panel-label/main/muted/faint tokens while live/result semantics stay local.
- Another very small helper pass cleaned the remaining obvious neutral copy in `forum`, `tm-notice`, `tm-match-tooltip`, and `tm-international-cup-coefficients-page`: topic jump links, shared notice body/footnotes, H2H tooltip meta/event helper text, and coefficients panel intro copy now consume shared main/faint/panel-label tokens instead of local neutral literals.
- The next low-risk component pass pushed the same neutral text cleanup into `tm-league-stats`, `tm-player-tooltip`, and another shared table slice in `tm-stats-styles`; static league table copy, tooltip body/note labels, and generic stats-table header/body helper text now use shared main/dim/faint/panel-label tiers, while threshold colors and other runtime value palettes remain local.
- Another narrow league-helper follow-up cleaned the remaining obvious neutral labels in `tm-league-standings` and `tm-league-picker`: standings tooltip/page-control helper text and the picker close control now resolve through shared panel-label/faint tokens instead of local neutral literals.
- Another small follow-up cleaned more neutral helper copy in `tm-graphs-mod`, `tm-league-totr`, and `tm-stats-styles`: graph legend text, TOTR club/helper hover text, and another slice of stats tab/group-label chrome now resolve through shared main/muted/dim/panel-label tokens while chart lines, pitch colors, and other feature-owned palettes remain local.
- With the tolerance widened to similar neutral greens as well, another follow-up aligned more helper/decorative copy in `tm-history-styles`, `tm-history-league`, `home`, and `tm-tooltip-stats`: history progress gradients now consume shared compare/accent tokens, month/date/team helper text and projected-season notes now use shared main/faint tiers, and home/forum helper labels plus tooltip stat text now resolve through shared main/muted/dim/panel-label tokens.
- Another similar-shade helper pass then extended that same cleanup into `tm-stats-styles` and the H2H section of `tm-match-styles`: match-list titles, VS/type badges, percentage/helper text, H2H season/date/attendance copy, and leading-team emphasis now map to shared main/dim/faint/panel-label/success tokens instead of near-duplicate local greens.
- Another small follow-up cleaned the remaining obvious success/draw-adjacent helper greens in `tm-match-styles`, `tm-history-styles`, and `tm-stats-styles`: H2H win borders, draw separators, division-one emphasis, league positive-delta cells, and one more stats helper label now resolve through shared success/dim/panel-label tokens instead of nearby feature-local literals.
- Another small import-shell follow-up moved the repeated static container/table/log border and surface literals in `tm-import-styles` onto shared `surface-*` and `border-*` tokens, and the import summary border now uses the shared success-border semantic token. The remaining raw colors there are primarily gradients, rgba overlays, and other structural fills rather than duplicated shared shell chrome.
- Another shared-primitive follow-up then aligned more shell chrome in `tm-modal`, `tm-progress`, and `tm-table`: modal borders/button fills, progress-bar base fills, and shared table header/body/total-row borders now resolve through canonical shared border/surface/accent tokens instead of repeated nearby green literals.
- Another narrow helper follow-up aligned a few more obvious shell-adjacent greens in `tm-player-tooltip`, `tm-social-feed`, and `tm-league-stats`: the player tooltip outer border, empty social-feed stars, and league-stats active button fill now resolve through shared success or embedded-border tokens instead of one-off local literals.
- Another small shell follow-up aligned more static border/surface chrome in `tm-stats-styles`, `tm-history-styles`, and `tm-league-standings`: stats tabs, history season/filter/table/progress shells, and the standings form tooltip now use shared surface-tab, soft/embedded/faint border, and card-surface tokens instead of repeated local greens.
- Another small dropdown/table-shell follow-up aligned more static chrome in `tm-autocomplete`, `tm-stats-styles`, and `tm-league-stats`: autocomplete dropdown shell, stats tactic dropdown/table borders, and league-stats transfer section dividers now resolve through shared card/panel surface plus soft/faint/embedded/input-overlay border tokens instead of repeated local green literals.
- Another small stats/shared-shell follow-up aligned more repeated chrome in `tm-stats-styles`, `tm-table`, and `tm-summary-strip`: stats filter/subtab/match-filter borders, total/group-divider lines, and the boxed summary-strip shell now resolve through shared compare/border/surface tokens instead of one-off local green literals.
- Another small standings/league-shell follow-up aligned more static wrapper chrome in `tm-standings-table`, `tm-league-picker`, and `tm-league-totr`: standings wrapper/table dividers, the league-picker dialog shell, and the TOTR nav divider now resolve through shared input/faint border and card-surface tokens instead of repeated local greens, while pitch and zone palettes remain local.
- Another small shared-shell follow-up aligned more repeated chrome in `tm-social-feed`, `tm-stat`, and `tm-standings-table`: social-feed avatar/button/dialog borders plus heading/meta text, the shared stat row divider, and standings table header/row shell surfaces now resolve through shared text, border, and surface tokens instead of nearby local green literals.
- Another small shared-wrapper follow-up aligned more card/table chrome in `tm-notice`, `tm-tournament-cards`, and `tm-international-cup-overview-page`: notice/tournament wrapper borders, icup table and match-list outlines, and a few neutral content text tones now resolve through shared border-contrast/input-overlay and text-strong tokens instead of one-off local green literals.
- Another small shared-list follow-up aligned more repeated row-shell chrome in `tm-match-row` and `tm-fixture-match-row`: list borders, row dividers, hover backgrounds, zebra surfaces, and the neutral upcoming-score tone now resolve through shared border/surface/text-dim tokens instead of nearby local green literals.
- Another small league-feed shell follow-up aligned a few remaining native-feed text and button-fill cases in `tm-league-styles`: feed timestamps, top-bar/placeholder text, and comment/menu/press action button fills now resolve through shared text-dim/panel-label and surface-tab-hover tokens instead of nearby local green literals.
- Another tiny shared-shell follow-up aligned a few final neutral cases in `tm-league-picker`, `tm-standings-table`, and `tm-match-row`: the picker disabled state, standings club-name text, and match-row score text/upcoming tone now resolve through shared surface-tab-active, text-strong, and text-dim tokens instead of nearby local literals.
- Another tiny shared-tooltip follow-up aligned more shell chrome in `tm-match-tooltip`: the H2H tooltip shell, header/mom dividers, and neutral team/score text now resolve through shared surface-card, success/input-overlay border, and text main/inverse tokens instead of nearby local green literals.
- Another small shared-primitive follow-up aligned a few more shell literals in `tm-autocomplete`, `tm-side-menu`, `tm-summary-strip`, and `tm-modal`: autocomplete item dividers/hover, side-menu wrapper and hover chrome, summary-strip base surface, and modal secondary button fills now resolve through shared surface-panel/tab-hover and soft/input-overlay border tokens instead of nearby local green literals.
- Another tiny shared-primitive follow-up aligned the remaining obvious chip and boxed-summary shell literals in `tm-chip` and `tm-summary-strip`: chip inverse text and overlay tone plus the boxed summary-item surface now resolve through shared inverse/surface-overlay/panel and input-overlay tokens instead of nearby local literals.
- Another tiny shared-feed follow-up aligned the last few obvious neutral text literals in `tm-social-feed`: the more-comments title, flag fallback, and likes-list name/meta text now resolve through shared text-strong and text-dim tokens instead of nearby local green literals.
- Another tiny shared-feed shell follow-up aligned a few remaining neutral hover/meta/button cases in `tm-social-feed`: feed meta text, like/comment/action hover text, and likes-close/load-more button fills now resolve through shared text-dim/text-strong and surface-tab-active/tab-hover tokens instead of nearby local green literals.
- Another tiny shared-surface follow-up aligned a few remaining neutral fill cases in `tm-social-feed` and `tm-side-menu`: feed side-logo/comment-logo/more-comments/likes-logo shells plus the shared feed action base fill and side-menu row surface now resolve through shared surface-panel and surface-tab-active tokens instead of nearby local green rgba fills.
- Another tiny shared-feed surface follow-up aligned the remaining like/comment pill shells in `tm-social-feed`: the base pill fills plus like/comment hover surfaces now resolve through shared surface-tab-active and surface-tab-hover tokens instead of nearby local rgba greens.
- Another tiny shared-wrapper follow-up aligned a few remaining button-like neutral fills in `tm-international-cup-overview-page`: stage buttons and result-pill links now resolve through shared surface-tab-active/tab-hover tokens instead of nearby local green rgba fills.
- Another tiny shared-feed button-state follow-up aligned more social-feed action/composer/load-more chrome: action hover, composer submit/hover, and load-more hover states now resolve through shared surface-tab-active/tab-hover and border-success tokens instead of nearby local rgba greens.
- Another tiny shared-shadow/overlay follow-up aligned one more low-risk shell pair in `tm-social-feed` and `tm-side-menu`: the social-feed secondary composer button base fill now uses shared surface-overlay, and the side-menu panel glow now uses the shared shadow-ring token instead of local literals.
- Another tiny shared-wrapper header follow-up aligned one more neutral shell case in `tm-international-cup-overview-page`: the shared table header background now uses surface-tab-active instead of a nearby local green rgba fill.
- Another tiny shared-feed hover-shell follow-up aligned the remaining low-risk dialog/list hover cases in `tm-social-feed`: the more-comments card and likes-list item hover background/border highlights now resolve through shared surface-tab-hover and border-success tokens instead of nearby local rgba literals.
- Another tiny shared-table shell follow-up aligned one more primitive-level neutral fill in `tm-table`: the grouped-header row background now uses surface-tab-active instead of a nearby local green rgba fill.
- Another tiny shared-feed emphasis follow-up aligned the remaining obvious link/helper greens in `tm-social-feed`: body links and the similar-post action now resolve through shared accent and text-strong tokens instead of nearby local green literals.
- Another tiny shared-notice shell follow-up aligned one more primitive-level muted surface in `tm-notice`: the muted notice background now uses surface-tab-active instead of a nearby local green rgba fill.
- Another tiny shared-wrapper border follow-up aligned a few more neutral shell overrides in `tm-international-cup-coefficients-page` and `tm-hero-card`: coefficients table-shell/group-header overrides and the hero-card outline now resolve through shared border-contrast and surface-overlay tokens instead of local white-alpha literals.
- A broader shared-shell follow-up then cleared another batch of neutral wrapper/list chrome across `tm-social-feed`, `tm-tournament-cards`, and `tm-international-cup-coefficients-page`: social-feed separators plus comment/more-comments/likes-item shells, tournament wrapper surfaces, and coefficients tab/table border separators now resolve through shared border-contrast, border-input-overlay, surface-overlay, and surface-tab-active tokens instead of local alpha literals.
- Another broader shared-chrome follow-up then cleared more coefficients and hero-card leftovers in one pass: coefficients tab base/active chrome, sort-indicator colors, and table-header/group-header text now resolve through shared surface, border, and text tokens, while the hero-card kicker/subtitle now use shared panel-label and text-strong tiers instead of nearby local literals.
- Another grouped success-emphasis follow-up then cleared a couple of remaining low-risk accent cases in `tm-international-cup-coefficients-page` and `tm-social-feed`: coefficients break-row separators and the social-feed like-heart icon now resolve through shared success/border-success tokens instead of nearby local green literals.
- Two larger inverse-text follow-ups then cleared another broad batch of obvious `#fff` text literals across shared/layout/page modules: app-shell nav/fab states, multiple match/replay/pitch labels, r5history headers and hover states, sponsor/finance/quickmatch totals, section-card/native-feed/fixture-round shells, league standings form chips, TOTR pitch labels, squad red-card markers, forum hover text, and the graphs tooltip now resolve through the shared `text-inverse` token instead of local white literals. Runtime graph line-color defaults were intentionally left local.
- Another broader strong/accent follow-up then cleared the next pair of repeated club/national-team text literals: `#eff8e8` now resolves to shared `text-strong` and `#d7efbf` to shared `accent` across `tm-club-overview`, `tm-club-fixtures-styles`, `tm-national-teams-nt-save`, `friendly-league`, `national-teams-rankings`, and `national-teams` wherever those values were acting as title/link/hover emphasis rather than decorative fills.
- Another smaller near-strong follow-up then cleared the remaining club/friendly-league variants in that family: `#d9edc8`, `#e6f4db`, and `#d7ebc9` now resolve through shared `text-strong`, while the club-overview expand toggle base label uses shared `accent` instead of another nearby local green literal.
- Another small helper-text follow-up then cleared the remaining nearby club/forum helper greens in that slice: `#88a773` and `#7a9e5e` now resolve through shared `text-muted`, while `#a9c996` and `#c8e4a4` now resolve through shared `text-main` in `tm-club-overview`, `tm-club-fixtures-styles`, and `forum`.
- A broader shared-shell follow-up then cleared another multi-file batch of repeated panel/border/shadow literals: `#1c3410`, `#28451d`, `#192a19`, and `#90b878`/nearby panel-label tones now resolve through shared `surface-panel`, `surface-card`, `border-soft`, `shadow-ring`, `text-panel-label`, and `text-main` tokens across `tm-tabs-mod`, `tm-league-totr`, `tm-club-overview`, `tm-club-fixtures-styles`, `tm-squad-table`, `tm-dbrepair-styles`, `tm-native-feed`, and `tm-fixture-round-cards`.
- Another low-risk helper-tone follow-up then cleared a final cluster of neutral copy/section literals: `tm-utils` fallback dim text, shortlist time labels, training and NT-save helper copy, finance wages table headers, and article-style section headings/copy in `buy-pro`, `donations`, `quickmatch`, `support-pro`, `teamsters`, and `user-guide` now resolve through shared `text-main`, `text-dim`, and `text-panel-label` tokens instead of nearby one-off green helpers.
- Another tiny helper/calendar follow-up then cleared the remaining obvious `#7fa669`-style label tones in `training`, `quickmatch`, and `tm-international-cup-overview-page`, while `home` calendar time/title/meta copy now resolves through shared `text-panel-label`, `text-main`, `text-dim`, and `text-faint` tokens instead of a last local neutral-green cluster.
- Another follow-up introduced a new shared `text-accent-soft` token where the repo had a real repeated gap between `text-main` and the stronger `accent`: soft hover/link emphasis in `home`, `forum`, `support-pro`, and `donations` now uses that shared tier, while nearby static title/body/button text in `home`, `forum`, and `buy-pro` was folded onto existing strong/main/muted tokens.
- Another small follow-up then introduced a shared warm-text trio for the remaining beige/market copy gap: `home` market calendar title/status/price/tag/coin tones now resolve through `text-warm-strong`, `text-warm-muted`, and `text-warm-accent`, while adjacent `home`, `forum`, and `cup` static greens/inline-color helpers were folded onto existing faint/dim/strong/info/warning/success tokens.
- Another low-risk shared-status follow-up then cleaned the remaining generic shell/status colors in `tm-dbinspect-styles` and the repeated zero/warn/rank text tones in `tm-stats-styles`: dbinspect now uses shared surface/border/text/warning/accent tokens for its neutral shell plus interp/preview states, and stats tables now route repeated zero/warn/gold/silver/bronze cases through shared text, warning, and metal tokens. The remaining literals in that stats slice are the deliberate position badge palettes.
- Another low-risk dev-tool/player-helper follow-up then cleaned the remaining static shell chrome in `tm-scout-mod` and `tm-dbrepair-styles`: scout table dividers, report headers, subtle pills, bar tracks, error boxes, best-wrap shells, and the post-send button state now use shared border/surface/fill/danger tokens, while dbrepair progress/log shells now use shared success-fill, embedded-border, card-surface, and border semantics. The only literal left in that scout slice is the online-dot glow, which stays local as a decorative effect rather than shared semantic chrome.
- Another low-risk import-shell follow-up then cleaned the remaining obvious static surface/warning/progress cases in `tm-import-styles`: the wrap header gradient start, expanded toolbar state, warning button border/text/hover fill, dropzone base/hover shell, parsed-table hover, progress wrap/fill, and import summary card now use existing shared surface/border/warning/success tokens. The only raw colors left there are decorative shadows rather than unresolved semantic chrome.
- Another low-risk neutral-shell follow-up then cleaned repeated sbar/filter/table/button chrome in `tm-training-mod`, `tm-history-styles`, and `tm-stats-styles`: training tabs, summary/filter bars, selects, table dividers, footer shell, saved/readonly badges, history season/filter shells plus row hovers, and stats dropdown/subtab/match-filter base/hover states now use shared surface/border/fill/danger/warning tokens. Remaining literals in those slices are primarily runtime colors, position palettes, or deliberately stronger active/emphasis effects.
- Another follow-up introduced a small shared translucent success-fill trio for repeated hover/current/selected emphasis states: `success-fill-soft`, `success-fill-hover`, and `success-fill-strong` now cover forum nav/pager current states, quickmatch hover/selected pills, national-teams chip and highlighted-row fills, the training button active state, and stats active/tag emphasis shells. The remaining literals in that family are the theme definitions themselves plus decorative glow/gradient cases rather than unresolved semantic state fills.

## Phase 7: Tables And Data Display

- [x] Define when a feature must use shared `TmTable` versus a custom layout.
- [x] Standardize table shell spacing, header styling, row density, empty state, and action column behavior.
- [x] Audit table-like custom layouts and move obvious candidates onto shared table primitives.

### TmTable Rules

- Use `TmTable` whenever the surface is still fundamentally rows and columns, even if cells contain rich feature-local markup, sorting, links, badges, or row-level actions.
- Stay on `TmTable` when the feature only needs custom tbody output, grouped headers, shadow-root CSS injection, row attributes, or feature-owned sort adapters; use `renderRowsHtml`, `groupHeaders`, `rowAttrs`, `sortDefs`, and local classes instead of rebuilding the shell.
- Keep orchestration outside the table: parsing, filters, tabs, export flows, tooltip hydration, expandable detail binding, progress state, and page-specific summaries should stay feature-local around a shared `TmTable` shell.
- Use a custom layout only when the UI is no longer semantically a table: card grids, timeline/event streams, fixture round cards, bracket/group composites, mixed media dashboards, or heavily nested/accordion structures where rows and columns are not the primary interaction model.
- If a custom table migration leaves old `<table>` selectors, alignment hooks, or attribute-based shell CSS behind, the migration is not complete until those selectors are removed or retargeted to the new `TmTable` markup.

### Current Phase 7 Notes

- `tm-league-skill-table` now mounts through shared `TmTable`, preserving league sort state in `TmLeagueCtx` while keeping runtime threshold colors local to REC/R5/Age cell rendering.
- `tm-national-teams-nt-save` results now mount through shared `TmTable`, with export flow unchanged and feature-local renderers still owning player/club links plus reason/source tag formatting.
- `tm-match-statistics` attacking-styles tables now mount through shared `TmTable` via custom row rendering, keeping expandable event rows and existing `rnd-adv-*` styling/binding intact.
- `tm-standings-table` now routes its existing `buildHtml/buildGroupedHtml` API through shared `TmTable`, so league, friendly-league, and international-cup standings consumers keep the same markup contract while dropping another local table engine.
- `tm-match-league` standings now mount through shared `TmTable`, while the fixture list, live tooltip, rank-change arrows, and local zone/highlight styling remain owned by the match module.
- `tm-club-overview` top-players table now mounts through shared `TmTable`, keeping the existing no-header card layout and local club styling while removing another isolated hand-built table shell.
- `finances-maintenance` stadium and maintenance cost tables now mount through shared `TmTable`, leaving page-level parsing, summary metrics, and period tabs untouched.
- `finances-wages` payroll ledger now mounts through shared `TmTable`, keeping player/staff tab orchestration and summary cards local; the follow-up pass also removed the old `data-align` CSS path left behind in `finances-maintenance` after its table migration.
- `finances` cashflow statement now mounts through shared `TmTable`, with the week/season tab flow and delta highlighting kept local; the follow-up pass rewired its table CSS from old `<th>` body selectors to the new `TmTable` cell structure so no dead finance selectors linger.
- `national-teams` squad card now mounts through shared `TmTable`, while tooltip hydration and card-level loading/error states stay local; existing width/alignment styling continues to hang off the squad wrapper instead of another hand-built table shell.
- `tm-stats-match-list` now mounts through shared `TmTable`, while local `tsa-ml-*` cell renderers still own club-logo layout, result-state coloring, and outbound match links; the follow-up pass moved the old inline home-team alignment into a live local helper class so no dead table-shell styling remained.
- `r5history` sync-issues diagnostics now mount through shared `TmTable`, while the overlay, filter flow, and local `tmrc-null/tmrc-ok` issue semantics stay in the feature; the follow-up pass retargeted issues-panel styling onto a dedicated table class so the old generic panel table selectors did not linger.
- `dbinspect` record and sync-preview tables now mount through shared `TmTable`, while per-player expand/sync/fetch flows and live-row injection still stay in the page; the migration kept the existing `dbi-rec-tbl` class so row-state styling and `tbody` hooks continued to work without another custom table shell.
- `tm-training-mod` teams allocation table now mounts through shared `TmTable` inside its shadow root, while dot controls, plus/minus actions, and pool-summary orchestration remain local; the follow-up pass added a shared `TmTable` CSS injector so table primitives can render correctly inside shadow UI instead of keeping one more manual table shell.
- Phase 7 now has an explicit decision rule: default to `TmTable` for any surface that is still row/column data, including rich cells and feature-owned sort/binding behavior; reserve custom layouts for true non-tabular composites like cards, timelines, fixture round decks, brackets, and similar structures where the table shell is not the primary interaction model.
- Shared `TmTable` now centralizes shell density, header/body spacing, built-in tbody empty states, and trailing action-column behavior in one place. `scouts-hire` already consumes the new built-in empty/action handling, so those shell decisions no longer need per-feature note-div or nowrap/action-column rewiring.
- The final Phase 7 audit found no remaining obvious hand-built table shells in `src/`; the remaining exceptions are intentional source-preservation wrappers like `national-teams-rankings`, features already standardized on `TmUI.table`, or genuinely non-tabular composites that do not fit the shared table shell.

## Phase 8: Page Cleanup Candidates

- [ ] Home: reduce page-level styling and extract remaining reusable section patterns.
- [ ] Player: keep layout local, but push reusable section structure into shared primitives.
- [x] Training: remove duplicated shared styling inside shadow UI.
- [x] League: verify custom feed shell and tabs rely only on shared primitives and shared theme.

### Current Phase 8 Notes

- `league` page composition already routes its controls through shared primitives (`TmButton`, `TmUI.button`, `TmUI.tabs`, shared state helpers, and shared feed wrappers). The follow-up pass on `tm-league-styles` removed the last local theme authority for the league feed shell by mapping its `--tsa-*` palette onto shared `--tmu-*` tokens, so the remaining league-local CSS is layout/decoration around shared primitives rather than a parallel page-owned theme.

## Phase 9: Rules Of Engagement

- [x] Add a short contributor guide for UI decisions.
- [x] Define what belongs in theme tokens.
- [x] Define what belongs in shared primitives.
- [x] Define what is allowed in feature-local CSS.
- [x] Define when inline style is acceptable.
- [x] Define when page-level CSS is acceptable.

### Contributor Guide

- Start with theme tokens and shared primitives before writing feature CSS. If the problem is already solved by `TmButton`, `TmTabs`, `TmTable`, `TmState`, `TmNotice`, `TmBadge`, `TmInput`, `TmSectionCard`, or `TmSummaryStrip`, reuse that primitive instead of cloning its structure.
- Reach for `TmUI` helpers only as a thin convenience layer over those primitives; do not treat `TmUI` as permission to invent a new shell or style contract per page.
- When a feature needs a new semantic state or repeated layout pattern, add it in shared UI first if at least two features can plausibly use it.
- Prefer deleting local CSS after a successful primitive migration; if old selectors still target removed markup, the migration is incomplete.

### What Belongs In Theme Tokens

- Semantic colors reused across primitives or features: surfaces, borders, text tiers, intent colors, shared fills, shadows, and transition-adjacent values.
- Stable spacing, radius, and shell-level values that multiple primitives need to agree on.
- Repeated neutral or semantic emphasis values, even when the old literals are only "close" rather than byte-identical, if they clearly represent the same UI meaning.
- Do not create theme tokens for one-off chart lines, club/position palettes, pitch/tactic colors, or feature-specific decorative gradients unless they become cross-feature semantics.

### What Belongs In Shared Primitives

- Structure and behavior that must stay consistent across the app: card shells, tab bars, buttons, table shells, standard notices, summary strips, and generic loading/empty/error/info states.
- Shared accessibility, density, active/hover/disabled behavior, and built-in empty/action-column handling.
- Shared primitive CSS may expose variants and slots; features choose those variants, but should not fork the primitive markup contract.

### What Is Allowed In Feature-Local CSS

- Feature-owned layout, composition, spacing, and wrappers around shared primitives.
- Domain-specific visuals: charts, tactical boards, fixture/result palettes, position colors, thresholds, tournament ornaments, and intentionally unique decorative gradients.
- Local selectors that target feature markup or feature-owned wrapper classes.
- Not allowed: redefining `.tmu-card`, `.tmu-btn`, `.tmu-tab`, `.tmu-tbl`, or other shared primitive internals from a page/component unless the primitive itself is being intentionally updated.

### When Inline Style Is Acceptable

- Runtime-calculated widths, percentages, transforms, chart colors, threshold-driven colors, image URLs, and similar values that are truly data-dependent.
- Temporary style values needed to preserve native TM markup integration when a class-based alternative would add more churn than value.
- Not acceptable for static semantic text, border, background, spacing, or radius values that can live in tokens, primitive variants, or feature-local classes.

### When Page-Level CSS Is Acceptable

- When a page is composing multiple shared primitives into a page-specific layout that is not yet captured by a shared layout pattern.
- When the CSS is clearly page-owned shell/layout code rather than a replacement design system.
- When the page needs to normalize or preserve native TM markup in a way that does not belong inside a shared primitive.
- If the same page-level pattern appears in multiple places, promote it to a shared layout/helper instead of copying it again.

### Current Phase 9 Notes

- This document now acts as the contributor-facing UI decision guide for the repo: theme-token scope, primitive boundaries, feature-local CSS limits, inline-style rules, and page-level CSS rules are explicitly defined here instead of remaining implicit across previous cleanup notes.
- The canonical primitive set is now documented against the current shared implementation (`TmRender`/`tm-card`, `TmSectionCard`, `TmButton`, `TmTabs`, `TmBadge`, `TmState`, `TmTable`, `TmInput`, `TmNotice`, `TmSummaryStrip`), which closes the biggest remaining ambiguity before continuing primitive-enforcement work.

## First Execution Order

1. Theme source consolidation.
2. Training shadow UI cleanup.
3. Primitive enforcement for buttons and tabs.
4. Shared layout patterns.
5. Static inline style cleanup in high-traffic components.

## High-Risk Areas

- `src/components/player/tm-training-mod.js`
- `src/layouts/app-shell.js`
- `src/components/shared/tm-ui.js`
- `src/pages/home.js`
- `src/components/player/tm-player-card.js`
- `src/components/player/tm-best-estimate.js`
