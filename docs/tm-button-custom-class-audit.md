# TM Button Custom Class Audit

Date: 2026-03-20

Scope:
- reviewed shared button usage created through `TmUI.button(...)` and `TmButton.button(...)`
- checked whether each custom button class is still needed after moving to shared primitives
- decision rule: keep only classes that carry meaningful state, structured button geometry, or a broad reusable styling contract

## Removed

### `tmsl-loadbtn`
- Decision: removed
- Why: it only forced `margin-left:auto` and `white-space:nowrap`
- How: styling now targets the header action slot contextually instead of branding the button itself

### `tmsl-page-btn`
- Decision: removed
- Why: it only forced `white-space:nowrap` on pagination buttons
- How: styling now targets `.tmsl-pagination .tmu-btn`

### `tmvu-yd-action-btn`
- Decision: removed
- Why: it only normalized inline-flex alignment and icon sizing for youth action buttons
- How: styling now targets shared buttons inside `.tmvu-yd-bulk-actions` and `.tmvu-yd-actions-row`

### `tmvu-qm-friendly-send`
- Decision: removed
- Why: it only set a fixed minimum width and centered content for one contextual action
- How: styling now targets the shared button inside `.tmvu-qm-friendly-selected`

### `tsa-ld-close`
- Decision: removed
- Why: the dialog close button already had a stable ID, so the class was a redundant styling hook
- How: CSS now targets `#tsa-ld-close`

### `tsa-ld-go`
- Decision: removed
- Why: the dialog submit button already had a stable ID, so the class added no semantic value
- How: CSS now targets `#tsa-ld-go`

### `tsa-ssn-chev-btn`
- Decision: removed
- Why: both season chevrons already had stable IDs and the class only carried tiny geometry tweaks
- How: CSS now targets `#tsa-ssn-prev` and `#tsa-ssn-next`

### `tsa-history-live-btn`
- Decision: removed
- Why: both history banners already expose dedicated IDs for their back-to-live buttons
- How: CSS now targets `#tsa-history-live-btn` and `#tsa-fix-history-live-btn`

### `rnd-nav-btn`
- Decision: removed
- Why: it only sized the icon buttons in the round navigator
- How: styling now scopes directly to shared buttons inside `.tmvu-round-panel .tmu-card-head.rnd-nav`

### `tmrc-close`
- Decision: removed
- Why: the modal close button already had a stable ID and the class only restyled that one element
- How: CSS now targets `#tmrc-close`

### `tmrc-btn`
- Decision: removed
- Why: the launch button was a single known control with no reusable contract
- How: the button now has `#tmrc-launch-btn` and the spacing rule follows that ID

### `tms-reload-btn`
- Decision: removed
- Why: it had become a mixed styling and JS hook class for the transfer reload action
- How: markup, CSS, and delegated events now use `[data-transfer-reload]`, while `tms-reloading` remains the transient state class

### `tsa-std-ctrl-btn`
- Decision: removed
- Why: it only provided a shared `line-height` rule for standings filter buttons
- How: CSS now targets the existing `data-std-venue` and `data-std-n` hooks directly

## Kept

### `tsa-std-ctrl-active`
- Decision: kept
- Why: this is a real state class, not a cosmetic wrapper; it marks the active standings control independently of which filter group produced it
- How: leave it until the control helper is rewritten to encode active state entirely through attributes or shared button variants

### `tsa-stat-mode-btn`
- Decision: kept
- Why: league stats buttons are still a full styling cluster with multiple visual roles and active-state combinations
- How: worth revisiting only as a larger refactor of the whole stats toolbar

### `tsa-stat-btn`
- Decision: kept
- Why: same cluster as above; removal would force broader selector and state rewrites across stats controls
- How: defer until stats controls are redesigned around attributes or shared variants

### `tsa-stat-team-btn`
- Decision: kept
- Why: tied to the same stats-specific control system rather than a trivial one-off rule
- How: keep with the rest of the league stats control cluster

### `tsa-stat-btn-active`
- Decision: kept
- Why: this is an explicit active-state marker for the league stats cluster
- How: only remove it together with a full state-model rewrite for that toolbar

### `tmh-btn`
- Decision: kept
- Why: history modules still use a local button treatment as a cluster, not a one-line tweak
- How: revisit only when both history screens are normalized together

### `tmh-arrow`
- Decision: kept
- Why: arrow buttons carry dedicated geometry within the history navigation pattern
- How: safe removal would require restructuring the history nav controls, not a one-line cleanup

### `rnd-live-filter-btn`
- Decision: kept
- Why: match live filters still use a dedicated control system with custom grouping and state styling
- How: remove only as part of a broader refactor of the live header controls

### `live-btn`
- Decision: kept
- Why: this is part of the same match-header control cluster and is not just a trivial nowrap helper
- How: keep until the whole live button group is migrated to attributes/shared variants

### `rnd-live-btn`
- Decision: kept
- Why: same reason as above; it is part of a broader match live control language
- How: treat it together with the other live header classes

### `rnd-dlg-close`
- Decision: kept
- Why: dialog close styling in the match module is still coupled to that module's local modal treatment
- How: only worth removing when the match dialogs share a common close-button pattern

### `rnd-plr-close`
- Decision: kept
- Why: player dialog close styling is still isolated and module-specific
- How: leave it until the dialog itself is normalized to shared modal/button rules

### `tmt-btn`
- Decision: kept
- Why: training mod buttons still behave as a custom grouped control set
- How: should be handled as a dedicated refactor, not piecemeal

### `tmt-minus`
- Decision: kept
- Why: minus button geometry and meaning are tied to training controls, not just surface styling
- How: keep with the full training control cluster

### `tmt-plus`
- Decision: kept
- Why: plus button geometry and meaning are tied to training controls, not just surface styling
- How: keep with the full training control cluster

### `tmt-act`
- Decision: kept
- Why: this is a role/stateful training control, not a trivial button wrapper
- How: remove only if training controls are rewritten around clearer data/state hooks

### `dng`
- Decision: kept for now
- Why: it is still used as a semantic danger modifier inside the training button cluster
- How: could later be replaced with a shared tone prop if that module is refactored

### `text-lg px-3 py-0`
- Decision: kept for now
- Why: this is utility-style usage, not a single local CSS class, and removing it cleanly means normalizing the TOTR button sizing approach
- How: revisit only if TOTR controls are brought under a stricter shared-button sizing convention

### `tmu-modal-btn` / `tmu-modal-btn-${style}`
- Decision: kept
- Why: this is part of the shared modal primitive contract, not an accidental local class
- How: treat it as framework-level shared UI, not as page-level custom clutter

## Short Take

High-confidence trivial button classes are now removed where there was already a better hook: ID, data attribute, or container context.

The main remaining custom button classes are not the cheap ones anymore. What is left is mostly:
- active-state markers
- grouped control systems
- module-specific geometry for icons/dialog controls
- shared primitive internals