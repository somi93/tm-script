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
            .tsa-card-host .tmu-card {
                margin-bottom: 0;
                border-color: #3d6828;
                box-shadow: none;
                color: #c8e0b4;
            }
            .tsa-card-host .tmu-card-body {
                padding: 0;
                gap: 0;
            }
            .tsa-card-host .tm-section-card-titlebar {
                padding: 14px 14px 0;
                margin-bottom: 8px;
            }
            .tsa-card-host .tm-section-card-title {
                color: #e8f5d8;
            }
            .tsa-meta {
                padding: 8px 14px 6px;
                border-bottom: 1px solid rgba(61,104,40,.5);
                text-align: center;
                background: rgba(22,46,14,.45);
            }
            .tsa-subtitle {
                font-size: 11px; color: #6a9a58; letter-spacing: 0.5px;
            }
            .tsa-tabs {
                display: flex; background: #274a18;
                border-bottom: 1px solid #3d6828;
            }
            .tsa-tab {
                flex: 1; padding: 8px 12px; text-align: center;
                font-size: 12px; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px; color: #90b878; cursor: pointer;
                border-bottom: 2px solid transparent; transition: all 0.15s;
            }
            .tsa-tab:hover { color: #c8e0b4; background: #305820; }
            .tsa-tab.active { color: #e8f5d8; border-bottom-color: #6cc040; background: #305820; }
            .tsa-body {
                padding: 10px 14px 16px; font-size: 13px;
                overflow-y: auto;
            }
            .tsa-progress {
                font-size: 11px; color: #5a7a48; margin-top: 6px;
            }

            /* ── Filter buttons ── */
            .tsa-filters {
                display: flex; gap: 4px; justify-content: center;
                margin-bottom: 12px;
            }
            .tsa-filter-btn {
                background: rgba(42,74,28,.4); border: 1px solid #2a4a1c;
                border-radius: 6px; padding: 4px 14px;
                font-size: 11px; font-weight: 600; color: #8aac72;
                cursor: pointer; transition: all 0.15s;
                text-transform: uppercase; letter-spacing: 0.4px;
            }
            .tsa-filter-btn:hover { background: rgba(42,74,28,.7); color: #c8e0b4; }
            .tsa-filter-btn.active {
                background: #4a9030; border-color: #6cc040;
                color: #e8f5d8; box-shadow: 0 0 8px rgba(108,192,64,.2);
            }

            /* ── Player sub-tab buttons ── */
            .tsa-subtabs {
                display: flex; gap: 4px; justify-content: center;
                margin-bottom: 12px;
            }
            .tsa-subtab-btn {
                background: rgba(42,74,28,.3); border: 1px solid #2a4a1c;
                border-radius: 8px; padding: 5px 18px;
                font-size: 11px; font-weight: 700; color: #7aaa60;
                cursor: pointer; transition: all 0.15s;
                text-transform: uppercase; letter-spacing: 0.5px;
            }
            .tsa-subtab-btn:hover { background: rgba(42,74,28,.6); color: #c8e0b4; }
            .tsa-subtab-btn.active {
                background: rgba(74,144,48,.35); border-color: #5aaa40;
                color: #e8f5d8; box-shadow: 0 0 10px rgba(108,192,64,.15);
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
                background: rgba(42,74,28,.3); border: 1px solid #2a4a1c;
                border-radius: 12px; padding: 3px 10px;
                font-size: 10px; font-weight: 600; color: #6a9a58;
                cursor: pointer; transition: all 0.15s;
                white-space: nowrap;
            }
            .tsa-mf-btn:hover { background: rgba(42,74,28,.6); color: #c8e0b4; }
            .tsa-mf-btn.active {
                background: rgba(74,144,48,.3); border-color: #4a9030;
                color: #c8e0b4;
            }

            /* ── Tactic dropdown filters ── */
            .tsa-tactic-row {
                display: flex; align-items: center; gap: 6px;
                margin-bottom: 6px; flex-wrap: wrap; justify-content: center;
            }
            .tsa-tactic-row:last-child { margin-bottom: 10px; }
            .tsa-tr-label {
                font-size: 9px; font-weight: 700; color: #5a8a48;
                text-transform: uppercase; letter-spacing: 0.6px;
                min-width: 28px;
            }
            .tsa-dd-wrap {
                position: relative; display: inline-block;
            }
            .tsa-dd-btn {
                background: rgba(42,74,28,.35); border: 1px solid #2a4a1c;
                border-radius: 6px; padding: 3px 8px;
                font-size: 10px; font-weight: 600; color: #8aac72;
                cursor: pointer; transition: all 0.15s;
                white-space: nowrap; display: flex; align-items: center; gap: 4px;
                user-select: none; min-width: 60px;
            }
            .tsa-dd-btn:hover { background: rgba(42,74,28,.6); color: #c8e0b4; }
            .tsa-dd-btn.has-filter {
                background: rgba(74,144,48,.25); border-color: #4a9030;
                color: #c8e0b4;
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
                background: #1a3210; border: 1px solid #3d6828;
                border-radius: 6px; box-shadow: 0 6px 20px rgba(0,0,0,.5);
                z-index: 100; padding: 4px 0;
            }
            .tsa-dd-panel.open { display: block; }
            .tsa-dd-panel.align-right { left: auto; right: 0; }
            .tsa-dd-opt {
                padding: 5px 10px; font-size: 10px; font-weight: 600;
                color: #8aac72; cursor: pointer; display: flex;
                align-items: center; gap: 6px; transition: background 0.1s;
                white-space: nowrap;
            }
            .tsa-dd-opt:hover { background: rgba(74,144,48,.2); color: #c8e0b4; }
            .tsa-dd-opt .tsa-dd-check {
                width: 14px; height: 14px; border-radius: 3px;
                border: 1px solid #3d6828; background: rgba(42,74,28,.3);
                display: flex; align-items: center; justify-content: center;
                font-size: 10px; color: #6cc040; flex-shrink: 0;
            }
            .tsa-dd-opt.selected .tsa-dd-check {
                background: rgba(74,144,48,.4); border-color: #6cc040;
            }
            .tsa-dd-opt .tsa-dd-cnt {
                font-size: 9px; opacity: 0.5; margin-left: auto;
            }
            .tsa-dd-opt.tsa-dd-all {
                border-bottom: 1px solid rgba(61,104,40,.4);
                margin-bottom: 2px; padding-bottom: 6px;
                color: #6a9a58;
            }
            .tsa-dd-opt.tsa-dd-all.selected { color: #c8e0b4; }
            .tsa-dd-tags {
                display: flex; gap: 2px; flex-wrap: wrap; max-width: 120px;
            }
            .tsa-dd-tag {
                background: rgba(74,144,48,.3); border-radius: 3px;
                padding: 0 4px; font-size: 9px; color: #c8e0b4;
                line-height: 1.5;
            }

            /* ── Tables ── */
            .tsa-table {
                width: 100%; border-collapse: collapse; font-size: 11px;
            }
            .tsa-table th {
                padding: 6px 6px; font-size: 10px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.4px;
                border-bottom: 1px solid #2a4a1c; text-align: center;
                cursor: pointer; user-select: none; white-space: nowrap;
                transition: color 0.15s;
            }
            .tsa-table th:hover { color: #c8e0b4; }
            .tsa-table th.sorted-asc::after { content: ' ▲'; font-size: 8px; }
            .tsa-table th.sorted-desc::after { content: ' ▼'; font-size: 8px; }
            
            .tsa-table td {
                padding: 5px 6px; text-align: center;
                border-bottom: 1px solid rgba(42,74,28,.4);
                font-variant-numeric: tabular-nums;
            }
            .tsa-table td:first-child {
                text-align: left; font-weight: 600; color: #c8e0b4;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 140px;
            }
            .tsa-table tr:hover { background: rgba(255,255,255,.03); }
            .tsa-table td.zero { color: #4a6a3a; }
            .tsa-table td.good { color: #80e048; font-weight: 700; }
            .tsa-table td.warn { color: #c87848; }
            .tsa-table td.top1 { color: #ffd700; font-weight: 800; text-shadow: 0 0 6px rgba(255,215,0,.3); }
            .tsa-table td.top2 { color: #c0c0c0; font-weight: 700; }
            .tsa-table td.top3 { color: #cd7f32; font-weight: 700; }
            .tsa-table tr.tsa-total-row td {
                font-weight: 800; border-top: 2px solid #3d6828;
                color: #e0f0cc;
            }
            .tsa-table tr.tsa-total-row td:first-child { color: #8aac72; }

            /* ── Column group borders ── */
            .tsa-table th.col-group-start,
            .tsa-table td.col-group-start {
                border-left: 1px solid #3d6828;
            }
            /* ── Column group header rows ── */
            .tsa-table tr.tsa-super-row th {
                font-size: 9px; padding: 2px 6px; color: #7ab85c;
                text-transform: uppercase; letter-spacing: 0.6px;
                border-bottom: none; cursor: default;
                font-weight: 700;
            }
            .tsa-table tr.tsa-super-row th:hover { color: #7ab85c; }
            .tsa-table tr.tsa-group-row th {
                font-size: 9px; padding: 2px 6px; color: #5a8a48;
                text-transform: uppercase; letter-spacing: 0.6px;
                border-bottom: none; cursor: default;
                font-weight: 600;
            }
            .tsa-table tr.tsa-group-row th:hover { color: #5a8a48; }

            /* ── Position badge ── */
            .tsa-pos {
                display: inline-block; font-size: 9px; font-weight: 700;
                padding: 1px 4px; border-radius: 3px; margin-right: 4px;
                text-transform: uppercase; letter-spacing: 0.3px;
                min-width: 22px; text-align: center;
            }
            .tsa-pos-gk { background: #8b6914; color: #ffd700; }
            .tsa-pos-def { background: #1a4a8a; color: #7ab8ff; }
            .tsa-pos-mid { background: #2a6a2a; color: #80e048; }
            .tsa-pos-att { background: #8a2a2a; color: #ff7a7a; }

            /* ── Match filter W-D-L ── */
            .tsa-mf-wdl {
                font-size: 9px; margin-left: 3px; opacity: 0.7;
            }

            /* ── Team tab bar stats ── */
            .tsa-stat-row {
                padding: 8px 0;
            }
            .tsa-stat-header {
                display: flex; align-items: baseline; justify-content: space-between;
                margin-bottom: 4px;
            }
            .tsa-stat-val {
                font-weight: 800; font-size: 14px; min-width: 30px;
                font-variant-numeric: tabular-nums;
            }
            .tsa-stat-val.for { text-align: left; color: #80e048; }
            .tsa-stat-val.against { text-align: right; color: #5ba8f0; }
            .tsa-stat-val.leading { font-size: 16px; }
            .tsa-stat-label {
                font-weight: 600; color: #8aac72; font-size: 11px;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .tsa-stat-bar-wrap {
                display: flex; height: 6px; border-radius: 3px;
                overflow: hidden; background: rgba(0,0,0,.18); gap: 2px;
            }
            .tsa-stat-seg {
                border-radius: 3px; transition: width 0.5s; min-width: 3px;
            }
            .tsa-stat-seg.for { background: linear-gradient(90deg, #4a9030, #6cc048); }
            .tsa-stat-seg.against { background: linear-gradient(90deg, #3a7ab8, #5b9bff); }
            .tsa-stat-divider {
                height: 1px; margin: 0;
                background: linear-gradient(90deg, transparent, #3d6828 20%, #3d6828 80%, transparent);
            }

            /* ── Section titles ── */
            .tsa-section-title {
                text-align: center; font-size: 11px; font-weight: 700;
                color: #8aac72; text-transform: uppercase; letter-spacing: 1.2px;
                margin: 14px 0 8px; padding-top: 10px;
                border-top: 1px solid #3d6828;
            }
            .tsa-section-title:first-child { border-top: none; margin-top: 0; }

            /* ── Adv-table span colors (TmUI-rendered) ── */
            .tsa-card-host .tmu-tbl span.adv-zero { color: #3a5a2a; }
            .tsa-card-host .tmu-tbl span.adv-goal { color: #80e048; font-weight: 700; }
            .tsa-card-host .tmu-tbl span.adv-shot { color: #c8d868; }
            .tsa-card-host .tmu-tbl span.adv-lost { color: #c87848; }
            .tsa-card-host .tmu-tbl tr.tsa-adv-total td {
                font-weight: 800; border-top: 1px solid #3d6828; color: #e0f0cc;
            }
            .tsa-card-host .tmu-tbl tr.tsa-adv-total td:first-child { color: #8aac72; }

            /* ── Rating colors ── */
            .tsa-rat { font-weight: 700; }

            /* ── Player name link ── */
            .tsa-plr-link {
                color: #c8e0b4; text-decoration: none; font-weight: 600;
                transition: color 0.15s;
            }
            .tsa-plr-link:hover { color: #80e048; text-decoration: underline; }

            /* ── Percentage cells ── */
            .tsa-pct { color: #8ab878; font-size: 11px; font-style: italic; }

            /* ── Low minutes warning (per90 unreliable) ── */
            .tsa-low-mins td { opacity: 0.55; }
            .tsa-low-mins td:first-child { opacity: 1; }
            .tsa-low-mins .tsa-low-mins-icon {
                font-size: 9px; color: #c87848; margin-left: 3px;
                cursor: help;
            }

            /* ── Summary cards ── */
            .tsa-summary-cards {
                display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;
                margin-bottom: 14px;
            }

            /* ── Match List ── */
            .tsa-match-list { margin-top: 16px; }
            .tsa-match-list-title {
                font-size: 13px; font-weight: 700; color: #a0cc80; margin-bottom: 8px;
                border-bottom: 1px solid #2a4a1a; padding-bottom: 4px;
            }
            .tsa-ml-table {
                width: 100%; border-collapse: collapse; font-size: 12px;
            }
            .tsa-ml-table th {
                text-align: left; font-size: 10px; color: #6a9a58; padding: 4px 6px;
                border-bottom: 1px solid #2a4a1a; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .tsa-ml-table td {
                padding: 5px 6px; border-bottom: 1px solid #1e3a12; color: #c8e0b4;
                vertical-align: middle;
            }
            .tsa-ml-table tr:hover td { background: rgba(108,192,64,0.06); }
            .tsa-ml-team {
                display: inline-flex; align-items: center; gap: 5px;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 160px;
            }
            .tsa-ml-logo {
                width: 18px; height: 18px; object-fit: contain;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,.3));
                flex-shrink: 0;
            }
            .tsa-ml-team-name {
                overflow: hidden; text-overflow: ellipsis; font-weight: 600;
            }
            .tsa-ml-team-name.is-us { color: #80e048; }
            .tsa-ml-vs { color: #5a8a48; font-size: 11px; padding: 0 4px; }
            .tsa-ml-result {
                font-weight: 700; font-size: 13px; letter-spacing: 1px;
            }
            .tsa-ml-result.win { color: #80e048; }
            .tsa-ml-result.draw { color: #bbcc00; }
            .tsa-ml-result.loss { color: #ee5533; }
            .tsa-ml-type {
                font-size: 10px; color: #7aaa60; background: rgba(108,192,64,0.08);
                padding: 1px 6px; border-radius: 3px; white-space: nowrap;
            }
            .tsa-ml-date { color: #6a9a58; font-size: 11px; white-space: nowrap; }
            .tsa-ml-link {
                color: #6cc040; text-decoration: none; font-size: 11px;
            }
            .tsa-ml-link:hover { color: #80e048; text-decoration: underline; }

            .tsa-summary-card {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 8px;
                padding: 10px 6px; text-align: center;
            }
            .tsa-summary-val {
                font-size: 20px; font-weight: 800; color: #e8f5d8;
                line-height: 1.1;
            }
            .tsa-summary-lbl {
                font-size: 9px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 0.4px; margin-top: 3px;
            }

            /* ── Scrollbar ── */
            .tsa-body::-webkit-scrollbar { width: 6px; }
            .tsa-body::-webkit-scrollbar-track { background: #162e0e; }
            .tsa-body::-webkit-scrollbar-thumb { background: #3d6828; border-radius: 3px; }
            .tsa-body::-webkit-scrollbar-thumb:hover { background: #4a9030; }

            /* ── Legend ── */
            .tsa-legend {
                margin-top: 14px; padding: 10px 14px;
                background: rgba(42,74,28,.25); border: 1px solid #2a4a1c;
                border-radius: 8px;
            }
            .tsa-legend-title {
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 0.8px;
                margin-bottom: 8px;
            }
            .tsa-legend-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 6px 16px;
            }
            .tsa-legend-item {
                font-size: 10px; color: #8aac72; line-height: 1.4;
            }
            .tsa-legend-key {
                display: inline-block; font-weight: 700; color: #c8e0b4;
                background: rgba(74,144,48,.2); border-radius: 3px;
                padding: 0 4px; margin-right: 4px; font-size: 9px;
                letter-spacing: 0.3px;
            }

            /* ── Cell color spans (used in TmUI tables) ── */
            .tsa-card-host .cell-zero  { color: #4a6a3a; }
            .tsa-card-host .cell-good  { color: #80e048; font-weight: 700; }
            .tsa-card-host .cell-warn  { color: #c87848; }
            .tsa-card-host .cell-top1  { color: #ffd700; font-weight: 800; text-shadow: 0 0 6px rgba(255,215,0,.3); }
            .tsa-card-host .cell-top2  { color: #c0c0c0; font-weight: 700; }
            .tsa-card-host .cell-top3  { color: #cd7f32; font-weight: 700; }
            .tsa-card-host .cell-yc    { color: #ffd700; font-weight: 700; }
            .tsa-card-host .cell-rc    { color: #ff4444; font-weight: 700; }

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

