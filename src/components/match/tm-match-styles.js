// tm-match-styles.js - Match dialog CSS injection for TM Match Viewer
// Depends on: nothing
// Exposed as: TmMatchStyles = { inject }

const inject = () => {
    if (document.getElementById('tsa-match-style')) return;
    const style = document.createElement('style');
    style.id = 'tsa-match-style';
    style.textContent = `
            /* ── Match Dialog ── */
            .rnd-overlay {
                position: fixed; top:0; left:0; right:0; bottom:0;
                background: var(--tmu-surface-overlay-strong);
                z-index: 10000;
                display: flex; align-items: center; justify-content: center;
            }
            .rnd-dialog {
                background: var(--tmu-surface-panel); border: none;
                border-radius: 0; width: 100vw; height: 100vh;
                overflow: hidden; display: flex; flex-direction: column;
            }
            .rnd-dlg-head {
                background: linear-gradient(180deg, var(--tmu-surface-card-soft) 0%, var(--tmu-surface-panel) 50%, var(--tmu-surface-card) 100%);
                padding: var(--tmu-space-md) var(--tmu-space-lg) var(--tmu-space-sm);
                position: relative;
                border-bottom: 2px solid var(--tmu-border-soft-alpha-mid);
                overflow: visible; z-index: 2;
            }
            .rnd-dlg-head-content {
                display: flex; flex-direction: column; align-items: center;
            }
            .rnd-dlg-head-row {
                display: flex; align-items: center;
                justify-content: center; width: 100%;
            }
            .rnd-dlg-team-group {
                display: flex; align-items: center; gap: var(--tmu-space-md);
                flex: 1; min-width: 0;
            }
            .rnd-dlg-team-group.home { justify-content: flex-end; }
            .rnd-dlg-team-group.away { justify-content: flex-start; }
            .rnd-dlg-team-info {
                display: flex; flex-direction: column; gap: var(--tmu-space-xs); min-width: 0;
            }
            .rnd-dlg-team-group.home .rnd-dlg-team-info { align-items: flex-end; }
            .rnd-dlg-team-group.away .rnd-dlg-team-info { align-items: flex-start; }
            .rnd-dlg-team {
                 color: var(--tmu-text-strong); font-weight: 700; font-size: var(--tmu-font-md);
                letter-spacing: 0.3px; line-height: 1.2;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 200px;
            }
            .rnd-dlg-chips {
                display: flex; gap: var(--tmu-space-xs); flex-wrap: wrap;
            }
            .rnd-dlg-team-group.home .rnd-dlg-chips { justify-content: flex-end; }
            .rnd-dlg-chips .tmu-badge { white-space: nowrap; }
            .rnd-dlg-score-block {
                display: flex; flex-direction: column; align-items: center;
                flex-shrink: 0; padding: 0 var(--tmu-space-md);
            }
            .rnd-dlg-score {
                color: var(--tmu-text-inverse); font-weight: 800; font-size: 32px;
                letter-spacing: 3px; line-height: 1;
                text-shadow: 0 0 20px var(--tmu-success-fill-hover), 0 1px 3px var(--tmu-shadow-panel);
            }
            .rnd-dlg-datetime {
                text-align: center; margin-top: 0;
                font-size: var(--tmu-font-xs); color: var(--tmu-text-faint); letter-spacing: 0.3px;
                font-weight: 500;
            }
            .rnd-dlg-close {
                position: absolute; top: var(--tmu-space-sm); right: var(--tmu-space-sm);
                width: 26px; height: 26px;
                min-width: 26px; padding: 0;
                border-radius: 9999px;
                font-size: var(--tmu-font-lg); z-index: 3; line-height: 1;
            }
            .rnd-dlg-close:hover { transform: scale(1.1); }

            /* ── Live replay ── */
            .rnd-live-bar {
                display: flex; align-items: center; gap: var(--tmu-space-md);
                background: var(--tmu-success-fill); padding: var(--tmu-space-sm) var(--tmu-space-xxl);
                border-bottom: 1px solid var(--tmu-border-embedded); justify-content: center;
            }
            .rnd-live-min {
                 font-size: var(--tmu-font-lg); font-weight: 700; color: var(--tmu-accent);
                min-width: 48px; text-align: center;
                animation: rnd-pulse 1.2s ease-in-out infinite;
            }
            @keyframes rnd-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
            .rnd-live-progress {
                flex: 1; max-width: 400px; height: 6px;
                background: var(--tmu-accent-fill); border-radius: var(--tmu-space-xs); overflow: hidden;
            }
            .rnd-live-progress-fill {
                height: 100%; background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-accent));
                border-radius: var(--tmu-space-xs); transition: width 0.4s;
            }
            .rnd-live-btn {
                background: none; border: 1px solid var(--tmu-success); border-radius: var(--tmu-space-xs);
                 color: var(--tmu-text-main); font-size: var(--tmu-font-md); cursor: pointer;
                width: 28px; height: 28px;
                display: flex; align-items: center; justify-content: center;
                transition: background 0.15s;
            }
            .rnd-live-btn:hover { background: var(--tmu-border-contrast); }
            .rnd-live-label {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-dim); text-transform: uppercase;
                letter-spacing: 1px; font-weight: 600;
            }
            .rnd-live-ended .rnd-live-min { color: var(--tmu-text-panel-label); animation: none; }
            .rnd-live-feed-line {
                padding: var(--tmu-space-sm) 0; border-bottom: 1px solid var(--tmu-accent-fill);
                animation: rnd-feedIn 0.4s ease;
            }
            @keyframes rnd-feedIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
            .rnd-live-feed-min {
                font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-accent);
                margin-right: var(--tmu-space-sm);
            }
            .rnd-live-feed-text { color: var(--tmu-text-main); font-size: var(--tmu-font-sm); }
            .rnd-dlg-body {
                overflow-y: auto; padding: var(--tmu-space-sm) var(--tmu-space-xxl);
                flex: 1; color: var(--tmu-text-main); font-size: var(--tmu-font-sm);
            }
            .rnd-event-row {
                display: flex; align-items: flex-start; gap: var(--tmu-space-sm);
                padding: var(--tmu-space-xs) 0; border-bottom: 1px solid var(--tmu-border-soft);
            }
            .rnd-event-min { color: var(--tmu-text-panel-label); font-weight: 600; min-width: 28px; text-align: right; }
            .rnd-event-icon { min-width: 18px; text-align: center; }
            .rnd-event-text { flex: 1; color: var(--tmu-text-main); }
            /* ── Venue tab ── */
            .rnd-venue-wrap { max-width: 900px; margin: 0 auto; }
            .rnd-venue-hero {
                position: relative; border-radius: var(--tmu-space-md); overflow: hidden;
                background: linear-gradient(135deg, var(--tmu-surface-panel) 0%, var(--tmu-accent-fill) 40%, var(--tmu-success-fill) 100%);
                margin-bottom: var(--tmu-space-xl); padding: var(--tmu-space-xxl);
                border: 1px solid var(--tmu-border-embedded);
                box-shadow: 0 6px 24px var(--tmu-surface-overlay);
            }
            .rnd-venue-hero::before {
                content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background: repeating-linear-gradient(90deg, transparent, transparent 48%, var(--tmu-border-contrast) 48%, var(--tmu-border-contrast) 52%);
                pointer-events: none;
            }
            .rnd-venue-stadium-svg { display: block; margin: 0 auto var(--tmu-space-xl); opacity: 0.55; }
            .rnd-venue-name {
                text-align: center; font-size: var(--tmu-font-xl); font-weight: 800; color: var(--tmu-text-strong);
                letter-spacing: 0.5px; margin-bottom: var(--tmu-space-xs); text-shadow: 0 2px 8px var(--tmu-surface-overlay);
            }
            .rnd-venue-city {
                text-align: center; font-size: var(--tmu-font-sm); color: var(--tmu-text-panel-label); margin-bottom: var(--tmu-space-md);
                letter-spacing: 1px; text-transform: uppercase;
            }
            .rnd-venue-tournament {
                text-align: center; margin-bottom: 0;
            }
            .rnd-venue-tournament span {
                display: inline-block; background: var(--tmu-success-fill); padding: var(--tmu-space-xs) var(--tmu-space-md);
                border-radius: var(--tmu-space-xl); font-size: var(--tmu-font-xs); color: var(--tmu-text-main); letter-spacing: 0.5px;
                border: 1px solid var(--tmu-border-success);
            }
            .rnd-venue-cards {
                display: grid; grid-template-columns: 1fr 1fr; gap: var(--tmu-space-md); margin-bottom: var(--tmu-space-lg);
            }
            .rnd-venue-card {
                background: linear-gradient(145deg, var(--tmu-surface-tab-hover), var(--tmu-surface-panel));
                border: 1px solid var(--tmu-border-embedded); border-radius: var(--tmu-space-md); padding: var(--tmu-space-lg);
                text-align: center; position: relative; overflow: hidden;
            }
            .rnd-venue-card::after {
                content: ''; position: absolute; top: -20px; right: -20px;
                width: 60px; height: 60px; border-radius: 50%;
                background: var(--tmu-success-fill-faint);
            }
            .rnd-venue-card-icon { font-size: var(--tmu-font-2xl); margin-bottom: var(--tmu-space-sm); }
            .rnd-venue-card-value {
                font-size: var(--tmu-font-xl); font-weight: 800; color: var(--tmu-text-strong); margin-bottom: 0;
            }
            .rnd-venue-card-label { font-size: var(--tmu-font-xs); color: var(--tmu-text-panel-label); text-transform: uppercase; letter-spacing: 0.5px; }
            .rnd-venue-gauge-wrap {
                background: linear-gradient(145deg, var(--tmu-surface-tab-hover), var(--tmu-surface-panel));
                border: 1px solid var(--tmu-border-embedded); border-radius: var(--tmu-space-md); padding: var(--tmu-space-xl);
                margin-bottom: var(--tmu-space-lg);
            }
            .rnd-venue-gauge-header {
                display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--tmu-space-md);
            }
            .rnd-venue-gauge-title { font-size: var(--tmu-font-sm); color: var(--tmu-text-panel-label); text-transform: uppercase; letter-spacing: 0.5px; }
            .rnd-venue-gauge-value { font-size: var(--tmu-font-md); font-weight: 700; color: var(--tmu-text-strong); }
            .rnd-venue-gauge-bar {
                height: 10px; background: var(--tmu-surface-panel); border-radius: var(--tmu-space-xs); overflow: hidden;
                position: relative;
            }
            .rnd-venue-gauge-fill {
                height: 100%; border-radius: var(--tmu-space-xs);
                transition: width 0.6s ease;
            }
            .rnd-venue-gauge-fill.attendance {
                background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-compare-home-grad-end), var(--tmu-text-live));
            }
            .rnd-venue-weather {
                background: linear-gradient(145deg, var(--tmu-surface-tab-hover), var(--tmu-surface-panel));
                border: 1px solid var(--tmu-border-embedded); border-radius: var(--tmu-space-md); padding: var(--tmu-space-xl);
                margin-bottom: var(--tmu-space-lg); display: flex; align-items: center; gap: var(--tmu-space-xl);
            }
            .rnd-venue-weather-icon { font-size: 48px; line-height: 1; }
            .rnd-venue-weather-info { flex: 1; }
            .rnd-venue-weather-text { font-size: var(--tmu-font-lg); font-weight: 700; color: var(--tmu-text-strong); margin-bottom: 0; }
            .rnd-venue-weather-sub { font-size: var(--tmu-font-sm); color: var(--tmu-text-panel-label); }
            .rnd-venue-facilities {
                display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--tmu-space-md); margin-bottom: var(--tmu-space-lg);
            }
            .rnd-venue-facility {
                background: linear-gradient(145deg, var(--tmu-surface-tab-hover), var(--tmu-surface-panel));
                border: 1px solid var(--tmu-border-embedded); border-radius: var(--tmu-space-md); padding: var(--tmu-space-md) var(--tmu-space-sm);
                text-align: center; transition: border-color 0.2s;
            }
            .rnd-venue-facility.active { border-color: var(--tmu-success); background: linear-gradient(145deg, var(--tmu-accent-fill), var(--tmu-success-fill)); }
            .rnd-venue-facility-icon { font-size: var(--tmu-font-xl); margin-bottom: var(--tmu-space-xs); }
            .rnd-venue-facility-label { font-size: var(--tmu-font-xs); color: var(--tmu-text-panel-label); text-transform: uppercase; letter-spacing: 0.3px; }
            .rnd-venue-facility .rnd-venue-facility-status {
                font-size: var(--tmu-font-xs); margin-top: var(--tmu-space-xs); color: var(--tmu-text-faint); font-weight: 600;
            }
            .rnd-venue-facility.active .rnd-venue-facility-status { color: var(--tmu-accent); }
            .rnd-report-text {
                color: var(--tmu-text-main); font-size: var(--tmu-font-sm); line-height: 1.6;
            }
            .rnd-report-text .rnd-goal-text { color: var(--tmu-text-live); font-weight: 700; }
            .rnd-report-text .rnd-yellow-text { color: var(--tmu-text-highlight); }
            .rnd-report-text .rnd-red-text { color: var(--tmu-danger); font-weight: 700; }
            .rnd-report-text .rnd-sub-text { color: var(--tmu-text-preview); }
            .rnd-report-text .rnd-player-name { color: var(--tmu-text-strong); font-weight: 600; }

            /* ── Dialog logos ── */
            .rnd-dlg-logo {
                width: 44px; height: 44px; flex-shrink: 0;
                filter: drop-shadow(0 2px 6px var(--tmu-shadow-panel));
                object-fit: contain; pointer-events: none;
            }

            /* ── Statistics tab ── */
            .rnd-stats-wrap {
                max-width: 650px; margin: 0 auto; padding: var(--tmu-space-xs) 0 var(--tmu-space-md);
            }
            .rnd-stats-team-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: var(--tmu-space-md) var(--tmu-space-lg) var(--tmu-space-md); margin-bottom: var(--tmu-space-xs);
            }
            .rnd-stats-team-side {
                display: flex; align-items: center; gap: var(--tmu-space-md);
            }
            .rnd-stats-team-side.away { flex-direction: row-reverse; }
            .rnd-stats-team-logo {
                width: 36px; height: 36px; object-fit: contain;
                filter: drop-shadow(0 2px 4px var(--tmu-surface-overlay));
            }
            .rnd-stats-team-name {
                 font-weight: 700; font-size: var(--tmu-font-md); color: var(--tmu-text-strong);
                letter-spacing: 0.2px;
            }
            .rnd-stats-vs {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-faint); font-weight: 600;
                text-transform: uppercase; letter-spacing: 1px;
            }
            .rnd-stats-wrap .tmu-cstat {
                padding: var(--tmu-space-md) var(--tmu-space-lg);
            }
            .rnd-stat-divider {
                height: 1px; margin: 0 var(--tmu-space-lg);
                background: linear-gradient(90deg, transparent, var(--tmu-border-embedded) 20%, var(--tmu-border-embedded) 80%, transparent);
            }
            .rnd-stats-wrap .tmu-cstat.rnd-stat-highlight {
                background: var(--tmu-compare-fill);
                border-radius: var(--tmu-space-sm); margin: 0 var(--tmu-space-sm);
                padding: var(--tmu-space-md) var(--tmu-space-md);
            }

            /* ── Advanced Stats (Attacking Styles) ── */
            .rnd-adv-section {
                margin-top: var(--tmu-space-lg); padding-top: var(--tmu-space-md);
                border-top: 1px solid var(--tmu-border-embedded);
            }
            .rnd-adv-title {
                text-align: center; font-size: var(--tmu-font-xs); font-weight: 700;
                color: var(--tmu-text-muted); text-transform: uppercase; letter-spacing: 1.2px;
                margin-bottom: var(--tmu-space-md);
            }
            .rnd-adv-team-label {
                font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-accent-soft);
                text-transform: uppercase; letter-spacing: 0.8px;
                padding: var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-xs); margin-top: var(--tmu-space-sm);
            }
            .rnd-mps-wrap {
                padding: var(--tmu-space-sm) 0 0;
                overflow: hidden;
            }
            .rnd-mps-table {
                width: 100%; table-layout: fixed; border-collapse: collapse;
                background: var(--tmu-surface-panel-dark); border: 1px solid var(--tmu-border-faint);
                border-radius: var(--tmu-space-md); overflow: hidden;
            }
            .rnd-mps-table + .rnd-mps-table { margin-top: var(--tmu-space-sm); }
            .rnd-mps-table th:nth-child(1), .rnd-mps-table td:nth-child(1) { width: 46%; }
            .rnd-mps-table th:nth-child(2), .rnd-mps-table td:nth-child(2) { width: 7%; }
            .rnd-mps-table th:nth-child(3), .rnd-mps-table td:nth-child(3) { width: 4%; }
            .rnd-mps-table th:nth-child(4), .rnd-mps-table td:nth-child(4) { width: 5%; }
            .rnd-mps-table th:nth-child(5), .rnd-mps-table td:nth-child(5) { width: 4%; }
            .rnd-mps-table th:nth-child(6), .rnd-mps-table td:nth-child(6) { width: 9%; }
            .rnd-mps-table th:nth-child(7), .rnd-mps-table td:nth-child(7) { width: 4%; }
            .rnd-mps-table th:nth-child(8), .rnd-mps-table td:nth-child(8) { width: 5%; }
            .rnd-mps-table th:nth-child(9), .rnd-mps-table td:nth-child(9) { width: 5%; }
            .rnd-mps-table th:nth-child(10), .rnd-mps-table td:nth-child(10) { width: 6%; }
            .rnd-mps-table-gk th:nth-child(1), .rnd-mps-table-gk td:nth-child(1) { width: 54%; }
            .rnd-mps-table-gk th:nth-child(2), .rnd-mps-table-gk td:nth-child(2) { width: 9%; }
            .rnd-mps-table-gk th:nth-child(3), .rnd-mps-table-gk td:nth-child(3) { width: 9%; }
            .rnd-mps-table-gk th:nth-child(4), .rnd-mps-table-gk td:nth-child(4) { width: 7%; }
            .rnd-mps-table-gk th:nth-child(5), .rnd-mps-table-gk td:nth-child(5) { width: 10%; }
            .rnd-mps-table-gk th:nth-child(6), .rnd-mps-table-gk td:nth-child(6) { width: 4%; }
            .rnd-mps-table-gk th:nth-child(7), .rnd-mps-table-gk td:nth-child(7) { width: 7%; }
            .rnd-mps-table th, .rnd-mps-table td {
                text-align: center; font-variant-numeric: tabular-nums;
                padding: var(--tmu-space-sm) var(--tmu-space-xs);
            }
            .rnd-mps-table tr{    
                border-bottom: 1px solid var(--tmu-border-faint);
            }
            .rnd-mps-table th {
                font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); text-transform: uppercase; letter-spacing: .35px;
                font-weight: 700;
                background: var(--tmu-surface-accent-soft);
            }
            .rnd-mps-table td {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-main); font-weight: 700;
            }
            .rnd-mps-table th.l, .rnd-mps-table td.l { text-align: left; }
            .rnd-mps-table th.c, .rnd-mps-table td.c { text-align: center; }
            .rnd-mps-row { cursor: pointer; transition: background .15s; }
            .rnd-mps-row:hover { background: var(--tmu-border-contrast); }
            .rnd-mps-name { 
                 font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-strong);
                min-width: 0; flex: 1 1 auto; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-mps-name-cell {
                display: flex; align-items: center; gap: var(--tmu-space-sm);
                min-width: 0; white-space: nowrap;
            }
            .rnd-mps-name-cell .tm-pos-chip { flex-shrink: 0; }
            .rnd-mps-sub-flag {
                display: inline-block; margin-left: 0; font-size: var(--tmu-font-xs); font-weight: 800;
                flex-shrink: 0;
                vertical-align: middle;
            }
            .rnd-mps-sub-flag.out { color: var(--tmu-warning-soft); }
            .rnd-mps-sub-flag.in { color: var(--tmu-accent); }
            .rnd-adv-table {
                    width: 100%; border-collapse: collapse; font-size: var(--tmu-font-sm);
            }
            .rnd-adv-table th {
                    padding: var(--tmu-space-xs) var(--tmu-space-sm); font-size: var(--tmu-font-xs); font-weight: 700;
                color: var(--tmu-text-faint); text-transform: uppercase; letter-spacing: 0.5px;
                border-bottom: 1px solid var(--tmu-border-soft); text-align: center;
            }
            .rnd-adv-table th:first-child { text-align: left; }
            .rnd-adv-row {
                cursor: pointer; transition: background 0.15s;
            }
            .rnd-adv-row:hover { background: var(--tmu-border-contrast); }
            .rnd-adv-row td {
                padding: var(--tmu-space-xs) var(--tmu-space-sm); text-align: center;
                border-bottom: 1px solid var(--tmu-border-faint);
                font-variant-numeric: tabular-nums;
            }
            .rnd-adv-row td:first-child {
                text-align: left; font-weight: 600; color: var(--tmu-text-main);
            }
            .rnd-adv-row td.adv-zero { color: var(--tmu-text-dim); }
            .rnd-adv-row td.adv-goal { color: var(--tmu-accent); font-weight: 700; }
            .rnd-adv-row td.adv-shot { color: var(--tmu-text-highlight); }
            .rnd-adv-row td.adv-lost { color: var(--tmu-warning-soft); }
            .rnd-adv-row .adv-arrow {
                display: inline-block; font-size: var(--tmu-font-2xs); margin-left: var(--tmu-space-xs);
                transition: transform 0.2s; color: var(--tmu-text-faint);
            }
            .rnd-adv-row.expanded .adv-arrow { transform: rotate(90deg); }
            .rnd-adv-row.rnd-adv-total td {
                font-weight: 800; border-top: 1px solid var(--tmu-border-embedded);
                color: var(--tmu-text-strong); cursor: default;
            }
            .rnd-adv-row.rnd-adv-total td:first-child { color: var(--tmu-text-muted); }
            .rnd-adv-events {
                display: none;
            }
            .rnd-adv-events.visible { display: table-row; }
            .rnd-adv-events td {
                padding: 0; border-bottom: 1px solid var(--tmu-border-soft-alpha-strong);
            }
            .rnd-adv-evt-list {
                padding: var(--tmu-space-xs) 0 var(--tmu-space-sm) 0; font-size: var(--tmu-font-xs);
            }
            .rnd-adv-evt {
                padding: 0; color: var(--tmu-text-main);
                display: flex; align-items: stretch; gap: 0;
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
            }
            .rnd-adv-evt:last-child { border-bottom: none; }
            .rnd-adv-evt .adv-result-tag {
                font-size: var(--tmu-font-2xs); font-weight: 700; padding: var(--tmu-space-sm) var(--tmu-space-xs) 0;
                text-transform: uppercase; white-space: nowrap;
                min-width: 52px; text-align: center;
                align-self: flex-start;
            }
            .rnd-adv-evt .adv-result-tag.goal { color: var(--tmu-accent); }
            .rnd-adv-evt .adv-result-tag.shot { color: var(--tmu-text-highlight); }
            .rnd-adv-evt .adv-result-tag.lost { color: var(--tmu-warning-soft); }
            .rnd-adv-evt .rnd-acc { flex: 1; border-bottom: none; }
            .rnd-adv-evt .rnd-acc-head { padding: var(--tmu-space-xs) var(--tmu-space-sm); min-height: auto; }
            .rnd-adv-evt .rnd-acc-min { font-size: var(--tmu-font-xs); min-width: 28px; }
            .rnd-adv-evt .rnd-acc-body { padding: 0 var(--tmu-space-sm) var(--tmu-space-sm); }
            .rnd-adv-evt .rnd-player-name { color: var(--tmu-text-strong); font-weight: 600; }

            /* ── Player Card Dialog ── */
            .rnd-plr-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: var(--tmu-surface-overlay-strong); z-index: 100002;
                display: flex; align-items: center; justify-content: center;
                animation: rndFadeIn .15s ease;
            }
            .rnd-plr-dialog {
                background: linear-gradient(160deg, var(--tmu-surface-panel) 0%, var(--tmu-surface-card-soft) 60%, var(--tmu-surface-card) 100%);
                border: 1px solid var(--tmu-border-embedded); border-radius: var(--tmu-space-md);
                width: 820px; max-width: 96vw; max-height: 88vh;
                overflow-y: auto; color: var(--tmu-text-main);
                box-shadow: 0 12px 60px var(--tmu-surface-overlay-strong), 0 0 0 1px var(--tmu-success-fill-soft);
            }
            .rnd-plr-header {
                display: flex; align-items: center; gap: var(--tmu-space-lg);
                padding: var(--tmu-space-xl) var(--tmu-space-xxl) var(--tmu-space-lg);
                background: linear-gradient(180deg, var(--tmu-surface-accent-soft) 0%, transparent 100%);
                border-bottom: 1px solid var(--tmu-border-soft); position: relative;
            }
            .rnd-plr-header-main {
                flex: 1; min-width: 0;
                display: flex; align-items: center; justify-content: space-between; gap: var(--tmu-space-xl);
            }
            .rnd-plr-face {
                width: 84px; height: 84px; border-radius: 50%;
                border: 3px solid var(--tmu-success); overflow: hidden;
                flex-shrink: 0; background: var(--tmu-surface-panel);
                box-shadow: 0 4px 16px var(--tmu-surface-overlay);
            }
            .rnd-plr-face img { width: 100%; height: 100%; object-fit: cover; }
            .rnd-plr-info { flex: 1; min-width: 0; }
            .rnd-plr-name-row {
                display: flex; align-items: center; gap: var(--tmu-space-sm); margin-bottom: var(--tmu-space-xs);
            }
            .rnd-plr-name {
                 font-size: var(--tmu-font-xl); font-weight: 800; color: var(--tmu-text-strong);
                text-decoration: none; cursor: pointer;
            }
            .rnd-plr-name:hover { color: var(--tmu-text-inverse); text-decoration: underline; }
            .rnd-plr-link {
                 color: var(--tmu-text-faint); font-size: var(--tmu-font-md); text-decoration: none;
                transition: color .15s;
            }
            .rnd-plr-link:hover { color: var(--tmu-accent); }
            .rnd-plr-badges {
                display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px;
            }
            .rnd-plr-badges .tmu-badge { white-space: nowrap; }
            .rnd-plr-kpis {
                display: grid; grid-template-columns: repeat(2, minmax(72px, 1fr));
                    gap: var(--tmu-space-sm); flex-shrink: 0;
            }
            .rnd-plr-kpi-metric { min-width: 72px; }
            .rnd-plr-close {
                position: absolute; top: 10px; right: 14px;
                width: 28px; height: 28px; min-width: 28px; padding: 0;
                border-radius: 9999px;
                    font-size: var(--tmu-font-lg);
                transition: transform .15s;
            }
            .rnd-plr-close:hover { transform: scale(1.06); }
            .rnd-plr-body { padding: var(--tmu-space-lg) var(--tmu-space-xxl) var(--tmu-space-xl); }
            .rnd-plr-body-section {
                background: linear-gradient(180deg, var(--tmu-surface-panel-dark), var(--tmu-surface-dark-strong));
                border: 1px solid var(--tmu-border-faint);
                    border-radius: var(--tmu-space-md); padding: var(--tmu-space-md) var(--tmu-space-md); margin-bottom: 14px;
                box-shadow: inset 0 1px 0 var(--tmu-border-contrast);
            }
            .rnd-plr-stats-row {
                display: grid; grid-template-columns: repeat(5, 1fr);
                    gap: var(--tmu-space-sm); margin-bottom: var(--tmu-space-lg);
            }
            .rnd-plr-stat-card {
                background: var(--tmu-surface-accent-soft); border: 1px solid var(--tmu-border-soft);
                    border-radius: var(--tmu-space-sm); padding: var(--tmu-space-md) var(--tmu-space-xs) var(--tmu-space-sm);
                text-align: center; transition: background .15s;
            }
            .rnd-plr-stat-card:hover { background: var(--tmu-surface-tab-hover); }
            .rnd-plr-stat-icon { font-size: var(--tmu-font-lg); margin-bottom: 2px; }
            .rnd-plr-stat-val {
                font-size: var(--tmu-font-xl); font-weight: 800; color: var(--tmu-text-strong); line-height: 1.1;
            }
            .rnd-plr-stat-lbl {
                font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); text-transform: uppercase;
                letter-spacing: 0.3px; margin-top: 2px;
            }
            .rnd-plr-stat-card.green .rnd-plr-stat-val { color: var(--tmu-success-strong); }
            .rnd-plr-stat-card.red .rnd-plr-stat-val { color: var(--tmu-danger-strong); }
            .rnd-plr-stat-card.gold .rnd-plr-stat-val { color: var(--tmu-text-highlight); }
            .rnd-plr-section-title {
                    font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-faint);
                text-transform: uppercase; letter-spacing: 1px;
                margin: 14px 0 8px; padding-bottom: var(--tmu-space-xs);
                border-bottom: 1px solid var(--tmu-border-soft);
                display: flex; align-items: center; gap: 6px;
            }
            .rnd-plr-section-title .sec-icon { font-size: var(--tmu-font-sm); }
            /* ── Player compact stats grid ── */
            .rnd-pls-wrap { margin-bottom: 0; }
            .rnd-pls-row {
                display: grid; grid-template-columns: repeat(auto-fit, minmax(62px, 1fr));
                gap: 6px;
                    margin-bottom: var(--tmu-space-sm);
                background: var(--tmu-surface-dark-soft); border: 1px solid var(--tmu-border-faint);
                border-radius: 10px; padding: var(--tmu-space-sm);
            }
            .rnd-pls-row:last-child { margin-bottom: 0; }
            .rnd-pls-cell {
                display: flex; flex-direction: column; align-items: center;
                min-width: 0; padding: var(--tmu-space-sm) var(--tmu-space-xs); text-align: center;
                 background: var(--tmu-surface-overlay-soft); border-radius: var(--tmu-space-sm);
            }
            .rnd-pls-icon { font-size: var(--tmu-font-sm); line-height: 1; margin-bottom: 2px; }
            .rnd-pls-val  { font-size: var(--tmu-font-lg); font-weight: 800; color: var(--tmu-text-strong); line-height: 1.1; }
            .rnd-pls-lbl  { font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); text-transform: uppercase; letter-spacing: .3px; margin-top: 2px; white-space: nowrap; }
            .rnd-pls-cell.hi-gold  .rnd-pls-val { color: var(--tmu-text-highlight); }
            .rnd-pls-cell.hi-green .rnd-pls-val { color: var(--tmu-success-strong); }
            .rnd-pls-cell.hi-red   .rnd-pls-val { color: var(--tmu-danger-strong); }
            /* ── Tactics cards ── */
            .rnd-tactics-section {
                margin-top: 6px; padding: var(--tmu-space-sm);
                background: linear-gradient(180deg, var(--tmu-surface-panel-dark), var(--tmu-surface-dark-strong));
                 border-radius: var(--tmu-space-sm); border: 1px solid var(--tmu-border-soft);
            }
            .rnd-tactics-grid { display: flex; flex-direction: column; gap: 0; }
            .rnd-tactic-row {
                display: flex; align-items: center; gap: 6px;
                padding: var(--tmu-space-xs) var(--tmu-space-sm);
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
            }
            .rnd-tactic-row:last-child { border-bottom: none; }
            .rnd-tactic-row.r5-row {
                padding: var(--tmu-space-sm) var(--tmu-space-sm); margin-bottom: 2px;
                background: var(--tmu-surface-overlay-soft); border-radius: 6px;
                border-bottom: none;
            }
            .rnd-tactic-icon {
                    font-size: var(--tmu-font-sm); line-height: 1; width: 18px;
                text-align: center; flex-shrink: 0;
            }
            .rnd-tactic-label {
                font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); text-transform: uppercase;
                letter-spacing: 0.6px; font-weight: 700; min-width: 52px;
                flex-shrink: 0;
            }
            .rnd-tactic-meter {
                flex: 1; height: 4px; background: var(--tmu-surface-overlay); border-radius: 2px;
                overflow: hidden;
            }
            .rnd-tactic-meter-fill {
                height: 100%; border-radius: 2px; transition: width 0.4s ease;
            }
            .rnd-tactic-meter-fill.home { background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-compare-home-grad-end)); }
            .rnd-tactic-meter-fill.away { background: linear-gradient(90deg, var(--tmu-compare-away-grad-start), var(--tmu-compare-away-grad-end)); }
            .rnd-tactic-value {
                    font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-main);
                min-width: 0; text-align: right;
                white-space: nowrap;
            }
            .rnd-tactic-value-pill {
                font-size: var(--tmu-font-2xs); font-weight: 700; padding: 0 var(--tmu-space-sm);
                 border-radius: var(--tmu-space-xs); white-space: nowrap;
            }
            .rnd-tactic-value-pill.home {
                background: var(--tmu-success-fill-soft); color: var(--tmu-text-live);
            }
            .rnd-tactic-value-pill.away {
                background: var(--tmu-preview-fill); color: var(--tmu-text-preview);
            }
            /* ── Report event badges ── */
            .rnd-acc-home .tmu-badge,
            .rnd-acc-away .tmu-badge {
                margin-bottom: 6px;
            }

            /* ── Details timeline ── */
            .rnd-timeline { margin-top: var(--tmu-space-lg); }
            .rnd-tl-row {
                display: flex; align-items: center;
                border-bottom: 1px solid var(--tmu-border-soft);
                padding: var(--tmu-space-sm) 0; min-height: 32px;
            }
            .rnd-tl-row:last-child { border-bottom: none; }
            .rnd-tl-goal { background: var(--tmu-success-fill-faint); }
            .rnd-tl-home {
                flex: 1; text-align: right; padding-right: var(--tmu-space-md);
                color: var(--tmu-text-strong); font-size: var(--tmu-font-sm);
            }
            .rnd-tl-min {
                width: 44px; text-align: center; flex-shrink: 0;
                color: var(--tmu-text-panel-label); font-weight: 700; font-size: var(--tmu-font-sm);
                background: var(--tmu-accent-fill); border-radius: 3px; padding: 0 0;
            }
            .rnd-tl-away {
                flex: 1; text-align: left; padding-left: var(--tmu-space-md);
                color: var(--tmu-text-strong); font-size: var(--tmu-font-sm);
            }

            /* ── Report accordion ── */
            .rnd-acc { border-bottom: 1px solid var(--tmu-border-soft); }
            .rnd-acc:last-child { border-bottom: none; }
            .rnd-acc-head {
                display: flex; align-items: center;
                padding: var(--tmu-space-sm) 0; min-height: 32px; cursor: pointer;
                transition: background 0.15s;
            }
            .rnd-acc-head:hover { background: var(--tmu-border-contrast); }
            .rnd-acc-goal { background: var(--tmu-success-fill-faint); }
            .rnd-acc-home {
                flex: 1; text-align: right; padding-right: var(--tmu-space-md);
                color: var(--tmu-text-strong); font-size: var(--tmu-font-sm);
            }
            .rnd-acc-min {
                width: 44px; text-align: center; flex-shrink: 0;
                color: var(--tmu-text-panel-label); font-weight: 700; font-size: var(--tmu-font-sm);
                background: var(--tmu-accent-fill); border-radius: 3px; padding: 0 0;
            }
            .rnd-acc-away {
                flex: 1; text-align: left; padding-left: var(--tmu-space-md);
                color: var(--tmu-text-strong); font-size: var(--tmu-font-sm);
            }
            .rnd-acc-body {
                display: none; padding: var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-md);
                background: var(--tmu-surface-overlay-soft); border-radius: 0 0 4px 4px;
            }
            .rnd-acc.open .rnd-acc-body { display: block; }
            .rnd-acc-chevron {
                width: 14px; height: 14px; flex-shrink: 0;
                fill: var(--tmu-text-dim); transition: transform 0.2s;
                margin: 0 4px;
            }
            .rnd-acc.open .rnd-acc-chevron { transform: rotate(90deg); }

            /* ── Lineups tab ── */
            .rnd-lu-outer { display: flex; flex-direction: column; }
            .rnd-lu-wrap { display: flex; gap: 0; }
            .rnd-lu-list {
                    flex: 0 0 25%; font-size: var(--tmu-font-sm);
                padding: 0 var(--tmu-space-sm); box-sizing: border-box;
            }
            .rnd-lu-player {
                display: flex; align-items: center; gap: 6px;
                padding: var(--tmu-space-xs) 0; border-bottom: 1px solid var(--tmu-accent-fill);
            }
            .rnd-lu-player:last-child { border-bottom: none; }
            .rnd-lu-clickable { cursor: pointer; transition: background .15s; }
            .rnd-lu-clickable:hover { background: var(--tmu-success-fill-soft); }
            .rnd-lu-name { flex: 1; color: var(--tmu-text-main); font-size: var(--tmu-font-sm); }
            .rnd-lu-pos { color: var(--tmu-text-panel-label); font-size: var(--tmu-font-xs); text-transform: uppercase; width: 30px; text-align: center; }
            .rnd-lu-rating { font-weight: 700; font-size: var(--tmu-font-sm); width: 32px; text-align: right; }
            .rnd-lu-r5 {
                font-weight: 700; font-size: var(--tmu-font-xs); min-width: 36px;
                text-align: center; border-radius: 10px;
                padding: 0 var(--tmu-space-xs); color: var(--tmu-text-inverse); flex-shrink: 0;
                background: var(--tmu-surface-tab-hover);
            }
            .rnd-lu-sub-header {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-dim); text-transform: uppercase;
                letter-spacing: 1px; padding: var(--tmu-space-sm) 0 var(--tmu-space-xs); font-weight: 600;
            }
            .rnd-lu-captain {
                    font-size: var(--tmu-font-xs); font-weight: 800; color: var(--tmu-metal-gold);
                margin-left: 2px;
            }
            .rnd-lu-mom {
                    font-size: var(--tmu-font-xs); margin-left: 2px;
            }
            .rnd-pitch-captain {
                position: absolute; top: 50%; left: 50%;
                transform: translate(30%, -100%);
                font-size: var(--tmu-font-2xs); font-weight: 900; color: var(--tmu-text-inverse);
                background: var(--tmu-text-warm-accent); border-radius: 50%;
                width: 16px; height: 16px;
                display: flex; align-items: center; justify-content: center;
                z-index: 4; box-shadow: 0 1px 3px var(--tmu-shadow-panel);
                border: 1.5px solid var(--tmu-metal-gold);
            }
            .rnd-pitch-mom {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-130%, -100%);
                font-size: var(--tmu-font-sm); z-index: 4;
                filter: drop-shadow(0 1px 2px var(--tmu-shadow-panel));
            }

            /* Pitch */
            .rnd-pitch-wrap { flex: 0 0 50%; display: flex; flex-direction: column; align-items: center; justify-content: start; gap: var(--tmu-space-sm); }
            /* Unity 3D viewport row: feed | viewport | stats */
            .rnd-unity-row {
                display: flex; gap: 0; width: 100%;
                    margin-bottom: var(--tmu-space-sm); align-items: stretch;
            }
            .rnd-unity-feed {
                flex: 0 0 25%; min-width: 0; display: flex; flex-direction: column;
                gap: 3px; overflow-y: auto; overflow-x: hidden;
                scrollbar-width: none; /* Firefox */
                padding: var(--tmu-space-sm) var(--tmu-space-sm); box-sizing: border-box;
                min-height: 200px; /* expanded by JS (syncUnityPanelHeights) when Unity is active */
            }
            .rnd-unity-feed::-webkit-scrollbar { display: none; } /* Chrome/Edge */
            .rnd-unity-feed-line {
                display: flex; align-items: baseline; gap: 5px;
                font-size: var(--tmu-font-sm); color: var(--tmu-text-main); line-height: 1.4;
                padding: 0 0;
                animation: rnd-fade-in 0.4s ease;
            }
            .rnd-unity-feed-min {
                 font-size: var(--tmu-font-2xs); font-weight: 700; color: var(--tmu-accent);
                background: var(--tmu-surface-overlay); border-radius: 3px;
                padding: 0 var(--tmu-space-xs); white-space: nowrap; flex-shrink: 0;
            }
            .rnd-unity-feed-text { color: var(--tmu-text-main); }
            .rnd-unity-feed-text .rnd-player-name { color: var(--tmu-text-strong); font-weight: 600; }
            @keyframes rnd-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            .rnd-unity-stats {
                flex: 0 0 25%; display: flex; flex-direction: column;
                gap: 0; padding: var(--tmu-space-sm); box-sizing: border-box;
                font-size: var(--tmu-font-xs); overflow-y: auto;
                background: var(--tmu-surface-dark-strong);
                    border-radius: var(--tmu-space-sm); border: 1px solid var(--tmu-border-soft-alpha-mid);
                min-height: 200px;
            }
            /* When Unity viewport is hidden: expand feed+stats to fill the full row */
            .rnd-unity-row.rnd-no-unity { gap: var(--tmu-space-sm); }
            .rnd-unity-row.rnd-no-unity .rnd-unity-feed,
            .rnd-unity-row.rnd-no-unity .rnd-unity-stats { flex: 0 0 calc(50% - 4px); }
            .rnd-unity-stat-row {
                padding: var(--tmu-space-xs) var(--tmu-space-sm);
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
                transition: background .2s;
            }
            .rnd-unity-stat-row:last-child { border-bottom: none; }
            .rnd-unity-stat-row:hover { background: var(--tmu-compare-fill); }
            .rnd-unity-stat-hdr {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 3px;
            }
            .rnd-unity-stat-hdr .val {
                font-weight: 800; font-size: var(--tmu-font-sm); min-width: 18px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-unity-stat-hdr .val.home { text-align: left; color: var(--tmu-accent); }
            .rnd-unity-stat-hdr .val.away { text-align: right; color: var(--tmu-info-alt); }
            .rnd-unity-stat-hdr .val.lead { font-size: var(--tmu-font-md); }
            .rnd-unity-stat-label {
                    font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); text-transform: uppercase;
                letter-spacing: 0.8px; font-weight: 700; text-align: center; flex: 1;
            }
            .rnd-unity-stat-bar {
                display: flex; height: 5px; border-radius: 3px; overflow: hidden;
                background: var(--tmu-surface-overlay); gap: 2px;
            }
            .rnd-unity-stat-bar .seg {
                transition: width 0.5s cubic-bezier(.4,0,.2,1);
                min-width: 2px; border-radius: 2px;
            }
            .rnd-unity-stat-bar .seg.home { background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-compare-home-grad-end)); }
            .rnd-unity-stat-bar .seg.away { background: linear-gradient(90deg, var(--tmu-compare-away-grad-start), var(--tmu-compare-away-grad-end)); }
            .rnd-unity-viewport {
                position: relative; border: 2px solid var(--tmu-success);
                    border-radius: var(--tmu-space-sm); overflow: hidden;
                background: var(--tmu-surface-overlay-strong);
                width: 100%; max-width: 400px;
                margin: 0 auto;
                aspect-ratio: 780 / 447;
            }
            .rnd-unity-viewport .webgl-content {
                position: relative !important;
                top: auto !important; left: auto !important;
                right: auto !important; bottom: auto !important;
                transform: none !important;
                width: 100% !important; height: 100% !important;
                margin: 0 !important; padding: 0 !important;
                display: block !important;
            }
            .rnd-unity-viewport #gameContainer {
                position: relative !important;
                top: auto !important; left: auto !important;
                right: auto !important; bottom: auto !important;
                transform: none !important;
                width: 100% !important; height: 100% !important;
                margin: 0 !important; padding: 0 !important;
            }
            .rnd-unity-viewport #gameContainer .footer { display: none !important; }
            .rnd-unity-viewport canvas {
                width: 100% !important; height: 100% !important;
                display: block !important;
                object-fit: contain;
            }
            /* Hide datetime & show inline time when live */
            .rnd-dlg-head.rnd-live-active .rnd-dlg-datetime { display: none; }
            .rnd-dlg-head-time {
                 display: none; gap: var(--tmu-space-sm); align-items: center;
                justify-content: center; margin-top: 6px;
                padding-top: var(--tmu-space-sm);
                border-top: 1px solid var(--tmu-border-soft-alpha);
            }
            .rnd-dlg-head.rnd-live-active .rnd-dlg-head-time { display: flex; }
            .rnd-dlg-head-time .rnd-live-min {
                font-size: var(--tmu-font-md); font-weight: 800; color: var(--tmu-accent);
                background: var(--tmu-surface-overlay-strong); padding: 0 var(--tmu-space-md);
                    border-radius: var(--tmu-space-sm); min-width: 48px; text-align: center;
                letter-spacing: 0.5px;
                box-shadow: 0 0 10px var(--tmu-success-fill-soft);
                animation: rnd-pulse 1.2s ease-in-out infinite;
            }
            .rnd-dlg-head-time .rnd-live-progress {
                flex: 1; max-width: 180px; height: 4px;
                background: var(--tmu-surface-overlay-strong); border-radius: 2px; overflow: hidden;
            }
            .rnd-dlg-head-time .rnd-live-progress-fill {
                height: 100%; border-radius: 2px; transition: width 0.4s;
                background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-accent));
                box-shadow: 0 0 6px var(--tmu-success-fill-hover);
            }
            .rnd-dlg-head-time .rnd-live-btn {
                width: 26px; height: 26px;
                min-width: 26px; padding: 0;
                border-radius: 9999px;
                font-size: var(--tmu-font-sm);
                transition: transform 0.2s;
            }
            .rnd-dlg-head-time .rnd-live-btn:hover {
                transform: scale(1.1);
            }
            .rnd-live-filter-group {
                display: flex; gap: 1px;
                background: var(--tmu-surface-overlay-strong); border-radius: 10px;
                padding: 0;
            }
            .rnd-live-filter-btn {
                min-height: 22px;
                padding: 0 var(--tmu-space-sm);
                    border-radius: var(--tmu-space-sm);
                font-size: var(--tmu-font-xs);
                white-space: nowrap;
                letter-spacing: 0.3px;
                text-transform: uppercase;
            }
            .rnd-live-filter-dot {
                width: 6px; height: 6px; border-radius: 50%;
                background: var(--tmu-danger);
                flex: 0 0 auto;
            }
            .rnd-live-filter-btn:disabled {
                opacity: 0.35; cursor: not-allowed;
                pointer-events: none;
            }
            .rnd-r5-compare { display: flex; gap: var(--tmu-space-md); width: 100%; justify-content: center; align-items: center; }
            .rnd-r5-side { display: flex; align-items: center; gap: 6px; flex: 1; }
            .rnd-r5-side.away { flex-direction: row-reverse; }
            .rnd-r5-side-label { font-size: var(--tmu-font-xs); color: var(--tmu-text-panel-label); white-space: nowrap; font-weight: 600; }
                .rnd-r5-side-meter { flex: 1; height: 8px; background: var(--tmu-surface-overlay); border-radius: var(--tmu-space-xs); overflow: hidden; }
                .rnd-r5-side-meter-fill { height: 100%; border-radius: var(--tmu-space-xs); transition: width .6s ease; }
            .rnd-r5-side-meter-fill.home { background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-compare-home-grad-end)); }
            .rnd-r5-side-meter-fill.away { background: linear-gradient(90deg, var(--tmu-compare-away-grad-start), var(--tmu-compare-away-grad-end)); }
            .rnd-r5-side-val { font-size: var(--tmu-font-sm); font-weight: 700; min-width: 32px; text-align: center; }
            .rnd-pitch {
                position: relative; width: 100%;
                background: linear-gradient(90deg, #2d6b1e 0%, #357a22 50%, #2d6b1e 100%);
                border: 2px solid var(--tmu-success); border-radius: 6px; overflow: hidden;
            }
            .rnd-pitch-lines {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                pointer-events: none; z-index: 0;
            }
            .rnd-pitch-grid {
                position: relative; z-index: 1;
                display: grid;
                grid-template-columns: repeat(12, 8.333%);
                grid-template-rows: repeat(5, 20%);
                width: 100%; aspect-ratio: 3 / 2;
            }
            .rnd-pitch-cell {
                position: relative; overflow: visible;
            }
            .rnd-pitch-face {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                width: 70%; max-width: 48px; aspect-ratio: 1;
                border-radius: 50%; overflow: hidden;
                box-shadow: 0 2px 6px var(--tmu-surface-overlay);
                z-index: 2;
            }
            .rnd-pitch-face img {
                width: 100%; height: 100%; object-fit: cover;
                border-radius: 50%;
            }
            .rnd-pitch-info {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-50%, 0);
                margin-top: 40%;
                display: flex; flex-direction: column; align-items: center;
                z-index: 3; pointer-events: none;
            }
            .rnd-pitch-label {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-inverse);
                text-shadow: 0 1px 3px var(--tmu-shadow-panel);
                white-space: nowrap;
                text-align: center;
                font-weight: 600; line-height: 1.2;
            }
            .rnd-pitch-rating {
                font-size: var(--tmu-font-2xs); font-weight: 700;
                padding: 0 var(--tmu-space-xs); border-radius: 3px;
                background: var(--tmu-surface-overlay-strong); line-height: 1.3;
            }
            .rnd-pitch-events {
                display: flex; gap: 1px; flex-wrap: wrap;
                justify-content: center; font-size: var(--tmu-font-2xs);
            }
            /* ── Pitch hover tooltip ── */
            .rnd-pitch-cell[data-pid] { cursor: pointer; }
            .rnd-pitch-tooltip {
                position: fixed; z-index: 100001;
                background: linear-gradient(135deg, var(--tmu-surface-card-soft) 0%, var(--tmu-surface-tab-hover) 100%);
                    border: 1px solid var(--tmu-success); border-radius: var(--tmu-space-sm);
                padding: var(--tmu-space-md) var(--tmu-space-md); min-width: 200px; max-width: 280px;
                box-shadow: 0 6px 24px var(--tmu-shadow-panel);
                pointer-events: none; font-size: var(--tmu-font-xs); color: var(--tmu-text-main);
                opacity: 0; transition: opacity .15s ease;
            }
            .rnd-pitch-tooltip.visible { opacity: 1; }
            .rnd-pitch-tooltip-header {
                 display: flex; align-items: center; gap: var(--tmu-space-sm);
                 margin-bottom: var(--tmu-space-sm); padding-bottom: var(--tmu-space-sm);
                border-bottom: 1px solid var(--tmu-border-success);
            }
            .rnd-pitch-tooltip-name { font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-strong); }
            .rnd-pitch-tooltip-pos { font-size: var(--tmu-font-xs); color: var(--tmu-text-panel-label); font-weight: 600; }
            .rnd-pitch-tooltip-badges { display: flex; gap: 6px; margin-left: auto; }
            .rnd-pitch-tooltip-badge {
                font-size: var(--tmu-font-xs); font-weight: 700; padding: 0 var(--tmu-space-sm);
                 border-radius: var(--tmu-space-xs); background: var(--tmu-surface-overlay);
            }
            .rnd-pitch-tooltip-skills {
                display: flex; gap: var(--tmu-space-md); margin-bottom: 6px;
            }
            .rnd-pitch-tooltip-skills-col {
                flex: 1; min-width: 0;
            }
            .rnd-pitch-tooltip-skill {
                display: flex; justify-content: space-between;
                padding: 0 0; border-bottom: 1px solid var(--tmu-border-soft-alpha);
            }
            .rnd-pitch-tooltip-skill-name { color: var(--tmu-text-panel-label); font-size: var(--tmu-font-xs); }
            .rnd-pitch-tooltip-skill-val { font-weight: 700; font-size: var(--tmu-font-xs); }
            .rnd-pitch-tooltip-footer {
                display: flex; gap: var(--tmu-space-sm); justify-content: center;
                padding-top: var(--tmu-space-sm); border-top: 1px solid var(--tmu-border-success);
            }
            .rnd-pitch-tooltip-stat {
                text-align: center;
            }
            .rnd-pitch-tooltip-stat-val { font-size: var(--tmu-font-md); font-weight: 800; }
            .rnd-pitch-tooltip-stat-lbl { font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); text-transform: uppercase; }
            .rnd-lu-events {
                display: flex; gap: 1px; flex-shrink: 0; font-size: var(--tmu-font-xs);
                margin-left: 2px;
            }

            /* H2H tab */
            .rnd-h2h-wrap { max-width: 640px; margin: 0 auto; padding: var(--tmu-space-sm) 0 var(--tmu-space-lg); }

            /* ── Overall record strip ── */
            .rnd-h2h-record {
                display: flex; align-items: center; justify-content: center;
                 gap: var(--tmu-space-xxl); padding: var(--tmu-space-md) 0 var(--tmu-space-md);
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
                 margin-bottom: var(--tmu-space-xs);
            }
            .rnd-h2h-record-side {
                 display: flex; align-items: center; gap: var(--tmu-space-sm);
            }
            .rnd-h2h-record-side.away { flex-direction: row-reverse; }
            .rnd-h2h-record-logo {
                width: 28px; height: 28px; object-fit: contain;
                filter: drop-shadow(0 1px 3px var(--tmu-surface-overlay));
            }
            .rnd-h2h-record-name {
                 font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-main);
                max-width: 150px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis;
            }
            .rnd-h2h-record-stat {
                display: flex; flex-direction: column; align-items: center;
            }
            .rnd-h2h-record-num {
                font-size: var(--tmu-font-xl); font-weight: 800; line-height: 1;
            }
            .rnd-h2h-record-num.home { color: var(--tmu-compare-home-grad-end); }
            .rnd-h2h-record-num.draw { color: var(--tmu-text-muted); }
            .rnd-h2h-record-num.away { color: var(--tmu-compare-away-grad-end); }
            .rnd-h2h-record-label {
                    font-size: var(--tmu-font-2xs); color: var(--tmu-text-dim); text-transform: uppercase;
                letter-spacing: 1px; font-weight: 600; margin-top: 2px;
            }
            .rnd-h2h-goals-summary {
                    text-align: center; font-size: var(--tmu-font-xs); color: var(--tmu-text-dim);
                margin-top: -6px; padding-bottom: var(--tmu-space-sm);
            }
            .rnd-h2h-goals-summary span { color: var(--tmu-text-panel-label); font-weight: 700; }

            /* ── Match list ── */
            .rnd-h2h-matches { padding-top: var(--tmu-space-xs); }
            .rnd-h2h-season {
                font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); text-transform: uppercase;
                letter-spacing: 1.5px; padding: var(--tmu-space-md) 0 var(--tmu-space-xs); font-weight: 700;
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
            }
            .rnd-h2h-match {
                position: relative;
                display: flex; align-items: center; gap: 0;
                padding: var(--tmu-space-sm) var(--tmu-space-sm); margin: 2px 0; border-radius: 6px;
                font-size: var(--tmu-font-sm); cursor: pointer;
                transition: background 0.15s;
            }
            .rnd-h2h-match:hover { background: var(--tmu-border-contrast); }
            .rnd-h2h-match.h2h-readonly { cursor: default; }
            .rnd-h2h-match.h2h-win { border-left: 3px solid var(--tmu-success); }
            .rnd-h2h-match.h2h-loss { border-left: 3px solid var(--tmu-compare-away-grad-end); }
            .rnd-h2h-match.h2h-draw { border-left: 3px solid var(--tmu-text-dim); }
            .rnd-h2h-date {
                 color: var(--tmu-text-faint); font-size: var(--tmu-font-xs); width: 72px; flex-shrink: 0;
                font-weight: 500;
            }
            .rnd-h2h-match .tmu-badge {
                flex-shrink: 0; margin-right: 8px; width: 100px;
                justify-content: center;
            }
            .rnd-h2h-home {
                margin-left: 16px; text-align: right; color: var(--tmu-text-main);
                    font-size: var(--tmu-font-sm); white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis; padding-right: var(--tmu-space-sm);
            }
            .rnd-h2h-result {
                font-weight: 800; color: var(--tmu-text-strong); width: 44px;
                    text-align: center; font-size: var(--tmu-font-md); flex-shrink: 0;
                letter-spacing: 1px;
            }
            .rnd-h2h-away {
                flex: 1; text-align: left; color: var(--tmu-text-main);
                    font-size: var(--tmu-font-sm); white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis; padding-left: var(--tmu-space-sm);
            }
            .rnd-h2h-home.winner { color: var(--tmu-success); font-weight: 700; }
            .rnd-h2h-away.winner { color: var(--tmu-success); font-weight: 700; }
            .rnd-h2h-att {
                font-size: var(--tmu-font-2xs); color: var(--tmu-text-dim); width: 50px;
                text-align: right; flex-shrink: 0; font-variant-numeric: tabular-nums;
            }

            /* ── League Tab ── */
            .rnd-league-wrap {
                max-width: 100%; margin: 0 auto; padding: 0 0 var(--tmu-space-xl);
            }
            .rnd-league-header {
                display: flex; align-items: center; justify-content: center;
                gap: 14px; padding: var(--tmu-space-md) var(--tmu-space-xl) var(--tmu-space-md);
                background: linear-gradient(180deg, var(--tmu-surface-accent-soft) 0%, transparent 100%);
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
                    margin-bottom: var(--tmu-space-xs);
            }
            .rnd-league-title {
                    font-size: var(--tmu-font-sm); font-weight: 700; color: var(--tmu-text-main);
                text-transform: uppercase; letter-spacing: 1.5px;
            }
            .rnd-league-header .tmu-badge { animation: rnd-pulse-score 1.5s ease-in-out infinite; }
            @keyframes rnd-pulse-score {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.55; }
            }
            .rnd-league-columns {
                 display: flex; gap: var(--tmu-space-xxl); padding: 0 var(--tmu-space-lg);
            }
            .rnd-league-col-matches { flex: 1; min-width: 0; }
            .rnd-league-col-standings { flex: 1.15; min-width: 0; overflow-x: auto; }
            .rnd-league-col-title {
                    font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-faint);
                text-transform: uppercase; letter-spacing: 1.5px;
                padding: var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-md); margin-bottom: 0;
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
            }

            /* ── Match card ── */
            .rnd-league-match {
                position: relative;
                display: flex; align-items: center; gap: 0;
                padding: var(--tmu-space-md) var(--tmu-space-md); border-radius: 0;
                font-size: var(--tmu-font-sm); cursor: default;
                transition: background 0.15s;
                border-left: 3px solid transparent;
            }
            .rnd-league-match:nth-child(even) {
                background: var(--tmu-surface-overlay-soft);
            }
            .rnd-league-match:nth-child(odd) {
                background: var(--tmu-border-contrast);
            }
            .rnd-league-match:hover { background: var(--tmu-border-contrast); }
            .rnd-league-match.rnd-league-current {
                background: var(--tmu-success-fill-hover) !important;
                border-left-color: var(--tmu-success);
            }
            .rnd-league-match.rnd-league-current:hover {
                background: var(--tmu-success-fill-strong) !important;
            }
            .rnd-league-home {
                flex: 1; text-align: right; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
                color: var(--tmu-text-main); font-size: var(--tmu-font-sm); font-weight: 600;
                padding-right: var(--tmu-space-sm);
            }
            .rnd-league-away {
                flex: 1; text-align: left; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
                color: var(--tmu-text-main); font-size: var(--tmu-font-sm); font-weight: 600;
                padding-left: var(--tmu-space-sm);
            }
            .rnd-league-logo {
                width: 22px; height: 22px; vertical-align: middle;
                flex-shrink: 0;
                filter: drop-shadow(0 1px 3px var(--tmu-surface-overlay));
            }
            .rnd-league-score-block {
                display: flex; align-items: center; justify-content: center;
                width: 70px; margin: 0 6px; flex-shrink: 0;
                background: var(--tmu-surface-overlay); border-radius: 5px;
                padding: var(--tmu-space-xs) 0;
            }
            .rnd-league-score-num {
                width: 22px; text-align: center;
                font-weight: 800; font-size: var(--tmu-font-lg); color: var(--tmu-text-strong);
                font-variant-numeric: tabular-nums; line-height: 1;
            }
            .rnd-league-score-sep {
                color: var(--tmu-text-dim); font-weight: 600; margin: 0 4px;
                font-size: var(--tmu-font-sm);
            }
            .rnd-league-match.live .rnd-league-score-block {
                background: var(--tmu-success-fill-soft);
                border: 1px solid var(--tmu-border-success);
            }
            .rnd-league-match.live .rnd-league-score-num {
                color: var(--tmu-success);
            }
            /* ── League Tooltip ── */
            .rnd-league-tooltip {
                position: absolute; z-index: 100;
                background: linear-gradient(160deg, var(--tmu-surface-panel) 0%, var(--tmu-surface-card-soft) 60%, var(--tmu-surface-card) 100%);
                border: 1px solid var(--tmu-border-success);
                    border-radius: var(--tmu-space-md); padding: 0;
                min-width: 320px; max-width: 400px;
                box-shadow: 0 12px 48px var(--tmu-surface-overlay-strong), 0 0 0 1px var(--tmu-success-fill-faint);
                pointer-events: none; opacity: 0;
                transition: opacity 0.15s;
                overflow: hidden;
            }
            .rnd-league-tooltip.visible { opacity: 1; }
            .rnd-league-tt-head {
                display: flex; align-items: center; justify-content: center;
                    gap: var(--tmu-space-sm); padding: var(--tmu-space-md) var(--tmu-space-lg);
                background: linear-gradient(180deg, var(--tmu-surface-accent-soft) 0%, transparent 100%);
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
            }
            .rnd-league-tt-team {
                font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-main);
                max-width: 100px; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-league-tt-score {
                display: flex; align-items: center; gap: 0;
                background: var(--tmu-surface-overlay); border-radius: 6px;
                padding: var(--tmu-space-xs) var(--tmu-space-md);
            }
            .rnd-league-tt-score-num {
                font-size: var(--tmu-font-xl); font-weight: 800; color: var(--tmu-text-strong);
                min-width: 16px; text-align: center; line-height: 1;
            }
            .rnd-league-tt-score-sep {
                color: var(--tmu-text-dim); margin: 0 5px; font-size: var(--tmu-font-md);
            }
            .rnd-league-tt-logo {
                width: 24px; height: 24px;
                filter: drop-shadow(0 1px 3px var(--tmu-surface-overlay));
            }
            .rnd-league-tt-stats {
                padding: var(--tmu-space-md) var(--tmu-space-lg);
            }
            .rnd-league-tt-stat-row {
                display: flex; align-items: center; margin-bottom: 6px;
            }
            .rnd-league-tt-stat-row:last-child { margin-bottom: 0; }
            .rnd-league-tt-val {
                font-weight: 800; font-size: var(--tmu-font-sm); min-width: 24px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-league-tt-val.home { text-align: right; color: var(--tmu-accent); }
            .rnd-league-tt-val.away { text-align: left; color: var(--tmu-info-alt); }
            .rnd-league-tt-val.leading { font-size: var(--tmu-font-md); }
            .rnd-league-tt-label {
                flex: 1; text-align: center;
                font-size: var(--tmu-font-2xs); color: var(--tmu-text-faint); font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .rnd-league-tt-bar {
                flex: 1; display: flex; height: 4px; border-radius: 2px;
                overflow: hidden; background: var(--tmu-surface-overlay); gap: 1px;
                margin: 0 8px;
            }
            .rnd-league-tt-seg {
                border-radius: 2px; min-width: 2px;
                transition: width 0.3s ease;
            }
            .rnd-league-tt-seg.home {
                background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-compare-home-grad-end));
            }
            .rnd-league-tt-seg.away {
                background: linear-gradient(90deg, var(--tmu-compare-away-grad-start), var(--tmu-compare-away-grad-end));
            }
            .rnd-league-tt-events {
                border-top: 1px solid var(--tmu-border-soft-alpha);
                padding: var(--tmu-space-sm) var(--tmu-space-lg) var(--tmu-space-md);
                font-size: var(--tmu-font-xs); color: var(--tmu-text-panel-label);
            }
            .rnd-league-tt-evt-row {
                display: flex; gap: var(--tmu-space-sm);
                padding: 0 0;
                border-bottom: 1px solid var(--tmu-border-contrast);
            }
            .rnd-league-tt-evt-row:last-child { border-bottom: none; }
            .tt-evt-home {
                flex: 1; text-align: right; color: var(--tmu-text-panel-label);
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .tt-evt-away {
                flex: 1; text-align: left; color: var(--tmu-text-panel-label);
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-league-tt-events .evt-min {
                color: var(--tmu-text-dim); font-weight: 600; font-size: var(--tmu-font-2xs);
            }

            /* ── League Standings ── */
            .rnd-league-tbl {
                width: 100%; border-collapse: collapse;
                font-size: var(--tmu-font-sm);
            }
            .rnd-league-tbl th {
                padding: var(--tmu-space-sm) var(--tmu-space-sm); text-align: center;
                color: var(--tmu-text-faint); font-weight: 700;
                border-bottom: 2px solid var(--tmu-border-soft-alpha-mid);
                font-size: var(--tmu-font-xs); white-space: nowrap;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .rnd-league-tbl th:first-child,
            .rnd-league-tbl td:first-child { text-align: center; width: 48px; }
            .rnd-league-tbl th:nth-child(2),
            .rnd-league-tbl td:nth-child(2) { text-align: left; }
            .rnd-league-tbl td {
                padding: var(--tmu-space-sm) var(--tmu-space-sm); text-align: center;
                color: var(--tmu-text-panel-label); border-bottom: 1px solid var(--tmu-border-contrast);
                white-space: nowrap; font-variant-numeric: tabular-nums;
                font-size: var(--tmu-font-sm);
            }
            .rnd-league-tbl tr {
                transition: background .12s;
            }
            .rnd-league-tbl tr:nth-child(even) {
                background: var(--tmu-surface-overlay-soft);
            }
            .rnd-league-tbl tr:nth-child(odd) {
                background: var(--tmu-border-contrast);
            }
            .rnd-league-tbl tr:hover { background: var(--tmu-surface-overlay-soft); }
            .rnd-league-tbl tr.rnd-league-hl {
                background: var(--tmu-success-fill-soft) !important;
            }
            .rnd-league-tbl tr.rnd-league-hl:hover {
                background: var(--tmu-success-fill-hover) !important;
            }
            .rnd-league-tbl tr.rnd-league-hl td {
                color: var(--tmu-text-accent-soft); font-weight: 600;
            }
            .rnd-league-tbl td.pts {
                color: var(--tmu-text-strong); font-weight: 800; font-size: var(--tmu-font-sm);
            }
            .rnd-league-tbl td.pos-num {
                font-weight: 700; color: var(--tmu-text-faint); font-size: var(--tmu-font-xs);
            }
            .rnd-league-tbl .club-cell {
                display: flex; align-items: center; gap: 6px;
                max-width: 170px; overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-league-tbl .club-logo {
                width: 18px; height: 18px; flex-shrink: 0;
                filter: drop-shadow(0 1px 2px var(--tmu-surface-overlay));
            }
            .rnd-league-tbl .club-name {
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                font-weight: 500;
            }
            .rnd-league-tbl td.gd-pos { color: var(--tmu-success); }
            .rnd-league-tbl td.gd-neg { color: var(--tmu-warning-soft); }
            .rnd-league-tbl td.w-col { color: var(--tmu-success); }
            .rnd-league-tbl td.l-col { color: var(--tmu-warning-soft); }

            /* ── Position arrows ── */
            .pos-arrow {
                display: inline-block; font-size: var(--tmu-font-2xs); margin-left: 3px;
                font-weight: 700; vertical-align: middle;
            }
            .pos-arrow.pos-up { color: var(--tmu-success-strong); }
            .pos-arrow.pos-down { color: var(--tmu-danger-strong); }
            .pos-arrow.pos-same { color: var(--tmu-text-dim); font-size: var(--tmu-font-2xs); }

            /* ── Zone indicators ── */
            .rnd-league-tbl tr.zone-relegation {
                border-left: 3px solid var(--tmu-danger-strong);
            }
            .rnd-league-tbl tr.zone-relegation td:first-child {
                border-left: 3px solid var(--tmu-danger-strong);
            }
            .rnd-league-tbl tr.zone-relegation td {
                color: var(--tmu-danger);
            }
            .rnd-league-tbl tr.zone-relegation td.pos-num {
                color: var(--tmu-danger-strong);
            }
            .rnd-league-tbl tr.zone-playoff {
                border-left: 3px solid var(--tmu-warning-soft);
            }
            .rnd-league-tbl tr.zone-playoff td:first-child {
                border-left: 3px solid var(--tmu-warning-soft);
            }
            .rnd-league-tbl tr.zone-playoff td.pos-num {
                color: var(--tmu-warning-soft);
            }

            /* ── Legend ── */
            .rnd-league-legend {
                 display: flex; gap: var(--tmu-space-lg); padding: var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-xs);
                 font-size: var(--tmu-font-xs); color: var(--tmu-text-faint);
            }
            .legend-item {
                display: flex; align-items: center; gap: 5px;
            }
            .legend-dot {
                width: 10px; height: 10px; border-radius: 2px;
            }
            .legend-dot.legend-rel { background: var(--tmu-danger-strong); }
            .legend-dot.legend-po { background: var(--tmu-warning-soft); }

            /* ── Analysis Tab ── */
            .rnd-analysis-wrap {
                max-width: 100%; padding: 0 0 var(--tmu-space-xl);
            }
            .rnd-an-section {
                margin-bottom: 2px;
                background: var(--tmu-surface-overlay-soft);
                border-bottom: 1px solid var(--tmu-border-soft-alpha);
            }
            .rnd-an-section-head {
                    display: flex; align-items: center; gap: var(--tmu-space-sm);
                padding: var(--tmu-space-md) var(--tmu-space-xl) var(--tmu-space-sm);
                    font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-faint);
                text-transform: uppercase; letter-spacing: 1.5px;
            }
                .rnd-an-section-head .an-icon { font-size: var(--tmu-font-md); }

            /* Form strip */
            .rnd-an-form-row {
                 display: flex; align-items: center; gap: var(--tmu-space-md);
                padding: var(--tmu-space-sm) var(--tmu-space-xl) var(--tmu-space-md);
            }
            .rnd-an-form-side {
                flex: 1; display: flex; align-items: center; gap: 6px;
            }
            .rnd-an-form-side.away { justify-content: flex-end; flex-direction: row-reverse; }
            .rnd-an-form-label {
                font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-panel-label);
                min-width: 40px;
            }
            .rnd-an-form-side.home .rnd-an-form-label { text-align: right; }
            .rnd-an-form-side.away .rnd-an-form-label { text-align: left; }
            .rnd-an-form-dots {
                display: flex; gap: 3px;
            }
            .rnd-an-form-dot {
                 width: 22px; height: 22px; border-radius: var(--tmu-space-xs);
                display: flex; align-items: center; justify-content: center;
                font-size: var(--tmu-font-xs); font-weight: 800; color: var(--tmu-text-inverse);
                text-shadow: 0 1px 2px var(--tmu-surface-overlay);
            }
            .rnd-an-form-dot.w { background: var(--tmu-success); }
            .rnd-an-form-dot.d { background: var(--tmu-warning-soft); }
            .rnd-an-form-dot.l { background: var(--tmu-danger-strong); }
            .rnd-an-form-pts {
                font-size: var(--tmu-font-sm); font-weight: 800; color: var(--tmu-text-accent-soft);
                min-width: 24px; text-align: center;
            }

            /* Form comparison bar */
            .rnd-an-form-bar-wrap {
                padding: 0 var(--tmu-space-xl) var(--tmu-space-md);
            }
            .rnd-an-form-bar {
                display: flex; height: 6px; border-radius: 3px;
                overflow: hidden; background: var(--tmu-surface-overlay); gap: 1px;
            }
            .rnd-an-form-seg {
                border-radius: 3px; transition: width 0.3s;
            }
            .rnd-an-form-seg.home { background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-compare-home-grad-end)); }
            .rnd-an-form-seg.away { background: linear-gradient(90deg, var(--tmu-compare-away-grad-start), var(--tmu-compare-away-grad-end)); }

            /* Strength bars */
            .rnd-an-strength-row {
                display: flex; align-items: center; gap: 0;
                padding: var(--tmu-space-xs) var(--tmu-space-xl);
            }
            .rnd-an-strength-row:nth-child(even) { background: var(--tmu-border-contrast); }
            .rnd-an-str-val {
                min-width: 44px; font-weight: 800; font-size: var(--tmu-font-sm);
                font-variant-numeric: tabular-nums;
            }
            .rnd-an-str-val.home { text-align: right; color: var(--tmu-accent); padding-right: var(--tmu-space-sm); }
            .rnd-an-str-val.away { text-align: left; color: var(--tmu-info-alt); padding-left: var(--tmu-space-sm); }
            .rnd-an-str-val.leading { font-size: var(--tmu-font-md); }
            .rnd-an-str-label {
                min-width: 54px; text-align: center;
                font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-faint);
                text-transform: uppercase; letter-spacing: 0.5px;
            }
            .rnd-an-str-bar {
                 flex: 1; height: 8px; border-radius: var(--tmu-space-xs);
                background: var(--tmu-surface-overlay); overflow: hidden;
            }
            .rnd-an-str-fill {
                 height: 100%; border-radius: var(--tmu-space-xs); transition: width 0.5s ease;
            }
            .rnd-an-str-fill.home { background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-compare-home-grad-end)); float: right; }
            .rnd-an-str-fill.away { background: linear-gradient(90deg, var(--tmu-compare-away-grad-end), var(--tmu-compare-away-grad-start)); }

            /* Key players */
            .rnd-an-keys {
                display: flex; gap: 0; padding: 0;
            }
            .rnd-an-keys-side {
                flex: 1; display: flex; flex-direction: column; gap: 2px;
                padding: var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-md);
            }
            .rnd-an-keys-side.away { border-left: 1px solid var(--tmu-border-soft-alpha); }
            .rnd-an-key-player {
                 display: flex; align-items: center; gap: var(--tmu-space-sm);
                padding: var(--tmu-space-sm) var(--tmu-space-sm); border-radius: 6px;
                transition: background .12s;
            }
            .rnd-an-key-player:nth-child(even) { background: var(--tmu-border-contrast); }
            .rnd-an-key-player:hover { background: var(--tmu-surface-overlay-soft); }
            .rnd-an-key-face {
                width: 36px; height: 36px; border-radius: 50%;
                overflow: hidden; flex-shrink: 0;
                border: 2px solid var(--tmu-border-success);
            }
            .rnd-an-key-face img {
                width: 100%; height: 100%; object-fit: cover; object-position: top;
            }
            .rnd-an-key-info { flex: 1; min-width: 0; }
            .rnd-an-key-name {
                font-size: var(--tmu-font-sm); font-weight: 600; color: var(--tmu-text-main);
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-an-key-meta {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-faint);
            }
            .rnd-an-key-r5 {
                font-size: var(--tmu-font-md); font-weight: 800;
                font-variant-numeric: tabular-nums;
                min-width: 40px; text-align: right;
            }
            .rnd-an-key-rank {
                font-size: var(--tmu-font-lg); font-weight: 800; color: var(--tmu-text-disabled-strong);
                min-width: 20px; text-align: center;
            }

            /* Profile stats grid */
            .rnd-an-profile-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 2px; padding: 0 var(--tmu-space-xl) var(--tmu-space-md);
            }
            .rnd-an-profile-card {
                display: flex; align-items: center; gap: 10px;
                padding: var(--tmu-space-md) var(--tmu-space-md); background: var(--tmu-surface-overlay-soft);
                border-radius: 6px;
            }
            .rnd-an-profile-icon { font-size: var(--tmu-font-lg); }
            .rnd-an-profile-info { flex: 1; }
            .rnd-an-profile-label {
                font-size: var(--tmu-font-2xs); font-weight: 700; color: var(--tmu-text-dim);
                text-transform: uppercase; letter-spacing: 1px;
            }
            .rnd-an-profile-vals {
                 display: flex; gap: var(--tmu-space-sm); margin-top: 2px;
            }
            .rnd-an-profile-val {
                 font-size: var(--tmu-font-md); font-weight: 800;
            }
            .rnd-an-profile-val.home { color: var(--tmu-accent); }
            .rnd-an-profile-val.away { color: var(--tmu-info-alt); }
            .rnd-an-profile-vs {
                 font-size: var(--tmu-font-xs); color: var(--tmu-text-dim); font-weight: 600;
            }

            /* Tactical matchup */
            .rnd-an-tactics {
                display: flex; gap: 0; padding: 0;
            }
            .rnd-an-tactic-side {
                flex: 1; padding: var(--tmu-space-sm) var(--tmu-space-xl) var(--tmu-space-md);
            }
            .rnd-an-tactic-side.away {
                border-left: 1px solid var(--tmu-border-soft-alpha);
            }
            .rnd-an-tactic-team {
                font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-panel-label);
                margin-bottom: 6px;
            }
            .rnd-an-tactic-item {
                 display: flex; align-items: center; gap: 6px;
                 padding: var(--tmu-space-xs) 0; font-size: var(--tmu-font-sm); color: var(--tmu-text-main);
            }
            .rnd-an-tactic-item .t-icon { font-size: var(--tmu-font-sm); width: 20px; text-align: center; }
            .rnd-an-tactic-item .t-label {
                font-size: var(--tmu-font-2xs); color: var(--tmu-text-dim); text-transform: uppercase;
                letter-spacing: 0.5px; min-width: 55px;
            }
            .rnd-an-tactic-item .t-val { font-weight: 700; color: var(--tmu-text-main); }

            /* Unavailable */
            .rnd-an-unavail {
                display: flex; gap: 0; padding: 0;
            }
            .rnd-an-unavail-side {
                flex: 1; padding: var(--tmu-space-sm) var(--tmu-space-xl) var(--tmu-space-md);
            }
            .rnd-an-unavail-side.away {
                border-left: 1px solid var(--tmu-border-soft-alpha);
            }
            .rnd-an-unavail-player {
                 display: flex; align-items: center; gap: 6px;
                 padding: var(--tmu-space-xs) 0; font-size: var(--tmu-font-sm); color: var(--tmu-warning-soft);
            }
            .rnd-an-unavail-none {
                font-size: var(--tmu-font-xs); color: var(--tmu-text-dim); font-style: italic;
                padding: var(--tmu-space-xs) 0;
            }

            /* Prediction */
            .rnd-an-prediction {
                display: flex; flex-direction: column; align-items: center;
                padding: var(--tmu-space-lg) var(--tmu-space-xl) var(--tmu-space-xl); gap: 10px;
            }
            .rnd-an-pred-teams {
                 display: flex; align-items: center; gap: var(--tmu-space-lg); width: 100%;
            }
            .rnd-an-pred-side {
                flex: 1; text-align: center;
            }
            .rnd-an-pred-logo {
                width: 48px; height: 48px;
                filter: drop-shadow(0 2px 6px var(--tmu-surface-overlay));
            }
            .rnd-an-pred-name {
                font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-panel-label);
                 margin-top: var(--tmu-space-xs);
            }
            .rnd-an-pred-pct {
                 font-size: var(--tmu-font-3xl); font-weight: 800; margin-top: 2px;
            }
            .rnd-an-pred-pct.home { color: var(--tmu-accent); }
            .rnd-an-pred-pct.away { color: var(--tmu-info-alt); }
            .rnd-an-pred-pct.draw { color: var(--tmu-warning-soft); }
            .rnd-an-pred-bar-wrap {
                width: 100%; display: flex; gap: 2px;
                height: 10px; border-radius: 5px; overflow: hidden;
            }
            .rnd-an-pred-seg {
                height: 100%; border-radius: 5px; transition: width 0.5s;
            }
            .rnd-an-pred-seg.home { background: linear-gradient(90deg, var(--tmu-compare-home-grad-start), var(--tmu-compare-home-grad-end)); }
            .rnd-an-pred-seg.draw { background: linear-gradient(90deg, var(--tmu-warning-soft), var(--tmu-text-highlight)); }
            .rnd-an-pred-seg.away { background: linear-gradient(90deg, var(--tmu-compare-away-grad-start), var(--tmu-compare-away-grad-end)); }
            .rnd-an-pred-label {
                 font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-faint);
                text-transform: uppercase; letter-spacing: 1px;
                text-align: center;
            }
            .rnd-an-pred-draw {
                text-align: center;
            }
        `;
    document.head.appendChild(style);
};

export const TmMatchStyles = { inject };

