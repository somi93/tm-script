import { TmUI } from '../shared/tm-ui.js';

export const TmStatsStyles = {
        inject() {
            if (document.getElementById('tsa-stats-style')) return;
            const style = document.createElement('style');
            style.id = 'tsa-stats-style';
            style.textContent = `
            .column2_a,
            .tmvu-club-main {
                width: 1100px !important;
            }
            .tmvu-club-main.tmvu-stats-pending,
            .column2_a.tmvu-stats-pending {
                visibility: hidden;
            }
            .tsa-card-host {
                margin-bottom: var(--tmu-space-lg);
            }
            .tsa-card-host .tmu-card {
                border: none;
            }
            .tsa-card-host .tm-section-card-titlebar {
                padding: var(--tmu-space-md) var(--tmu-space-md) 0;
                margin-bottom: var(--tmu-space-sm);
            }
            .tsa-card-host .tm-section-card-title {
                color: var(--tmu-text-strong);
            }
            .tsa-meta {
                padding: var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-sm);
                border-bottom: 1px solid var(--tmu-border-faint);
                text-align: center;
                background: var(--tmu-surface-dark-strong);
            }
            .tsa-subtitle {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-faint); letter-spacing: 0.5px;
            }
            .tsa-tabs {
                display: flex;
            }
            .tsa-tabs .tmu-tabs {
                width: 100%;
                border-left: 0;
                border-right: 0;
                border-top: 0;
                background: var(--tmu-surface-tab-active);
                border-bottom-color: var(--tmu-border-embedded);
            }
            .tsa-tabs .tmu-tab:hover { background: var(--tmu-surface-tab-hover); }
            .tsa-tabs .tmu-tab.active { background: var(--tmu-surface-tab-hover); }
            .tsa-body {
                padding: var(--tmu-space-md) var(--tmu-space-md) var(--tmu-space-lg); font-size: var(--tmu-font-sm);
                overflow-y: auto;
            }
            .tsa-progress {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-dim); margin-top: var(--tmu-space-sm);
            }

            /* ── Filter buttons ── */
            .tsa-filters {
                display: flex; gap: var(--tmu-space-xs); justify-content: center;
                margin-bottom: var(--tmu-space-md);
            }

            /* ── Player sub-tab buttons ── */
            .tsa-subtabs {
                margin-bottom: 0;
            }
            .tsa-subtabs .tmu-tabs {
                border-left: 0;
                border-right: 0;
                border-top: 0;
                border-bottom-color: var(--tmu-border-embedded);
            }
            .tsa-subtabs .tmu-tab {
                font-size: var(--tmu-font-xs);
                font-weight: 700;
            }
            .tsa-pos-chip {
                vertical-align: middle;
            }
            .tsa-card-host .tsa-pos-chip.tm-pos-chip {
                min-width: 30px;
                font-size: var(--tmu-font-xs);
            }

            /* ── Match type filter ── */
            .tsa-match-filters {
                display: flex;
                justify-content: center;
                gap: var(--tmu-space-xs);
                margin-bottom: var(--tmu-space-md);
                flex-wrap: wrap;
            }
            .tsa-match-filters .tmu-btn { white-space: nowrap; }
            .tsa-mf-wdl { font-weight: 400; opacity: 0.7; font-size: var(--tmu-font-2xs); }

            /* ── Tactic dropdown filters ── */
            .tsa-tactic-row {
                display: flex; align-items: center; gap: var(--tmu-space-sm);
                margin-bottom: var(--tmu-space-sm); flex-wrap: wrap; justify-content: center;
            }
            .tsa-tactic-row:last-child { margin-bottom: var(--tmu-space-md); }
            .tsa-tr-label {
                font-size: var(--tmu-font-2xs); font-weight: 700; color: var(--tmu-text-dim);
                text-transform: uppercase; letter-spacing: 0.6px;
                min-width: 28px;
            }
            .tsa-dd-wrap {
                position: relative; display: inline-block;
            }
            .tsa-dd-btn {
                background: var(--tmu-surface-tab-active); border: 1px solid var(--tmu-border-soft);
                border-radius: var(--tmu-space-sm); padding: var(--tmu-space-xs) var(--tmu-space-sm);
                font-size: var(--tmu-font-xs); font-weight: 600; color: var(--tmu-text-muted);
                cursor: pointer; transition: all 0.15s;
                white-space: nowrap; display: flex; align-items: center; gap: var(--tmu-space-xs);
                user-select: none; min-width: 60px;
            }
            .tsa-dd-btn:hover { background: var(--tmu-surface-tab-hover); color: var(--tmu-text-main); }
            .tsa-dd-btn.has-filter {
                background: var(--tmu-success-fill-soft); border-color: var(--tmu-border-success);
                color: var(--tmu-text-main);
            }
            .tsa-dd-btn .tsa-dd-arrow {
                font-size: var(--tmu-font-2xs); opacity: 0.6; margin-left: auto;
            }
            .tsa-dd-btn .tsa-dd-icon {
                font-size: var(--tmu-font-xs); line-height: 1;
            }
            .tsa-dd-panel {
                display: none; position: absolute; top: calc(100% + var(--tmu-space-xs)); left: 0;
                min-width: 160px; max-height: 240px; overflow-y: auto;
                background: var(--tmu-surface-panel); border: 1px solid var(--tmu-border-embedded);
                border-radius: var(--tmu-space-sm); box-shadow: 0 6px 20px var(--tmu-shadow-panel);
                z-index: 100; padding: var(--tmu-space-xs) 0;
            }
            .tsa-dd-panel.open { display: block; }
            .tsa-dd-panel.align-right { left: auto; right: 0; }
            .tsa-dd-opt {
                padding: var(--tmu-space-xs) var(--tmu-space-md); font-size: var(--tmu-font-xs); font-weight: 600;
                color: var(--tmu-text-muted); cursor: pointer; display: flex;
                align-items: center; gap: var(--tmu-space-sm); transition: background 0.1s;
                white-space: nowrap;
            }
            .tsa-dd-opt:hover { background: var(--tmu-success-fill-soft); color: var(--tmu-text-main); }
            .tsa-dd-opt .tsa-dd-check {
                width: 14px; height: 14px; border-radius: var(--tmu-space-xs);
                border: 1px solid var(--tmu-border-embedded); background: var(--tmu-surface-accent-soft);
                display: flex; align-items: center; justify-content: center;
                font-size: var(--tmu-font-xs); color: var(--tmu-success); flex-shrink: 0;
            }
            .tsa-dd-opt.selected .tsa-dd-check {
                background: var(--tmu-success-fill-strong); border-color: var(--tmu-success);
            }
            .tsa-dd-opt .tsa-dd-cnt {
                font-size: var(--tmu-font-2xs); opacity: 0.5; margin-left: auto;
            }
            .tsa-dd-opt.tsa-dd-all {
                border-bottom: 1px solid var(--tmu-border-soft-alpha-strong);
                margin-bottom: 0; padding-bottom: var(--tmu-space-sm);
                color: var(--tmu-text-faint);
            }
            .tsa-dd-opt.tsa-dd-all.selected { color: var(--tmu-text-main); }
            .tsa-dd-tags {
                display: flex; gap: 0; flex-wrap: wrap; max-width: 120px;
            }
            .tsa-dd-tag {
                background: var(--tmu-success-fill-strong); border-radius: var(--tmu-space-xs);
                padding: 0 var(--tmu-space-xs); font-size: var(--tmu-font-2xs); color: var(--tmu-text-main);
                line-height: 1.5;
            }

            /* ── Tables ── */
            .tsa-table {
                width: 100%; border-collapse: collapse; font-size: var(--tmu-font-xs);
            }
            .tsa-table th {
                padding: var(--tmu-space-sm); font-size: var(--tmu-font-xs); font-weight: 700;
                color: var(--tmu-text-faint); text-transform: uppercase; letter-spacing: 0.4px;
                border-bottom: 1px solid var(--tmu-border-soft); text-align: center;
                cursor: pointer; user-select: none; white-space: nowrap;
                transition: color 0.15s;
            }
            .tsa-table th:hover { color: var(--tmu-text-main); }
            
            .tsa-table td {
                padding: var(--tmu-space-xs) var(--tmu-space-sm); text-align: center;
                border-bottom: 1px solid var(--tmu-border-faint);
                font-variant-numeric: tabular-nums;
            }
            .tsa-table td:first-child {
                text-align: left; font-weight: 600; color: var(--tmu-text-main);
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 140px;
            }
            .tsa-table tr:hover { background: var(--tmu-border-contrast); }

            /* ── Match filter W-D-L ── */
            .tsa-mf-wdl {
                font-size: var(--tmu-font-2xs); margin-left: var(--tmu-space-xs); opacity: 0.7;
            }

            /* ── Team tab bar stats ── */
            .tsa-card-host .tmu-cstat.tsa-stat-compare {
                padding: var(--tmu-space-sm) 0;
            }

            /* ── Section titles ── */
            .tsa-section-title {
                text-align: center; font-size: var(--tmu-font-xs); font-weight: 700;
                color: var(--tmu-text-muted); text-transform: uppercase; letter-spacing: 1.2px;
                margin: var(--tmu-space-md) 0 var(--tmu-space-sm); padding-top: var(--tmu-space-md);
                border-top: 1px solid var(--tmu-border-embedded);
            }
            .tsa-section-title:first-child { border-top: none; margin-top: 0; }

            /* ── Adv-table span colors (TmUI-rendered) ── */
            .tsa-card-host .tmu-tbl span.adv-zero { color: var(--tmu-text-disabled-strong); }
            .tsa-card-host .tmu-tbl span.adv-goal { color: var(--tmu-success); font-weight: 700; }
            .tsa-card-host .tmu-tbl span.adv-shot { color: var(--tmu-text-highlight); }
            .tsa-card-host .tmu-tbl span.adv-lost { color: var(--tmu-warning-soft); }
            .tsa-card-host .tmu-tbl tr.tsa-adv-total td {
                font-weight: 800; border-top: 1px solid var(--tmu-border-embedded); color: var(--tmu-text-strong);
            }
            .tsa-card-host .tmu-tbl tr.tsa-adv-total td:first-child { color: var(--tmu-text-muted); }

            /* ── Rating colors ── */
            .tsa-rat { font-weight: 700; }

            /* ── Player name link ── */
            .tsa-plr-link {
                color: var(--tmu-text-main); text-decoration: none; font-weight: 600;
                transition: color 0.15s;
            }
            .tsa-plr-link:hover { color: var(--tmu-accent); text-decoration: underline; }

            /* ── Percentage cells ── */
            .tsa-pct { color: var(--tmu-text-panel-label); font-size: var(--tmu-font-xs); font-style: italic; }

            /* ── Low minutes warning (per90 unreliable) ── */
            .tsa-low-mins td { opacity: 0.55; }
            .tsa-low-mins td:first-child { opacity: 1; }
            .tsa-low-mins .tsa-low-mins-icon {
                font-size: var(--tmu-font-2xs); color: var(--tmu-warning-soft); margin-left: var(--tmu-space-xs);
                cursor: help;
            }

            /* ── Summary strip ── */
            .tsa-summary-strip {
                margin-bottom: var(--tmu-space-md);
            }
            .tsa-summary-strip.tmu-summary-strip-boxed {
                gap: var(--tmu-space-sm);
                padding: 0;
                background: transparent;
                border: 0;
            }
            .tsa-summary-strip.tmu-summary-strip-boxed .tmu-summary-item {
                flex: 1 1 120px;
                min-width: 0;
            }

            /* ── Match List ── */
                .tsa-match-list { margin-top: var(--tmu-space-lg); }
            .tsa-match-list-title {
                font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-main); margin-bottom: var(--tmu-space-sm);
                border-bottom: 1px solid var(--tmu-border-soft); padding-bottom: var(--tmu-space-xs);
            }
            .tsa-ml-table {
                width: 100%; border-collapse: collapse; font-size: var(--tmu-font-sm);
            }
            .tsa-ml-table th {
                text-align: left; font-size: var(--tmu-font-xs); color: var(--tmu-text-faint); padding: var(--tmu-space-xs) var(--tmu-space-sm);
                border-bottom: 1px solid var(--tmu-border-soft); font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .tsa-ml-table td {
                padding: var(--tmu-space-xs) var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-faint); color: var(--tmu-text-main);
                vertical-align: middle;
            }
            .tsa-ml-table tr:hover td { background: var(--tmu-compare-fill); }
            .tsa-ml-team {
                display: inline-flex; align-items: center; gap: var(--tmu-space-xs);
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 160px;
            }
            .tsa-ml-team-right {
                width: 100%;
                justify-content: flex-end;
            }
            .tsa-ml-logo {
                width: 18px; height: 18px; object-fit: contain;
                filter: drop-shadow(0 1px 2px var(--tmu-surface-overlay));
                flex-shrink: 0;
            }
            .tsa-ml-team-name {
                overflow: hidden; text-overflow: ellipsis; font-weight: 600;
            }
            .tsa-ml-team-name.is-us { color: var(--tmu-accent); }
            .tsa-ml-vs { color: var(--tmu-text-dim); font-size: var(--tmu-font-xs); padding: 0 var(--tmu-space-xs); }
            .tsa-ml-result {
                font-weight: 700; font-size: var(--tmu-font-sm); letter-spacing: 1px;
            }
            .tsa-ml-result.win { color: var(--tmu-success); }
            .tsa-ml-result.draw { color: var(--tmu-warning); }
            .tsa-ml-result.loss { color: var(--tmu-danger); }
            .tsa-ml-type {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-panel-label); background: var(--tmu-success-fill-faint);
                padding: 0 var(--tmu-space-sm); border-radius: var(--tmu-space-xs); white-space: nowrap;
            }
            .tsa-ml-date { color: var(--tmu-text-faint); font-size: var(--tmu-font-xs); white-space: nowrap; }
            .tsa-ml-link {
                color: var(--tmu-success); text-decoration: none; font-size: var(--tmu-font-xs);
            }
            .tsa-ml-link:hover { color: var(--tmu-accent); text-decoration: underline; }

            /* ── Cell color spans (used in TmUI tables) ── */
            .tsa-card-host .cell-zero  { color: var(--tmu-text-dim); }
            .tsa-card-host .cell-warn  { color: var(--tmu-warning-soft); }
            .tsa-card-host .cell-yc    { color: var(--tmu-metal-gold); font-weight: 700; }
            .tsa-card-host .cell-rc    { color: var(--tmu-danger); font-weight: 700; }

            /* ── TmUI table in stats wrap ── */
            .tsa-card-host .tmu-tbl { margin-bottom: 0; }
            .tsa-card-host .tmu-tbl tbody td:first-child { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
            `;
            document.head.appendChild(style);
        },
    };

