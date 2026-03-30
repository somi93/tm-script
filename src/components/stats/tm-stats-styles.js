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
                margin-bottom: 16px;
            }
            .tsa-card-host .tm-section-card-titlebar {
                padding: 14px 14px 0;
                margin-bottom: 8px;
            }
            .tsa-card-host .tm-section-card-title {
                color: var(--tmu-text-strong);
            }
            .tsa-meta {
                padding: 8px 14px 6px;
                border-bottom: 1px solid rgba(61,104,40,.5);
                text-align: center;
                background: rgba(22,46,14,.45);
            }
            .tsa-subtitle {
                font-size: 11px; color: var(--tmu-text-faint); letter-spacing: 0.5px;
            }
            .tsa-tabs {
                display: flex; background: var(--tmu-surface-tab-active);
                border-bottom: 1px solid var(--tmu-border-embedded);
            }
            .tsa-tab {
                flex: 1; padding: 8px 12px; text-align: center;
                font-size: 12px; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px; color: var(--tmu-text-panel-label); cursor: pointer;
                border-bottom: 2px solid transparent; transition: all 0.15s;
            }
            .tsa-tab:hover { color: var(--tmu-text-strong); background: var(--tmu-surface-tab-hover); }
            .tsa-tab.active { color: var(--tmu-text-strong); border-bottom-color: var(--tmu-success); background: var(--tmu-surface-tab-hover); }
            .tsa-body {
                padding: 10px 14px 16px; font-size: 13px;
                overflow-y: auto;
            }
            .tsa-progress {
                font-size: 11px; color: var(--tmu-text-dim); margin-top: 6px;
            }

            /* ── Filter buttons ── */
            .tsa-filters {
                display: flex; gap: 4px; justify-content: center;
                margin-bottom: 12px;
            }
            .tsa-filter-btn {
                background: rgba(42,74,28,.4); border: 1px solid var(--tmu-border-soft);
                border-radius: 6px; padding: 4px 14px;
                font-size: 11px; font-weight: 600; color: var(--tmu-text-muted);
                cursor: pointer; transition: all 0.15s;
                text-transform: uppercase; letter-spacing: 0.4px;
            }
            .tsa-filter-btn:hover { background: rgba(42,74,28,.7); color: var(--tmu-text-main); }
            .tsa-filter-btn.active {
                background: var(--tmu-compare-home-grad-start); border-color: var(--tmu-success);
                color: var(--tmu-text-strong); box-shadow: 0 0 8px rgba(108,192,64,.2);
            }

            /* ── Player sub-tab buttons ── */
            .tsa-subtabs {
                display: flex; gap: 4px; justify-content: center;
                margin-bottom: 12px;
            }
            .tsa-subtab-btn {
                background: rgba(42,74,28,.3); border: 1px solid var(--tmu-border-soft);
                border-radius: 8px; padding: 5px 18px;
                font-size: 11px; font-weight: 700; color: var(--tmu-text-panel-label);
                cursor: pointer; transition: all 0.15s;
                text-transform: uppercase; letter-spacing: 0.5px;
            }
            .tsa-subtab-btn:hover { background: rgba(42,74,28,.6); color: var(--tmu-text-strong); }
            .tsa-subtab-btn.active {
                background: rgba(74,144,48,.35); border-color: var(--tmu-success);
                color: var(--tmu-text-strong); box-shadow: 0 0 10px rgba(108,192,64,.15);
            }
            .tsa-pos-chip {
                vertical-align: middle;
            }
            .tsa-card-host .tsa-pos-chip.tm-pos-chip {
                min-width: 30px;
                font-size: 10px;
            }

            /* ── Match type filter ── */
            .tsa-match-filters {
                display: flex; gap: 4px; justify-content: center;
                margin-bottom: 10px; flex-wrap: wrap;
            }
            .tsa-mf-btn {
                background: rgba(42,74,28,.3); border: 1px solid var(--tmu-border-soft);
                border-radius: 12px; padding: 3px 10px;
                font-size: 10px; font-weight: 600; color: var(--tmu-text-faint);
                cursor: pointer; transition: all 0.15s;
                white-space: nowrap;
            }
            .tsa-mf-btn:hover { background: rgba(42,74,28,.6); color: var(--tmu-text-main); }
            .tsa-mf-btn.active {
                background: rgba(74,144,48,.3); border-color: var(--tmu-border-success);
                color: var(--tmu-text-main);
            }

            /* ── Tactic dropdown filters ── */
            .tsa-tactic-row {
                display: flex; align-items: center; gap: 6px;
                margin-bottom: 6px; flex-wrap: wrap; justify-content: center;
            }
            .tsa-tactic-row:last-child { margin-bottom: 10px; }
            .tsa-tr-label {
                font-size: 9px; font-weight: 700; color: var(--tmu-text-dim);
                text-transform: uppercase; letter-spacing: 0.6px;
                min-width: 28px;
            }
            .tsa-dd-wrap {
                position: relative; display: inline-block;
            }
            .tsa-dd-btn {
                background: rgba(42,74,28,.35); border: 1px solid var(--tmu-border-soft);
                border-radius: 6px; padding: 3px 8px;
                font-size: 10px; font-weight: 600; color: var(--tmu-text-muted);
                cursor: pointer; transition: all 0.15s;
                white-space: nowrap; display: flex; align-items: center; gap: 4px;
                user-select: none; min-width: 60px;
            }
            .tsa-dd-btn:hover { background: rgba(42,74,28,.6); color: var(--tmu-text-main); }
            .tsa-dd-btn.has-filter {
                background: rgba(74,144,48,.25); border-color: var(--tmu-border-success);
                color: var(--tmu-text-main);
            }
            .tsa-dd-btn .tsa-dd-arrow {
                font-size: 8px; opacity: 0.6; margin-left: auto;
            }
            .tsa-dd-btn .tsa-dd-icon {
                font-size: 11px; line-height: 1;
            }
            .tsa-dd-panel {
                display: none; position: absolute; top: calc(100% + 3px); left: 0;
                min-width: 160px; max-height: 240px; overflow-y: auto;
                background: var(--tmu-surface-panel); border: 1px solid var(--tmu-border-embedded);
                border-radius: 6px; box-shadow: 0 6px 20px rgba(0,0,0,.5);
                z-index: 100; padding: 4px 0;
            }
            .tsa-dd-panel.open { display: block; }
            .tsa-dd-panel.align-right { left: auto; right: 0; }
            .tsa-dd-opt {
                padding: 5px 10px; font-size: 10px; font-weight: 600;
                color: var(--tmu-text-muted); cursor: pointer; display: flex;
                align-items: center; gap: 6px; transition: background 0.1s;
                white-space: nowrap;
            }
            .tsa-dd-opt:hover { background: rgba(74,144,48,.2); color: var(--tmu-text-main); }
            .tsa-dd-opt .tsa-dd-check {
                width: 14px; height: 14px; border-radius: 3px;
                border: 1px solid var(--tmu-border-embedded); background: rgba(42,74,28,.3);
                display: flex; align-items: center; justify-content: center;
                font-size: 10px; color: var(--tmu-success); flex-shrink: 0;
            }
            .tsa-dd-opt.selected .tsa-dd-check {
                background: rgba(74,144,48,.4); border-color: var(--tmu-success);
            }
            .tsa-dd-opt .tsa-dd-cnt {
                font-size: 9px; opacity: 0.5; margin-left: auto;
            }
            .tsa-dd-opt.tsa-dd-all {
                border-bottom: 1px solid rgba(61,104,40,.4);
                margin-bottom: 2px; padding-bottom: 6px;
                color: var(--tmu-text-faint);
            }
            .tsa-dd-opt.tsa-dd-all.selected { color: var(--tmu-text-main); }
            .tsa-dd-tags {
                display: flex; gap: 2px; flex-wrap: wrap; max-width: 120px;
            }
            .tsa-dd-tag {
                background: rgba(74,144,48,.3); border-radius: 3px;
                padding: 0 4px; font-size: 9px; color: var(--tmu-text-main);
                line-height: 1.5;
            }

            /* ── Tables ── */
            .tsa-table {
                width: 100%; border-collapse: collapse; font-size: 11px;
            }
            .tsa-table th {
                padding: 6px 6px; font-size: 10px; font-weight: 700;
                color: var(--tmu-text-faint); text-transform: uppercase; letter-spacing: 0.4px;
                border-bottom: 1px solid var(--tmu-border-soft); text-align: center;
                cursor: pointer; user-select: none; white-space: nowrap;
                transition: color 0.15s;
            }
            .tsa-table th:hover { color: var(--tmu-text-main); }
            .tsa-table th.sorted-asc::after { content: ' ▲'; font-size: 8px; }
            .tsa-table th.sorted-desc::after { content: ' ▼'; font-size: 8px; }
            
            .tsa-table td {
                padding: 5px 6px; text-align: center;
                border-bottom: 1px solid var(--tmu-border-faint);
                font-variant-numeric: tabular-nums;
            }
            .tsa-table td:first-child {
                text-align: left; font-weight: 600; color: var(--tmu-text-main);
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 140px;
            }
            .tsa-table tr:hover { background: rgba(255,255,255,.03); }
            .tsa-table td.zero { color: #4a6a3a; }
            .tsa-table td.good { color: var(--tmu-success); font-weight: 700; }
            .tsa-table td.warn { color: #c87848; }
            .tsa-table td.top1 { color: #ffd700; font-weight: 800; text-shadow: 0 0 6px rgba(255,215,0,.3); }
            .tsa-table td.top2 { color: #c0c0c0; font-weight: 700; }
            .tsa-table td.top3 { color: #cd7f32; font-weight: 700; }
            .tsa-table tr.tsa-total-row td {
                font-weight: 800; border-top: 2px solid var(--tmu-border-embedded);
                color: var(--tmu-text-strong);
            }
            .tsa-table tr.tsa-total-row td:first-child { color: var(--tmu-text-muted); }

            /* ── Column group borders ── */
            .tsa-table th.col-group-start,
            .tsa-table td.col-group-start {
                border-left: 1px solid var(--tmu-border-embedded);
            }
            /* ── Column group header rows ── */
            .tsa-table tr.tsa-super-row th {
                font-size: 9px; padding: 2px 6px; color: var(--tmu-text-panel-label);
                text-transform: uppercase; letter-spacing: 0.6px;
                border-bottom: none; cursor: default;
                font-weight: 700;
            }
            .tsa-table tr.tsa-super-row th:hover { color: var(--tmu-text-panel-label); }
            .tsa-table tr.tsa-group-row th {
                font-size: 9px; padding: 2px 6px; color: var(--tmu-text-dim);
                text-transform: uppercase; letter-spacing: 0.6px;
                border-bottom: none; cursor: default;
                font-weight: 600;
            }
            .tsa-table tr.tsa-group-row th:hover { color: var(--tmu-text-dim); }

            /* ── Position badge ── */
            .tsa-pos {
                display: inline-block; font-size: 9px; font-weight: 700;
                padding: 1px 4px; border-radius: 3px; margin-right: 4px;
                text-transform: uppercase; letter-spacing: 0.3px;
                min-width: 22px; text-align: center;
            }
            .tsa-pos-gk { background: #8b6914; color: #ffd700; }
            .tsa-pos-def { background: #1a4a8a; color: #7ab8ff; }
            .tsa-pos-mid { background: #2a6a2a; color: var(--tmu-accent); }
            .tsa-pos-att { background: #8a2a2a; color: #ff7a7a; }

            /* ── Match filter W-D-L ── */
            .tsa-mf-wdl {
                font-size: 9px; margin-left: 3px; opacity: 0.7;
            }

            /* ── Team tab bar stats ── */
            .tsa-card-host .tmu-cstat.tsa-stat-compare {
                padding: 8px 0;
            }
            .tsa-stat-divider {
                height: 1px; margin: 0;
                background: linear-gradient(90deg, transparent, var(--tmu-border-embedded) 20%, var(--tmu-border-embedded) 80%, transparent);
            }

            /* ── Section titles ── */
            .tsa-section-title {
                text-align: center; font-size: 11px; font-weight: 700;
                color: var(--tmu-text-muted); text-transform: uppercase; letter-spacing: 1.2px;
                margin: 14px 0 8px; padding-top: 10px;
                border-top: 1px solid var(--tmu-border-embedded);
            }
            .tsa-section-title:first-child { border-top: none; margin-top: 0; }

            /* ── Adv-table span colors (TmUI-rendered) ── */
            .tsa-card-host .tmu-tbl span.adv-zero { color: #3a5a2a; }
            .tsa-card-host .tmu-tbl span.adv-goal { color: var(--tmu-success); font-weight: 700; }
            .tsa-card-host .tmu-tbl span.adv-shot { color: #c8d868; }
            .tsa-card-host .tmu-tbl span.adv-lost { color: #c87848; }
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
            .tsa-pct { color: var(--tmu-text-panel-label); font-size: 11px; font-style: italic; }

            /* ── Low minutes warning (per90 unreliable) ── */
            .tsa-low-mins td { opacity: 0.55; }
            .tsa-low-mins td:first-child { opacity: 1; }
            .tsa-low-mins .tsa-low-mins-icon {
                font-size: 9px; color: #c87848; margin-left: 3px;
                cursor: help;
            }

            /* ── Summary strip ── */
            .tsa-summary-strip {
                margin-bottom: 14px;
            }
            .tsa-summary-strip.tmu-summary-strip-boxed {
                gap: 8px;
                padding: 0;
                background: transparent;
                border: 0;
            }
            .tsa-summary-strip.tmu-summary-strip-boxed .tmu-summary-item {
                flex: 1 1 120px;
                min-width: 0;
            }

            /* ── Match List ── */
            .tsa-match-list { margin-top: 16px; }
            .tsa-match-list-title {
                font-size: 13px; font-weight: 700; color: var(--tmu-text-main); margin-bottom: 8px;
                border-bottom: 1px solid var(--tmu-border-soft); padding-bottom: 4px;
            }
            .tsa-ml-table {
                width: 100%; border-collapse: collapse; font-size: 12px;
            }
            .tsa-ml-table th {
                text-align: left; font-size: 10px; color: var(--tmu-text-faint); padding: 4px 6px;
                border-bottom: 1px solid #2a4a1a; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .tsa-ml-table td {
                padding: 5px 6px; border-bottom: 1px solid #1e3a12; color: var(--tmu-text-main);
                vertical-align: middle;
            }
            .tsa-ml-table tr:hover td { background: rgba(108,192,64,0.06); }
            .tsa-ml-team {
                display: inline-flex; align-items: center; gap: 5px;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 160px;
            }
            .tsa-ml-team-right {
                width: 100%;
                justify-content: flex-end;
            }
            .tsa-ml-logo {
                width: 18px; height: 18px; object-fit: contain;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,.3));
                flex-shrink: 0;
            }
            .tsa-ml-team-name {
                overflow: hidden; text-overflow: ellipsis; font-weight: 600;
            }
            .tsa-ml-team-name.is-us { color: var(--tmu-accent); }
            .tsa-ml-vs { color: var(--tmu-text-dim); font-size: 11px; padding: 0 4px; }
            .tsa-ml-result {
                font-weight: 700; font-size: 13px; letter-spacing: 1px;
            }
            .tsa-ml-result.win { color: var(--tmu-success); }
            .tsa-ml-result.draw { color: var(--tmu-warning); }
            .tsa-ml-result.loss { color: var(--tmu-danger); }
            .tsa-ml-type {
                font-size: 10px; color: var(--tmu-text-panel-label); background: rgba(108,192,64,0.08);
                padding: 1px 6px; border-radius: 3px; white-space: nowrap;
            }
            .tsa-ml-date { color: var(--tmu-text-faint); font-size: 11px; white-space: nowrap; }
            .tsa-ml-link {
                color: var(--tmu-success); text-decoration: none; font-size: 11px;
            }
            .tsa-ml-link:hover { color: var(--tmu-accent); text-decoration: underline; }

            .tsa-summary-card {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 8px;
                padding: 10px 6px; text-align: center;
            }
            .tsa-summary-val {
                font-size: 20px; font-weight: 800; color: var(--tmu-text-strong);
                line-height: 1.1;
            }
                margin-top: 14px; padding: 10px 14px;
                background: rgba(42,74,28,.25); border: 1px solid #2a4a1c;
                border-radius: 8px;
            }
            .tsa-legend-title {
                font-size: 10px; font-weight: 700; color: var(--tmu-text-faint);
                text-transform: uppercase; letter-spacing: 0.8px;
                margin-bottom: 8px;
            }
            .tsa-legend-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 6px 16px;
            }
            .tsa-legend-item {
                font-size: 10px; color: var(--tmu-text-muted); line-height: 1.4;
            }
            .tsa-legend-key {
                display: inline-block; font-weight: 700; color: var(--tmu-text-main);
                background: rgba(74,144,48,.2); border-radius: 3px;
                padding: 0 4px; margin-right: 4px; font-size: 9px;
                letter-spacing: 0.3px;
            }

            /* ── Cell color spans (used in TmUI tables) ── */
            .tsa-card-host .cell-zero  { color: #4a6a3a; }
            .tsa-card-host .cell-good  { color: var(--tmu-success); font-weight: 700; }
            .tsa-card-host .cell-warn  { color: #c87848; }
            .tsa-card-host .cell-top1  { color: #ffd700; font-weight: 800; text-shadow: 0 0 6px rgba(255,215,0,.3); }
            .tsa-card-host .cell-top2  { color: #c0c0c0; font-weight: 700; }
            .tsa-card-host .cell-top3  { color: #cd7f32; font-weight: 700; }
            .tsa-card-host .cell-yc    { color: #ffd700; font-weight: 700; }
            .tsa-card-host .cell-rc    { color: var(--tmu-danger); font-weight: 700; }

            /* ── TmUI table in stats wrap ── */
            .tsa-card-host .tmu-tbl { margin-bottom: 0; }
            .tsa-card-host .tmu-tbl tbody td:first-child { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
            .tsa-card-host .tmu-tbl thead th.col-group-start,
            .tsa-card-host .tmu-tbl tbody td.col-group-start,
            .tsa-card-host .tmu-tbl tfoot td.col-group-start { border-left: 1px solid #3d6828; }
            `;
            document.head.appendChild(style);
        },
    };

