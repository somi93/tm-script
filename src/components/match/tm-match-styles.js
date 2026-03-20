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
                background: rgba(0,0,0,0.65);
                z-index: 10000;
                display: flex; align-items: center; justify-content: center;
            }
            .rnd-dialog {
                background: #1c3410; border: none;
                border-radius: 0; width: 100vw; height: 100vh;
                overflow: hidden; display: flex; flex-direction: column;
            }
            .rnd-dlg-head {
                background: linear-gradient(180deg, #162e0e 0%, #1c3a14 50%, #152c0d 100%);
                padding: 14px 16px 8px;
                position: relative;
                border-bottom: 2px solid rgba(80,160,48,.2);
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
                display: flex; align-items: center; gap: 10px;
                flex: 1; min-width: 0;
            }
            .rnd-dlg-team-group.home { justify-content: flex-end; }
            .rnd-dlg-team-group.away { justify-content: flex-start; }
            .rnd-dlg-team-info {
                display: flex; flex-direction: column; gap: 3px; min-width: 0;
            }
            .rnd-dlg-team-group.home .rnd-dlg-team-info { align-items: flex-end; }
            .rnd-dlg-team-group.away .rnd-dlg-team-info { align-items: flex-start; }
            .rnd-dlg-team {
                color: #eaf6dc; font-weight: 700; font-size: 14px;
                letter-spacing: 0.3px; line-height: 1.2;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                max-width: 200px;
            }
            .rnd-dlg-chips {
                display: flex; gap: 3px; flex-wrap: wrap;
            }
            .rnd-dlg-team-group.home .rnd-dlg-chips { justify-content: flex-end; }
            .rnd-dlg-chip {
                font-size: 8.5px; font-weight: 600; color: #8cb878;
                background: rgba(0,0,0,.35); padding: 1px 5px;
                border-radius: 4px; white-space: nowrap;
                letter-spacing: 0.2px; line-height: 1.4;
                border: 1px solid rgba(255,255,255,.04);
            }
            .rnd-dlg-chip .chip-val { color: #c8e4b0; font-weight: 700; }
            .rnd-dlg-score-block {
                display: flex; flex-direction: column; align-items: center;
                flex-shrink: 0; padding: 0 14px;
            }
            .rnd-dlg-score {
                color: #ffffff; font-weight: 800; font-size: 32px;
                letter-spacing: 3px; line-height: 1;
                text-shadow: 0 0 20px rgba(128,224,64,.2), 0 1px 3px rgba(0,0,0,.5);
            }
            .rnd-dlg-datetime {
                text-align: center; margin-top: 2px;
                font-size: 10.5px; color: #6a9a58; letter-spacing: 0.3px;
                font-weight: 500;
            }
            .rnd-dlg-close {
                position: absolute; top: 6px; right: 6px;
                background: rgba(255,255,255,.05); border: none; border-radius: 50%;
                color: rgba(232,245,216,.4); font-size: 17px; cursor: pointer;
                width: 26px; height: 26px;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s; z-index: 3; line-height: 1;
            }
            .rnd-dlg-close:hover { background: rgba(255,255,255,.15); color: #e8f5d8; transform: scale(1.1); }

            /* ── Live replay ── */
            .rnd-live-bar {
                display: flex; align-items: center; gap: 10px;
                background: #1a3a10; padding: 6px 24px;
                border-bottom: 1px solid #3d6828; justify-content: center;
            }
            .rnd-live-min {
                font-size: 16px; font-weight: 700; color: #80e040;
                min-width: 48px; text-align: center;
                animation: rnd-pulse 1.2s ease-in-out infinite;
            }
            @keyframes rnd-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
            .rnd-live-progress {
                flex: 1; max-width: 400px; height: 6px;
                background: #274a18; border-radius: 3px; overflow: hidden;
            }
            .rnd-live-progress-fill {
                height: 100%; background: linear-gradient(90deg, #4a9030, #80e040);
                border-radius: 3px; transition: width 0.4s;
            }
            .rnd-live-btn {
                background: none; border: 1px solid #5aa838; border-radius: 3px;
                color: #c8e0b4; font-size: 14px; cursor: pointer;
                width: 28px; height: 28px;
                display: flex; align-items: center; justify-content: center;
                transition: background 0.15s;
            }
            .rnd-live-btn:hover { background: rgba(255,255,255,0.1); }
            .rnd-live-label {
                font-size: 11px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 1px; font-weight: 600;
            }
            .rnd-live-ended .rnd-live-min { color: #90b878; animation: none; }
            .rnd-live-feed-line {
                padding: 6px 0; border-bottom: 1px solid #274a18;
                animation: rnd-feedIn 0.4s ease;
            }
            @keyframes rnd-feedIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
            .rnd-live-feed-min {
                font-size: 11px; font-weight: 700; color: #80e040;
                margin-right: 6px;
            }
            .rnd-live-feed-text { color: #c8e0b4; font-size: 13px; }
            .rnd-tabs {
                display: flex; background: #274a18;
                border-bottom: 1px solid #3d6828;
            }
            .rnd-tab {
                flex: 1; padding: 6px 8px; text-align: center;
                font-size: 11px; font-weight: 600; text-transform: uppercase;
                letter-spacing: 0.5px; color: #90b878; cursor: pointer;
                border-bottom: 2px solid transparent; transition: all 0.15s;
            }
            .rnd-tab:hover { color: #c8e0b4; background: #305820; }
            .rnd-tab.active { color: #e8f5d8; border-bottom-color: #6cc040; background: #305820; }
            .rnd-dlg-body {
                overflow-y: auto; padding: 8px 32px;
                flex: 1; color: #c8e0b4; font-size: 13px;
            }
            .rnd-event-row {
                display: flex; align-items: flex-start; gap: 8px;
                padding: 4px 0; border-bottom: 1px solid #325a1e;
            }
            .rnd-event-min { color: #90b878; font-weight: 600; min-width: 28px; text-align: right; }
            .rnd-event-icon { min-width: 18px; text-align: center; }
            .rnd-event-text { flex: 1; color: #c8e0b4; }
            /* ── Venue tab ── */
            .rnd-venue-wrap { max-width: 900px; margin: 0 auto; }
            .rnd-venue-hero {
                position: relative; border-radius: 14px; overflow: hidden;
                background: linear-gradient(135deg, #1a3d0f 0%, #2d5e1a 40%, #1a4a0e 100%);
                margin-bottom: 20px; padding: 30px 24px 24px;
                border: 1px solid #3d6828;
                box-shadow: 0 6px 24px rgba(0,0,0,0.4);
            }
            .rnd-venue-hero::before {
                content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background: repeating-linear-gradient(90deg, transparent, transparent 48%, rgba(255,255,255,0.02) 48%, rgba(255,255,255,0.02) 52%);
                pointer-events: none;
            }
            .rnd-venue-stadium-svg { display: block; margin: 0 auto 20px; opacity: 0.55; }
            .rnd-venue-name {
                text-align: center; font-size: 22px; font-weight: 800; color: #e8f5d8;
                letter-spacing: 0.5px; margin-bottom: 4px; text-shadow: 0 2px 8px rgba(0,0,0,0.3);
            }
            .rnd-venue-city {
                text-align: center; font-size: 13px; color: #a0c888; margin-bottom: 10px;
                letter-spacing: 1px; text-transform: uppercase;
            }
            .rnd-venue-tournament {
                text-align: center; margin-bottom: 0;
            }
            .rnd-venue-tournament span {
                display: inline-block; background: rgba(74,144,48,0.35); padding: 4px 14px;
                border-radius: 20px; font-size: 11px; color: #b8d8a0; letter-spacing: 0.5px;
                border: 1px solid rgba(144,184,120,0.2);
            }
            .rnd-venue-cards {
                display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;
            }
            .rnd-venue-card {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 12px; padding: 16px;
                text-align: center; position: relative; overflow: hidden;
            }
            .rnd-venue-card::after {
                content: ''; position: absolute; top: -20px; right: -20px;
                width: 60px; height: 60px; border-radius: 50%;
                background: rgba(74,144,48,0.1);
            }
            .rnd-venue-card-icon { font-size: 24px; margin-bottom: 6px; }
            .rnd-venue-card-value {
                font-size: 22px; font-weight: 800; color: #e8f5d8; margin-bottom: 2px;
            }
            .rnd-venue-card-label { font-size: 11px; color: #90b878; text-transform: uppercase; letter-spacing: 0.5px; }
            .rnd-venue-gauge-wrap {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 12px; padding: 18px;
                margin-bottom: 16px;
            }
            .rnd-venue-gauge-header {
                display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
            }
            .rnd-venue-gauge-title { font-size: 12px; color: #90b878; text-transform: uppercase; letter-spacing: 0.5px; }
            .rnd-venue-gauge-value { font-size: 14px; font-weight: 700; color: #e8f5d8; }
            .rnd-venue-gauge-bar {
                height: 10px; background: #162e0d; border-radius: 5px; overflow: hidden;
                position: relative;
            }
            .rnd-venue-gauge-fill {
                height: 100%; border-radius: 5px;
                transition: width 0.6s ease;
            }
            .rnd-venue-gauge-fill.attendance {
                background: linear-gradient(90deg, #4a9030, #6cc048, #8ae060);
            }
            .rnd-venue-gauge-fill.pitch {
                background: linear-gradient(90deg, #8B4513, #6aa030, #4a9030);
            }
            .rnd-venue-weather {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 12px; padding: 20px;
                margin-bottom: 16px; display: flex; align-items: center; gap: 18px;
            }
            .rnd-venue-weather-icon { font-size: 48px; line-height: 1; }
            .rnd-venue-weather-info { flex: 1; }
            .rnd-venue-weather-text { font-size: 18px; font-weight: 700; color: #e8f5d8; margin-bottom: 2px; }
            .rnd-venue-weather-sub { font-size: 12px; color: #90b878; }
            .rnd-venue-facilities {
                display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 16px;
            }
            .rnd-venue-facility {
                background: linear-gradient(145deg, #243d18, #1e3414);
                border: 1px solid #3d6828; border-radius: 10px; padding: 12px 8px;
                text-align: center; transition: border-color 0.2s;
            }
            .rnd-venue-facility.active { border-color: #4a9030; background: linear-gradient(145deg, #2a4d1c, #234218); }
            .rnd-venue-facility-icon { font-size: 22px; margin-bottom: 4px; }
            .rnd-venue-facility-label { font-size: 10px; color: #90b878; text-transform: uppercase; letter-spacing: 0.3px; }
            .rnd-venue-facility .rnd-venue-facility-status {
                font-size: 10px; margin-top: 3px; color: #6b8a58; font-weight: 600;
            }
            .rnd-venue-facility.active .rnd-venue-facility-status { color: #8ae060; }

            /* ── Report tab ── */
            .rnd-report-event {
                border-bottom: 1px solid #325a1e; padding: 10px 0;
            }
            .rnd-report-event:last-child { border-bottom: none; }
            .rnd-report-min-header {
                color: #90b878; font-weight: 700; font-size: 12px;
                margin-bottom: 4px; text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .rnd-report-text {
                color: #c8e0b4; font-size: 13px; line-height: 1.6;
            }
            .rnd-report-text .rnd-goal-text { color: #80d848; font-weight: 700; }
            .rnd-report-text .rnd-yellow-text { color: #ffd700; }
            .rnd-report-text .rnd-red-text { color: #ff4c4c; font-weight: 700; }
            .rnd-report-text .rnd-sub-text { color: #5b9bff; }
            .rnd-report-text .rnd-player-name { color: #e8f5d8; font-weight: 600; }

            /* ── Dialog logos ── */
            .rnd-dlg-logo {
                width: 44px; height: 44px; flex-shrink: 0;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,.5));
                object-fit: contain; pointer-events: none;
            }

            /* ── Statistics tab ── */
            .rnd-stats-wrap {
                max-width: 650px; margin: 0 auto; padding: 4px 0 12px;
            }
            .rnd-stats-team-header {
                display: flex; align-items: center; justify-content: space-between;
                padding: 10px 16px 14px; margin-bottom: 4px;
            }
            .rnd-stats-team-side {
                display: flex; align-items: center; gap: 10px;
            }
            .rnd-stats-team-side.away { flex-direction: row-reverse; }
            .rnd-stats-team-logo {
                width: 36px; height: 36px; object-fit: contain;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,.3));
            }
            .rnd-stats-team-name {
                font-weight: 700; font-size: 14px; color: #e8f5d8;
                letter-spacing: 0.2px;
            }
            .rnd-stats-vs {
                font-size: 11px; color: #6a9a55; font-weight: 600;
                text-transform: uppercase; letter-spacing: 1px;
            }
            .rnd-stat-row {
                padding: 10px 16px;
            }
            .rnd-stat-header {
                display: flex; align-items: baseline; justify-content: space-between;
                margin-bottom: 5px;
            }
            .rnd-stat-val {
                font-weight: 800; font-size: 15px; min-width: 32px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-stat-val.home { text-align: left; color: #80e048; }
            .rnd-stat-val.away { text-align: right; color: #5ba8f0; }
            .rnd-stat-val.leading { font-size: 17px; }
            .rnd-stat-label {
                font-weight: 600; color: #8aac72; font-size: 11px;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .rnd-stat-bar-wrap {
                display: flex; height: 7px; border-radius: 4px;
                overflow: hidden; background: rgba(0,0,0,.18);
                gap: 2px;
            }
            .rnd-stat-seg {
                border-radius: 3px;
                transition: width 0.5s cubic-bezier(.4,0,.2,1);
                min-width: 3px;
            }
            .rnd-stat-seg.home {
                background: linear-gradient(90deg, #4a9030, #6cc048);
            }
            .rnd-stat-seg.away {
                background: linear-gradient(90deg, #3a7ab8, #5b9bff);
            }
            .rnd-stat-divider {
                height: 1px; margin: 0 16px;
                background: linear-gradient(90deg, transparent, #3d6828 20%, #3d6828 80%, transparent);
            }
            .rnd-stat-row-highlight {
                background: rgba(60,120,40,.06);
                border-radius: 8px; margin: 2px 8px;
                padding: 10px 12px;
            }

            /* ── Advanced Stats (Attacking Styles) ── */
            .rnd-adv-section {
                margin-top: 16px; padding-top: 12px;
                border-top: 1px solid #3d6828;
            }
            .rnd-adv-title {
                text-align: center; font-size: 11px; font-weight: 700;
                color: #8aac72; text-transform: uppercase; letter-spacing: 1.2px;
                margin-bottom: 10px;
            }
            .rnd-adv-team-label {
                font-size: 11px; font-weight: 700; color: #b0d898;
                text-transform: uppercase; letter-spacing: 0.8px;
                padding: 6px 12px 4px; margin-top: 6px;
            }
            .rnd-mps-wrap {
                padding: 6px 0 2px;
                overflow: hidden;
            }
            .rnd-mps-table {
                width: 100%; table-layout: fixed; border-collapse: collapse;
                background: rgba(18,34,11,.72); border: 1px solid rgba(42,74,28,.8);
                border-radius: 10px; overflow: hidden;
            }
            .rnd-mps-table + .rnd-mps-table { margin-top: 8px; }
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
                padding: 6px 4px;
            }
            .rnd-mps-table tr{    
                border-bottom: 1px solid rgba(42,74,28,.45);
            }
            .rnd-mps-table th {
                font-size: 9px; color: #6a9a58; text-transform: uppercase; letter-spacing: .35px;
                font-weight: 700;
                background: rgba(42,74,28,.28);
            }
            .rnd-mps-table td {
                font-size: 11px; color: #d7e8c7; font-weight: 700;
            }
            .rnd-mps-table th.l, .rnd-mps-table td.l { text-align: left; }
            .rnd-mps-table th.c, .rnd-mps-table td.c { text-align: center; }
            .rnd-mps-row { cursor: pointer; transition: background .15s; }
            .rnd-mps-row:hover { background: rgba(255,255,255,.04); }
            .rnd-mps-name { 
                font-size: 12px; font-weight: 700; color: #e0f0cc;
                min-width: 0; flex: 1 1 auto; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-mps-name-cell {
                display: flex; align-items: center; gap: 6px;
                min-width: 0; white-space: nowrap;
            }
            .rnd-mps-name-cell .tm-pos-chip { flex-shrink: 0; }
            .rnd-mps-pos-cell .tm-pos-chip { vertical-align: middle; }
            .rnd-mps-sub-flag {
                display: inline-block; margin-left: 0; font-size: 11px; font-weight: 800;
                flex-shrink: 0;
                vertical-align: middle;
            }
            .rnd-mps-sub-flag.out { color: #d97a55; }
            .rnd-mps-sub-flag.in { color: #80e048; }
            .rnd-an-note {
                margin-bottom: 14px; padding: 10px 12px;
                background: rgba(42,74,28,.26); border: 1px solid rgba(74,144,48,.25);
                border-radius: 10px; color: #b9d7a7; font-size: 12px;
            }
            .rnd-adv-table {
                width: 100%; border-collapse: collapse; font-size: 12px;
            }
            .rnd-adv-table th {
                padding: 5px 8px; font-size: 10px; font-weight: 700;
                color: #6a9a58; text-transform: uppercase; letter-spacing: 0.5px;
                border-bottom: 1px solid #2a4a1c; text-align: center;
            }
            .rnd-adv-table th:first-child { text-align: left; }
            .rnd-adv-row {
                cursor: pointer; transition: background 0.15s;
            }
            .rnd-adv-row:hover { background: rgba(255,255,255,.04); }
            .rnd-adv-row td {
                padding: 5px 8px; text-align: center;
                border-bottom: 1px solid rgba(42,74,28,.5);
                font-variant-numeric: tabular-nums;
            }
            .rnd-adv-row td:first-child {
                text-align: left; font-weight: 600; color: #c8e0b4;
            }
            .rnd-adv-row td.adv-zero { color: #4a6a3a; }
            .rnd-adv-row td.adv-goal { color: #80e048; font-weight: 700; }
            .rnd-adv-row td.adv-shot { color: #c8d868; }
            .rnd-adv-row td.adv-lost { color: #c87848; }
            .rnd-adv-row .adv-arrow {
                display: inline-block; font-size: 9px; margin-left: 4px;
                transition: transform 0.2s; color: #6a9a58;
            }
            .rnd-adv-row.expanded .adv-arrow { transform: rotate(90deg); }
            .rnd-adv-row.rnd-adv-total td {
                font-weight: 800; border-top: 1px solid #3d6828;
                color: #e0f0cc; cursor: default;
            }
            .rnd-adv-row.rnd-adv-total td:first-child { color: #8aac72; }
            .rnd-adv-events {
                display: none;
            }
            .rnd-adv-events.visible { display: table-row; }
            .rnd-adv-events td {
                padding: 0; border-bottom: 1px solid rgba(42,74,28,.3);
            }
            .rnd-adv-evt-list {
                padding: 4px 0 6px 0; font-size: 11px;
            }
            .rnd-adv-evt {
                padding: 2px 0; color: #a0c088;
                display: flex; align-items: stretch; gap: 0;
                border-bottom: 1px solid rgba(42,74,28,.25);
            }
            .rnd-adv-evt:last-child { border-bottom: none; }
            .rnd-adv-evt .adv-result-tag {
                font-size: 9px; font-weight: 700; padding: 6px 5px 0;
                text-transform: uppercase; white-space: nowrap;
                min-width: 52px; text-align: center;
                align-self: flex-start;
            }
            .rnd-adv-evt .adv-result-tag.goal { color: #80e048; }
            .rnd-adv-evt .adv-result-tag.shot { color: #c8d868; }
            .rnd-adv-evt .adv-result-tag.lost { color: #c87848; }
            .rnd-adv-evt .rnd-acc { flex: 1; border-bottom: none; }
            .rnd-adv-evt .rnd-acc-head { padding: 4px 6px; min-height: auto; }
            .rnd-adv-evt .rnd-acc-min { font-size: 11px; min-width: 28px; }
            .rnd-adv-evt .rnd-acc-body { padding: 0 6px 6px; }
            .rnd-adv-evt .rnd-player-name { color: #e0f0cc; font-weight: 600; }

            /* ── Player Card Dialog ── */
            .rnd-plr-overlay {
                position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,.7); z-index: 100002;
                display: flex; align-items: center; justify-content: center;
                animation: rndFadeIn .15s ease;
            }
            .rnd-plr-dialog {
                background: linear-gradient(160deg, #1a3d0f 0%, #0e2508 60%, #122a0a 100%);
                border: 1px solid #3d6828; border-radius: 14px;
                width: 820px; max-width: 96vw; max-height: 88vh;
                overflow-y: auto; color: #c8e0b4;
                box-shadow: 0 12px 60px rgba(0,0,0,.7), 0 0 0 1px rgba(74,144,48,.15);
            }
            .rnd-plr-header {
                display: flex; align-items: center; gap: 16px;
                padding: 20px 24px 16px;
                background: linear-gradient(180deg, rgba(42,74,28,.3) 0%, transparent 100%);
                border-bottom: 1px solid #2a4a1c; position: relative;
            }
            .rnd-plr-header-main {
                flex: 1; min-width: 0;
                display: flex; align-items: center; justify-content: space-between; gap: 18px;
            }
            .rnd-plr-face {
                width: 84px; height: 84px; border-radius: 50%;
                border: 3px solid #4a9030; overflow: hidden;
                flex-shrink: 0; background: #0e200a;
                box-shadow: 0 4px 16px rgba(0,0,0,.4);
            }
            .rnd-plr-face img { width: 100%; height: 100%; object-fit: cover; }
            .rnd-plr-info { flex: 1; min-width: 0; }
            .rnd-plr-name-row {
                display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
            }
            .rnd-plr-name {
                font-size: 20px; font-weight: 800; color: #e0f0cc;
                text-decoration: none; cursor: pointer;
            }
            .rnd-plr-name:hover { color: #fff; text-decoration: underline; }
            .rnd-plr-link {
                color: #6a9a58; font-size: 14px; text-decoration: none;
                transition: color .15s;
            }
            .rnd-plr-link:hover { color: #80e048; }
            .rnd-plr-badges {
                display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px;
            }
            .rnd-plr-badge {
                display: inline-flex; align-items: center; gap: 4px;
                background: rgba(42,74,28,.5); border: 1px solid #2a4a1c;
                border-radius: 12px; padding: 2px 8px;
                font-size: 11px; color: #8aac72;
            }
            .rnd-plr-badge .badge-icon { font-size: 12px; }
            .rnd-plr-kpis {
                display: grid; grid-template-columns: repeat(2, minmax(72px, 1fr));
                gap: 8px; flex-shrink: 0;
            }
            .rnd-plr-kpi {
                min-width: 72px; text-align: center;
                padding: 10px 10px 8px;
                background: linear-gradient(180deg, rgba(0,0,0,.16), rgba(42,74,28,.24));
                border: 1px solid rgba(74,144,48,.2); border-radius: 10px;
                box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
            }
            .rnd-plr-kpi-val {
                font-size: 28px; font-weight: 900; line-height: 1;
            }
            .rnd-plr-kpi-lbl {
                font-size: 9px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 0.5px; margin-top: 3px;
            }
            .rnd-plr-close {
                position: absolute; top: 10px; right: 14px;
                background: rgba(42,74,28,.4); border: 1px solid #2a4a1c;
                color: #8aac72; width: 28px; height: 28px; border-radius: 50%;
                font-size: 16px; cursor: pointer; display: flex;
                align-items: center; justify-content: center;
                transition: all .15s;
            }
            .rnd-plr-close:hover { background: rgba(74,144,48,.3); color: #e0f0cc; }
            .rnd-plr-body { padding: 16px 24px 20px; }
            .rnd-plr-body-section {
                background: linear-gradient(180deg, rgba(18,34,11,.72), rgba(9,20,6,.72));
                border: 1px solid rgba(42,74,28,.9);
                border-radius: 12px; padding: 12px 14px; margin-bottom: 14px;
                box-shadow: inset 0 1px 0 rgba(255,255,255,.03);
            }
            .rnd-plr-stats-row {
                display: grid; grid-template-columns: repeat(5, 1fr);
                gap: 8px; margin-bottom: 16px;
            }
            .rnd-plr-stat-card {
                background: rgba(42,74,28,.35); border: 1px solid #2a4a1c;
                border-radius: 8px; padding: 10px 4px 8px;
                text-align: center; transition: background .15s;
            }
            .rnd-plr-stat-card:hover { background: rgba(42,74,28,.55); }
            .rnd-plr-stat-icon { font-size: 16px; margin-bottom: 2px; }
            .rnd-plr-stat-val {
                font-size: 22px; font-weight: 800; color: #e0f0cc; line-height: 1.1;
            }
            .rnd-plr-stat-lbl {
                font-size: 9px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 0.3px; margin-top: 2px;
            }
            .rnd-plr-stat-card.green .rnd-plr-stat-val { color: #66dd44; }
            .rnd-plr-stat-card.red .rnd-plr-stat-val { color: #ee6633; }
            .rnd-plr-stat-card.gold .rnd-plr-stat-val { color: #f0d040; }
            .rnd-plr-section-title {
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 1px;
                margin: 14px 0 8px; padding-bottom: 5px;
                border-bottom: 1px solid #2a4a1c;
                display: flex; align-items: center; gap: 6px;
            }
            .rnd-plr-section-title .sec-icon { font-size: 13px; }

            /* ── Match Actions list ── */
            .rnd-act-list {
                background: rgba(42,74,28,.2); border: 1px solid #2a4a1c;
                border-radius: 8px; padding: 4px 0; margin-bottom: 16px;
            }
            .rnd-act-row {
                display: flex; align-items: baseline; gap: 10px;
                padding: 5px 12px; border-bottom: 1px solid rgba(42,74,28,.4);
            }
            .rnd-act-row:last-child { border-bottom: none; }
            .rnd-act-min {
                font-size: 10px; font-weight: 700; color: #90b878;
                min-width: 26px; flex-shrink: 0;
            }
            .rnd-act-labels { font-size: 11px; color: #c8e0b4; flex: 1; }
            .rnd-act-sep { color: #4a7a38; margin: 0 5px; }

            /* ── Player compact stats grid ── */
            .rnd-pls-wrap { margin-bottom: 0; }
            .rnd-pls-row {
                display: grid; grid-template-columns: repeat(auto-fit, minmax(62px, 1fr));
                gap: 6px;
                margin-bottom: 8px;
                background: rgba(42,74,28,.18); border: 1px solid rgba(42,74,28,.7);
                border-radius: 10px; padding: 8px;
            }
            .rnd-pls-row:last-child { margin-bottom: 0; }
            .rnd-pls-cell {
                display: flex; flex-direction: column; align-items: center;
                min-width: 0; padding: 6px 4px; text-align: center;
                background: rgba(0,0,0,.12); border-radius: 8px;
            }
            .rnd-pls-icon { font-size: 12px; line-height: 1; margin-bottom: 2px; }
            .rnd-pls-val  { font-size: 18px; font-weight: 800; color: #e0f0cc; line-height: 1.1; }
            .rnd-pls-lbl  { font-size: 8px; color: #6a9a58; text-transform: uppercase; letter-spacing: .3px; margin-top: 2px; white-space: nowrap; }
            .rnd-pls-cell.hi-gold  .rnd-pls-val { color: #f0d040; }
            .rnd-pls-cell.hi-green .rnd-pls-val { color: #66dd44; }
            .rnd-pls-cell.hi-red   .rnd-pls-val { color: #ee6633; }

            /* ── Player Card Profile Section ── */
            .rnd-plr-profile-wrap {
                background: rgba(42,74,28,.25); border: 1px solid #2a4a1c;
                border-radius: 10px; padding: 12px 14px; margin-bottom: 16px;
            }
            .rnd-plr-country-row {
                display: flex; align-items: center; gap: 6px;
                margin-bottom: 10px; padding-bottom: 8px;
                border-bottom: 1px solid rgba(42,74,28,.4);
            }
            .rnd-plr-country-flag {
                height: 14px; vertical-align: -1px;
            }
            .rnd-plr-country-name {
                font-size: 11px; color: #8aac72; font-weight: 600;
            }
            .rnd-plr-skills-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 0 20px; margin-bottom: 12px;
            }
            .rnd-plr-skill-row {
                display: flex; align-items: center; justify-content: space-between;
                padding: 2px 6px; border-radius: 3px;
                transition: background .1s;
            }
            .rnd-plr-skill-row:hover { background: rgba(42,74,28,.4); }
            .rnd-plr-skill-name {
                font-size: 10px; color: #8abc78; font-weight: 600;
                text-transform: uppercase; letter-spacing: .3px;
            }
            .rnd-plr-skill-val {
                font-size: 12px; font-weight: 800; min-width: 22px;
                text-align: right;
            }
            .rnd-plr-skill-star { color: #d4af37; }
            .rnd-plr-skill-star.silver { color: #c0c0c0; }
            .rnd-plr-profile-footer {
                display: grid; grid-template-columns: repeat(4, 1fr);
                gap: 8px; padding-top: 10px;
                border-top: 1px solid rgba(42,74,28,.4);
            }
            .rnd-plr-profile-stat {
                text-align: center; padding: 6px 4px;
                background: rgba(0,0,0,.15); border-radius: 6px;
            }
            .rnd-plr-profile-stat-val {
                font-size: 16px; font-weight: 800; line-height: 1.2;
            }
            .rnd-plr-profile-stat-lbl {
                font-size: 8px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: .5px; margin-top: 2px; font-weight: 700;
            }

            /* ── Tactics cards ── */
            .rnd-tactics-section {
                margin-top: 6px; padding: 6px;
                background: linear-gradient(180deg, rgba(20,40,14,.6), rgba(16,32,10,.8));
                border-radius: 8px; border: 1px solid #2a4a1c;
            }
            .rnd-tactics-grid { display: flex; flex-direction: column; gap: 0; }
            .rnd-tactic-row {
                display: flex; align-items: center; gap: 6px;
                padding: 5px 8px;
                border-bottom: 1px solid rgba(60,100,40,.15);
            }
            .rnd-tactic-row:last-child { border-bottom: none; }
            .rnd-tactic-row.r5-row {
                padding: 7px 8px; margin-bottom: 2px;
                background: rgba(0,0,0,.12); border-radius: 6px;
                border-bottom: none;
            }
            .rnd-tactic-icon {
                font-size: 12px; line-height: 1; width: 18px;
                text-align: center; flex-shrink: 0;
            }
            .rnd-tactic-label {
                font-size: 9px; color: #7a9a68; text-transform: uppercase;
                letter-spacing: 0.6px; font-weight: 700; min-width: 52px;
                flex-shrink: 0;
            }
            .rnd-tactic-meter {
                flex: 1; height: 4px; background: rgba(0,0,0,.25); border-radius: 2px;
                overflow: hidden;
            }
            .rnd-tactic-meter-fill {
                height: 100%; border-radius: 2px; transition: width 0.4s ease;
            }
            .rnd-tactic-meter-fill.home { background: linear-gradient(90deg, #3a7025, #6cc048); }
            .rnd-tactic-meter-fill.away { background: linear-gradient(90deg, #3a70b0, #5b9bff); }
            .rnd-tactic-value {
                font-size: 10px; font-weight: 700; color: #d0e8c0;
                min-width: 0; text-align: right;
                white-space: nowrap;
            }
            .rnd-tactic-value-pill {
                font-size: 9px; font-weight: 700; padding: 1px 6px;
                border-radius: 4px; white-space: nowrap;
            }
            .rnd-tactic-value-pill.home {
                background: rgba(80,160,50,.15); color: #80d848;
            }
            .rnd-tactic-value-pill.away {
                background: rgba(60,120,200,.15); color: #6ab0ff;
            }
            .rnd-tactic-focus-icon {
                font-size: 13px; line-height: 1;
            }

            /* ── Report event badges ── */
            .rnd-report-evt-badge {
                display: inline-flex; align-items: center; gap: 6px;
                padding: 5px 12px; border-radius: 4px; margin-bottom: 6px;
                font-size: 12px; font-weight: 600;
            }
            .rnd-report-evt-badge.evt-goal { background: rgba(80,200,60,0.15); color: #80d848; }
            .rnd-report-evt-badge.evt-yellow { background: rgba(255,215,0,0.12); color: #ffd700; }
            .rnd-report-evt-badge.evt-red { background: rgba(255,76,76,0.12); color: #ff4c4c; }
            .rnd-report-evt-badge.evt-sub { background: rgba(91,155,255,0.12); color: #5b9bff; }
            .rnd-report-evt-badge.evt-injury { background: rgba(255,140,60,0.12); color: #ff8c3c; }

            /* ── Details timeline ── */
            .rnd-timeline { margin-top: 16px; }
            .rnd-tl-row {
                display: flex; align-items: center;
                border-bottom: 1px solid #325a1e;
                padding: 8px 0; min-height: 32px;
            }
            .rnd-tl-row:last-child { border-bottom: none; }
            .rnd-tl-goal { background: rgba(80,200,60,0.08); }
            .rnd-tl-home {
                flex: 1; text-align: right; padding-right: 14px;
                color: #e0f0cc; font-size: 13px;
            }
            .rnd-tl-min {
                width: 44px; text-align: center; flex-shrink: 0;
                color: #90b878; font-weight: 700; font-size: 12px;
                background: #274a18; border-radius: 3px; padding: 2px 0;
            }
            .rnd-tl-away {
                flex: 1; text-align: left; padding-left: 14px;
                color: #e0f0cc; font-size: 13px;
            }

            /* ── Report accordion ── */
            .rnd-acc { border-bottom: 1px solid #325a1e; }
            .rnd-acc:last-child { border-bottom: none; }
            .rnd-acc-head {
                display: flex; align-items: center;
                padding: 8px 0; min-height: 32px; cursor: pointer;
                transition: background 0.15s;
            }
            .rnd-acc-head:hover { background: rgba(255,255,255,0.03); }
            .rnd-acc-goal { background: rgba(80,200,60,0.08); }
            .rnd-acc-home {
                flex: 1; text-align: right; padding-right: 14px;
                color: #e0f0cc; font-size: 13px;
            }
            .rnd-acc-min {
                width: 44px; text-align: center; flex-shrink: 0;
                color: #90b878; font-weight: 700; font-size: 12px;
                background: #274a18; border-radius: 3px; padding: 2px 0;
            }
            .rnd-acc-away {
                flex: 1; text-align: left; padding-left: 14px;
                color: #e0f0cc; font-size: 13px;
            }
            .rnd-acc-body {
                display: none; padding: 8px 14px 12px;
                background: rgba(0,0,0,0.15); border-radius: 0 0 4px 4px;
            }
            .rnd-acc.open .rnd-acc-body { display: block; }
            .rnd-acc-chevron {
                width: 14px; height: 14px; flex-shrink: 0;
                fill: #5a7a48; transition: transform 0.2s;
                margin: 0 4px;
            }
            .rnd-acc.open .rnd-acc-chevron { transform: rotate(90deg); }

            /* ── Lineups tab ── */
            .rnd-lu-outer { display: flex; flex-direction: column; }
            .rnd-lu-wrap { display: flex; gap: 0; }
            .rnd-lu-list {
                flex: 0 0 25%; font-size: 12px;
                padding: 0 8px; box-sizing: border-box;
            }
            .rnd-lu-list-title {
                font-weight: 700; font-size: 13px; color: #e8f5d8;
                padding: 6px 0; border-bottom: 1px solid #3d6828;
                margin-bottom: 4px; display: flex; align-items: center; gap: 8px;
            }
            .rnd-lu-list-title img { width: 24px; height: 24px; }
            .rnd-lu-badge {
                font-size: 10px; font-weight: 600; color: #b8d8a0; background: rgba(0,0,0,.2);
                padding: 2px 6px; border-radius: 3px; margin-left: auto; white-space: nowrap;
            }
            .rnd-lu-badge + .rnd-lu-badge { margin-left: 4px; }
            .rnd-lu-player {
                display: flex; align-items: center; gap: 6px;
                padding: 4px 0; border-bottom: 1px solid #274a18;
            }
            .rnd-lu-player:last-child { border-bottom: none; }
            .rnd-lu-clickable { cursor: pointer; transition: background .15s; }
            .rnd-lu-clickable:hover { background: rgba(74,144,48,.15); }
            .rnd-lu-name { flex: 1; color: #c8e0b4; font-size: 12px; }
            .rnd-lu-pos { color: #90b878; font-size: 10px; text-transform: uppercase; width: 30px; text-align: center; }
            .rnd-lu-rating { font-weight: 700; font-size: 12px; width: 32px; text-align: right; }
            .rnd-lu-r5 {
                font-weight: 700; font-size: 10px; min-width: 36px;
                text-align: center; border-radius: 10px;
                padding: 1px 5px; color: #fff; flex-shrink: 0;
                background: #3a5a2a;
            }
            .rnd-lu-sub-header {
                font-size: 11px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 1px; padding: 8px 0 4px; font-weight: 600;
            }
            .rnd-lu-captain {
                font-size: 10px; font-weight: 800; color: #ffd700;
                margin-left: 2px;
            }
            .rnd-lu-mom {
                font-size: 10px; margin-left: 2px;
            }
            .rnd-pitch-captain {
                position: absolute; top: 50%; left: 50%;
                transform: translate(30%, -100%);
                font-size: 9px; font-weight: 900; color: #fff;
                background: #d4a017; border-radius: 50%;
                width: 16px; height: 16px;
                display: flex; align-items: center; justify-content: center;
                z-index: 4; box-shadow: 0 1px 3px rgba(0,0,0,0.5);
                border: 1.5px solid #ffd700;
            }
            .rnd-pitch-mom {
                position: absolute; top: 50%; left: 50%;
                transform: translate(-130%, -100%);
                font-size: 12px; z-index: 4;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.6));
            }

            /* Pitch */
            .rnd-pitch-wrap { flex: 0 0 50%; display: flex; flex-direction: column; align-items: center; justify-content: start; gap: 8px; }
            /* Unity 3D viewport row: feed | viewport | stats */
            .rnd-unity-row {
                display: flex; gap: 0; width: 100%;
                margin-bottom: 8px; align-items: stretch;
            }
            .rnd-unity-feed {
                flex: 0 0 25%; min-width: 0; display: flex; flex-direction: column;
                gap: 3px; overflow-y: auto; overflow-x: hidden;
                scrollbar-width: none; /* Firefox */
                padding: 6px 8px; box-sizing: border-box;
                min-height: 200px; /* expanded by JS (syncUnityPanelHeights) when Unity is active */
            }
            .rnd-unity-feed::-webkit-scrollbar { display: none; } /* Chrome/Edge */
            .rnd-unity-feed-line {
                display: flex; align-items: baseline; gap: 5px;
                font-size: 13px; color: #b8d8a0; line-height: 1.4;
                padding: 2px 0;
                animation: rnd-fade-in 0.4s ease;
            }
            .rnd-unity-feed-min {
                font-size: 9px; font-weight: 700; color: #80e040;
                background: rgba(0,0,0,0.3); border-radius: 3px;
                padding: 1px 4px; white-space: nowrap; flex-shrink: 0;
            }
            .rnd-unity-feed-text { color: #c8e0b4; }
            .rnd-unity-feed-text .rnd-player-name { color: #e8f5d8; font-weight: 600; }
            @keyframes rnd-fade-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
            .rnd-unity-stats {
                flex: 0 0 25%; display: flex; flex-direction: column;
                gap: 0; padding: 6px; box-sizing: border-box;
                font-size: 11px; overflow-y: auto;
                background: rgba(16,32,10,.4);
                border-radius: 8px; border: 1px solid rgba(60,100,40,.2);
                min-height: 200px;
            }
            /* When Unity viewport is hidden: expand feed+stats to fill the full row */
            .rnd-unity-row.rnd-no-unity { gap: 8px; }
            .rnd-unity-row.rnd-no-unity .rnd-unity-feed,
            .rnd-unity-row.rnd-no-unity .rnd-unity-stats { flex: 0 0 calc(50% - 4px); }
            .rnd-unity-stat-row {
                padding: 5px 6px;
                border-bottom: 1px solid rgba(60,100,40,.12);
                transition: background .2s;
            }
            .rnd-unity-stat-row:last-child { border-bottom: none; }
            .rnd-unity-stat-row:hover { background: rgba(60,120,40,.08); }
            .rnd-unity-stat-hdr {
                display: flex; align-items: center; justify-content: space-between;
                margin-bottom: 3px;
            }
            .rnd-unity-stat-hdr .val {
                font-weight: 800; font-size: 13px; min-width: 18px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-unity-stat-hdr .val.home { text-align: left; color: #80e048; }
            .rnd-unity-stat-hdr .val.away { text-align: right; color: #5ba8f0; }
            .rnd-unity-stat-hdr .val.lead { font-size: 15px; }
            .rnd-unity-stat-label {
                font-size: 8px; color: #6a9a55; text-transform: uppercase;
                letter-spacing: 0.8px; font-weight: 700; text-align: center; flex: 1;
            }
            .rnd-unity-stat-bar {
                display: flex; height: 5px; border-radius: 3px; overflow: hidden;
                background: rgba(0,0,0,.2); gap: 2px;
            }
            .rnd-unity-stat-bar .seg {
                transition: width 0.5s cubic-bezier(.4,0,.2,1);
                min-width: 2px; border-radius: 2px;
            }
            .rnd-unity-stat-bar .seg.home { background: linear-gradient(90deg, #4a9030, #6cc048); }
            .rnd-unity-stat-bar .seg.away { background: linear-gradient(90deg, #3a7ab8, #5b9bff); }
            .rnd-unity-viewport {
                position: relative; border: 2px solid #4a9030;
                border-radius: 8px; overflow: hidden;
                background: #0a0a0a;
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
                display: none; gap: 8px; align-items: center;
                justify-content: center; margin-top: 6px;
                padding-top: 6px;
                border-top: 1px solid rgba(80,160,48,.12);
            }
            .rnd-dlg-head.rnd-live-active .rnd-dlg-head-time { display: flex; }
            .rnd-dlg-head-time .rnd-live-min {
                font-size: 14px; font-weight: 800; color: #80e040;
                background: rgba(0,0,0,.45); padding: 2px 10px;
                border-radius: 8px; min-width: 48px; text-align: center;
                letter-spacing: 0.5px;
                box-shadow: 0 0 10px rgba(128,224,64,.15);
                animation: rnd-pulse 1.2s ease-in-out infinite;
            }
            .rnd-dlg-head-time .rnd-live-progress {
                flex: 1; max-width: 180px; height: 4px;
                background: rgba(0,0,0,.4); border-radius: 2px; overflow: hidden;
            }
            .rnd-dlg-head-time .rnd-live-progress-fill {
                height: 100%; border-radius: 2px; transition: width 0.4s;
                background: linear-gradient(90deg, #4a9030, #80e040);
                box-shadow: 0 0 6px rgba(128,224,64,.3);
            }
            .rnd-dlg-head-time .rnd-live-btn {
                background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
                border-radius: 50%; color: #a0d090; font-size: 12px;
                cursor: pointer; width: 26px; height: 26px;
                display: flex; align-items: center; justify-content: center;
                transition: all 0.2s;
            }
            .rnd-dlg-head-time .rnd-live-btn:hover {
                background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.25);
                transform: scale(1.1);
            }
            .rnd-live-filter-group {
                display: flex; gap: 1px;
                background: rgba(0,0,0,.35); border-radius: 10px;
                padding: 2px;
            }
            .rnd-live-filter-btn {
                background: none; border: none; border-radius: 8px;
                color: #7aaa68; font-size: 10px; font-weight: 600;
                cursor: pointer; padding: 2px 8px;
                transition: all 0.2s; white-space: nowrap;
                letter-spacing: 0.3px; text-transform: uppercase;
            }
            .rnd-live-filter-btn:hover { color: #b8dca8; }
            .rnd-live-filter-btn.active {
                background: rgba(108,192,64,.2); color: #80e040;
                box-shadow: 0 0 6px rgba(128,224,64,.15);
            }
            .rnd-live-filter-btn.live-btn.active {
                background: rgba(220,40,40,.2); color: #ff4444;
                box-shadow: 0 0 8px rgba(255,60,60,.25);
            }
            .rnd-live-filter-btn.live-btn::before {
                content: ''; display: inline-block;
                width: 6px; height: 6px; border-radius: 50%;
                background: #ff4444; margin-right: 4px;
                vertical-align: middle;
            }
            .rnd-live-filter-btn.live-btn.active::before {
                animation: rnd-live-dot 1.2s ease-in-out infinite;
            }
            @keyframes rnd-live-dot { 0%,100%{opacity:1} 50%{opacity:.3} }
            .rnd-live-filter-btn:disabled {
                opacity: 0.35; cursor: not-allowed;
                pointer-events: none;
            }
            .rnd-r5-compare { display: flex; gap: 12px; width: 100%; justify-content: center; align-items: center; }
            .rnd-r5-side { display: flex; align-items: center; gap: 6px; flex: 1; }
            .rnd-r5-side.away { flex-direction: row-reverse; }
            .rnd-r5-side-label { font-size: 11px; color: #8ab87a; white-space: nowrap; font-weight: 600; }
            .rnd-r5-side-meter { flex: 1; height: 8px; background: rgba(0,0,0,.25); border-radius: 4px; overflow: hidden; }
            .rnd-r5-side-meter-fill { height: 100%; border-radius: 4px; transition: width .6s ease; }
            .rnd-r5-side-meter-fill.home { background: linear-gradient(90deg, #6cbf4a, #a8e06a); }
            .rnd-r5-side-meter-fill.away { background: linear-gradient(90deg, #e06a6a, #f0a0a0); }
            .rnd-r5-side-val { font-size: 13px; font-weight: 700; min-width: 32px; text-align: center; }
            .rnd-pitch {
                position: relative; width: 100%;
                background: linear-gradient(90deg, #2d6b1e 0%, #357a22 50%, #2d6b1e 100%);
                border: 2px solid #4a9030; border-radius: 6px; overflow: hidden;
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
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
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
                font-size: 10px; color: #fff;
                text-shadow: 0 1px 3px rgba(0,0,0,0.9);
                white-space: nowrap;
                text-align: center;
                font-weight: 600; line-height: 1.2;
            }
            .rnd-pitch-rating {
                font-size: 9px; font-weight: 700;
                padding: 0 3px; border-radius: 3px;
                background: rgba(0,0,0,0.4); line-height: 1.3;
            }
            .rnd-pitch-events {
                display: flex; gap: 1px; flex-wrap: wrap;
                justify-content: center; font-size: 9px;
            }
            /* ── Pitch hover tooltip ── */
            .rnd-pitch-cell[data-pid] { cursor: pointer; }
            .rnd-pitch-tooltip {
                position: fixed; z-index: 100001;
                background: linear-gradient(135deg, #1a2e14 0%, #243a1a 100%);
                border: 1px solid #4a9030; border-radius: 8px;
                padding: 10px 12px; min-width: 200px; max-width: 280px;
                box-shadow: 0 6px 24px rgba(0,0,0,0.6);
                pointer-events: none; font-size: 11px; color: #c8e0b4;
                opacity: 0; transition: opacity .15s ease;
            }
            .rnd-pitch-tooltip.visible { opacity: 1; }
            .rnd-pitch-tooltip-header {
                display: flex; align-items: center; gap: 8px;
                margin-bottom: 8px; padding-bottom: 6px;
                border-bottom: 1px solid rgba(74,144,48,0.3);
            }
            .rnd-pitch-tooltip-name { font-size: 13px; font-weight: 700; color: #e0f0cc; }
            .rnd-pitch-tooltip-pos { font-size: 10px; color: #8abc78; font-weight: 600; }
            .rnd-pitch-tooltip-badges { display: flex; gap: 6px; margin-left: auto; }
            .rnd-pitch-tooltip-badge {
                font-size: 10px; font-weight: 700; padding: 2px 6px;
                border-radius: 4px; background: rgba(0,0,0,0.3);
            }
            .rnd-pitch-tooltip-skills {
                display: flex; gap: 12px; margin-bottom: 6px;
            }
            .rnd-pitch-tooltip-skills-col {
                flex: 1; min-width: 0;
            }
            .rnd-pitch-tooltip-skill {
                display: flex; justify-content: space-between;
                padding: 1px 0; border-bottom: 1px solid rgba(74,144,48,0.12);
            }
            .rnd-pitch-tooltip-skill-name { color: #8abc78; font-size: 10px; }
            .rnd-pitch-tooltip-skill-val { font-weight: 700; font-size: 11px; }
            .rnd-pitch-tooltip-footer {
                display: flex; gap: 8px; justify-content: center;
                padding-top: 6px; border-top: 1px solid rgba(74,144,48,0.3);
            }
            .rnd-pitch-tooltip-stat {
                text-align: center;
            }
            .rnd-pitch-tooltip-stat-val { font-size: 14px; font-weight: 800; }
            .rnd-pitch-tooltip-stat-lbl { font-size: 9px; color: #6a9a58; text-transform: uppercase; }
            .rnd-lu-events {
                display: flex; gap: 1px; flex-shrink: 0; font-size: 11px;
                margin-left: 2px;
            }

            /* H2H tab */
            .rnd-h2h-wrap { max-width: 640px; margin: 0 auto; padding: 8px 0 16px; }

            /* ── Summary cards ── */
            .rnd-h2h-summary {
                display: flex; gap: 10px; margin-bottom: 16px;
                justify-content: center;
            }
            .rnd-h2h-section {
                flex: 1; background: rgba(0,0,0,.2);
                border-radius: 10px; padding: 14px 16px 10px;
                text-align: center; border: 1px solid rgba(255,255,255,.04);
            }
            .rnd-h2h-section-title {
                font-size: 10px; color: #6a9a58; text-transform: uppercase;
                letter-spacing: 1.2px; margin-bottom: 10px; font-weight: 700;
            }
            .rnd-h2h-bar-wrap {
                display: flex; height: 28px; border-radius: 6px;
                overflow: hidden; margin-bottom: 8px;
                background: rgba(0,0,0,.2);
            }
            .rnd-h2h-bar {
                display: flex; align-items: center; justify-content: center;
                font-size: 12px; font-weight: 800; color: #fff;
                min-width: 30px; transition: width 0.5s ease;
            }
            .rnd-h2h-bar.home { background: linear-gradient(135deg, #3d8a28, #5ab03a); }
            .rnd-h2h-bar.draw { background: rgba(255,255,255,.08); color: #8a9a7a; }
            .rnd-h2h-bar.away { background: linear-gradient(135deg, #2a6aa0, #4a8ac8); }
            .rnd-h2h-legend {
                display: flex; justify-content: space-between;
                font-size: 10px; color: #7aaa68; font-weight: 500;
            }

            /* ── Overall record strip ── */
            .rnd-h2h-record {
                display: flex; align-items: center; justify-content: center;
                gap: 24px; padding: 10px 0 14px;
                border-bottom: 1px solid rgba(80,160,48,.12);
                margin-bottom: 4px;
            }
            .rnd-h2h-record-side {
                display: flex; align-items: center; gap: 8px;
            }
            .rnd-h2h-record-side.away { flex-direction: row-reverse; }
            .rnd-h2h-record-logo {
                width: 28px; height: 28px; object-fit: contain;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,.4));
            }
            .rnd-h2h-record-name {
                font-size: 12px; font-weight: 700; color: #c8e4b0;
                max-width: 150px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis;
            }
            .rnd-h2h-record-stat {
                display: flex; flex-direction: column; align-items: center;
            }
            .rnd-h2h-record-num {
                font-size: 22px; font-weight: 800; line-height: 1;
            }
            .rnd-h2h-record-num.home { color: #5ab03a; }
            .rnd-h2h-record-num.draw { color: #7a8a6a; }
            .rnd-h2h-record-num.away { color: #4a8ac8; }
            .rnd-h2h-record-label {
                font-size: 8px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 1px; font-weight: 600; margin-top: 2px;
            }
            .rnd-h2h-goals-summary {
                text-align: center; font-size: 10px; color: #5a7a48;
                margin-top: -6px; padding-bottom: 6px;
            }
            .rnd-h2h-goals-summary span { color: #8abc78; font-weight: 700; }

            /* ── Match list ── */
            .rnd-h2h-matches { padding-top: 4px; }
            .rnd-h2h-season {
                font-size: 9px; color: #4a7a3a; text-transform: uppercase;
                letter-spacing: 1.5px; padding: 12px 0 4px; font-weight: 700;
                border-bottom: 1px solid rgba(80,160,48,.08);
            }
            .rnd-h2h-match {
                position: relative;
                display: flex; align-items: center; gap: 0;
                padding: 7px 8px; margin: 2px 0; border-radius: 6px;
                font-size: 13px; cursor: pointer;
                transition: background 0.15s;
            }
            .rnd-h2h-match:hover { background: rgba(255,255,255,.05); }
            .rnd-h2h-match.h2h-readonly { cursor: default; }
            .rnd-h2h-match.h2h-win { border-left: 3px solid #5ab03a; }
            .rnd-h2h-match.h2h-loss { border-left: 3px solid #4a8ac8; }
            .rnd-h2h-match.h2h-draw { border-left: 3px solid #5a6a4a; }
            .rnd-h2h-date {
                color: #4a7a3a; font-size: 10px; width: 72px; flex-shrink: 0;
                font-weight: 500;
            }
            .rnd-h2h-type-badge {
                font-size: 8px; font-weight: 700; color: #6a9a58;
                background: rgba(0,0,0,.25); padding: 1px 5px;
                border-radius: 3px; text-transform: uppercase;
                letter-spacing: 0.5px; flex-shrink: 0; margin-right: 8px;
                width: 100px;
            }
            .rnd-h2h-home {
                margin-left: 16px; text-align: right; color: #b8d8a0;
                font-size: 12px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis; padding-right: 8px;
            }
            .rnd-h2h-result {
                font-weight: 800; color: #e0f0d0; width: 44px;
                text-align: center; font-size: 14px; flex-shrink: 0;
                letter-spacing: 1px;
            }
            .rnd-h2h-away {
                flex: 1; text-align: left; color: #b8d8a0;
                font-size: 12px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis; padding-left: 8px;
            }
            .rnd-h2h-home.winner { color: #6adc3a; font-weight: 700; }
            .rnd-h2h-away.winner { color: #6adc3a; font-weight: 700; }
            .rnd-h2h-att {
                font-size: 9px; color: #3a6a2a; width: 50px;
                text-align: right; flex-shrink: 0; font-variant-numeric: tabular-nums;
            }

            /* ── Hover tooltip ── */
            .rnd-h2h-tooltip {
                position: absolute; z-index: 100;
                background: #111f0a; border: 1px solid rgba(80,160,48,.25);
                border-radius: 10px; padding: 18px 24px;
                min-width: 520px; max-width: 600px;
                box-shadow: 0 8px 32px rgba(0,0,0,.6);
                pointer-events: none; opacity: 0;
                transition: opacity 0.15s;
                left: 50%; top: 100%; transform: translateX(-50%);
                margin-top: 4px;
            }
            .rnd-h2h-tooltip.visible { opacity: 1; }
            .rnd-h2h-tooltip-header {
                display: flex; align-items: center; justify-content: center;
                gap: 14px; padding-bottom: 12px; margin-bottom: 10px;
                border-bottom: 1px solid rgba(80,160,48,.12);
            }
            .rnd-h2h-tooltip-logo {
                width: 40px; height: 40px; object-fit: contain;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,.4));
            }
            .rnd-h2h-tooltip-team {
                font-size: 15px; font-weight: 700; color: #c8e4b0;
                max-width: 180px; white-space: nowrap; overflow: hidden;
                text-overflow: ellipsis;
            }
            .rnd-h2h-tooltip-score {
                font-size: 28px; font-weight: 800; color: #fff;
                letter-spacing: 3px;
                text-shadow: 0 0 16px rgba(128,224,64,.15);
            }
            .rnd-h2h-tooltip-meta {
                display: flex; align-items: center; justify-content: center;
                gap: 18px; font-size: 11px; color: #5a7a48;
                margin-bottom: 10px;
            }
            .rnd-h2h-tooltip-meta span { display: flex; align-items: center; gap: 3px; }
            .rnd-h2h-tooltip-events {
                display: flex; flex-direction: column; gap: 5px;
            }
            .rnd-h2h-tooltip-evt {
                display: flex; align-items: center; gap: 10px;
                font-size: 13px; color: #a0c890; padding: 3px 0;
            }
            .rnd-h2h-tooltip-evt.away-evt { flex-direction: row-reverse; text-align: right; }
            .rnd-h2h-tooltip-evt.away-evt .rnd-h2h-tooltip-evt-min { text-align: left; }
            .rnd-h2h-tooltip-evt-min {
                font-weight: 700; color: #80b868; min-width: 32px;
                font-size: 13px; text-align: right; flex-shrink: 0;
            }
            .rnd-h2h-tooltip-evt-icon { flex-shrink: 0; font-size: 16px; }
            .rnd-h2h-tooltip-evt-text { color: #b8d8a0; }
            .rnd-h2h-tooltip-evt-assist {
                font-size: 12px; color: #5a8a48; font-weight: 500; margin-left: 2px;
            }
            .rnd-h2h-tooltip-mom {
                margin-top: 10px; padding-top: 10px;
                border-top: 1px solid rgba(80,160,48,.1);
                font-size: 13px; color: #6a9a58; text-align: center;
            }
            .rnd-h2h-tooltip-mom span { color: #e8d44a; font-weight: 700; }

            /* ── Rich tooltip extras ── */
            .rnd-h2h-tooltip-divider {
                height: 1px; background: rgba(80,160,48,.1); margin: 8px 0;
            }
            .rnd-h2h-tooltip-stats {
                display: grid; grid-template-columns: 1fr auto 1fr; gap: 4px 12px;
                margin: 10px 0; font-size: 14px;
            }
            .rnd-h2h-tooltip-stat-home {
                text-align: right; font-weight: 700; color: #b8d8a0;
            }
            .rnd-h2h-tooltip-stat-label {
                text-align: center; font-size: 10px; color: #5a7a48;
                text-transform: uppercase; letter-spacing: 0.8px; font-weight: 600;
                padding: 0 6px;
            }
            .rnd-h2h-tooltip-stat-away {
                text-align: left; font-weight: 700; color: #b8d8a0;
            }
            .rnd-h2h-tooltip-stat-home.leading { color: #6adc3a; }
            .rnd-h2h-tooltip-stat-away.leading { color: #6adc3a; }
            .rnd-h2h-tooltip-subs {
                display: flex; flex-direction: column; gap: 3px;
                margin-top: 6px;
            }
            .rnd-h2h-tooltip-sub {
                display: flex; align-items: center; gap: 8px;
                font-size: 11px; color: #7aaa68;
            }
            /* (subs section currently unused) */
            .rnd-h2h-tooltip-sub-icon { flex-shrink: 0; }
            .rnd-h2h-tooltip-ratings {
                display: flex; justify-content: space-between;
                margin-top: 10px; padding-top: 10px;
                border-top: 1px solid rgba(80,160,48,.1);
            }
            .rnd-h2h-tooltip-rating-side {
                display: flex; flex-direction: column; gap: 3px; font-size: 12px;
            }
            .rnd-h2h-tooltip-rating-side.away { align-items: flex-end; }
            .rnd-h2h-tooltip-rating-player {
                display: flex; align-items: center; gap: 6px; color: #8ab878;
            }
            .rnd-h2h-tooltip-rating-player .r-val {
                font-weight: 800; min-width: 28px; font-size: 13px;
            }
            .rnd-h2h-tooltip-rating-player .r-val.high { color: #6adc3a; }
            .rnd-h2h-tooltip-rating-player .r-val.mid { color: #c8c848; }
            .rnd-h2h-tooltip-rating-player .r-val.low { color: #c86a4a; }
            /* ── League Tab ── */
            .rnd-league-wrap {
                max-width: 100%; margin: 0 auto; padding: 0 0 20px;
            }
            .rnd-league-header {
                display: flex; align-items: center; justify-content: center;
                gap: 14px; padding: 14px 20px 14px;
                background: linear-gradient(180deg, rgba(42,74,28,.25) 0%, transparent 100%);
                border-bottom: 1px solid rgba(80,160,48,.12);
                margin-bottom: 4px;
            }
            .rnd-league-title {
                font-size: 12px; font-weight: 700; color: #b0d8a0;
                text-transform: uppercase; letter-spacing: 1.5px;
            }
            .rnd-league-minute-badge {
                display: inline-flex; align-items: center; gap: 4px;
                background: rgba(106,220,58,.1); border: 1px solid rgba(106,220,58,.25);
                border-radius: 12px; padding: 3px 12px;
                font-size: 12px; font-weight: 700; color: #6adc3a;
                animation: rnd-pulse-score 1.5s ease-in-out infinite;
            }
            @keyframes rnd-pulse-score {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.55; }
            }
            .rnd-league-columns {
                display: flex; gap: 24px; padding: 0 16px;
            }
            .rnd-league-col-matches { flex: 1; min-width: 0; }
            .rnd-league-col-standings { flex: 1.15; min-width: 0; overflow-x: auto; }
            .rnd-league-col-title {
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 1.5px;
                padding: 8px 12px 10px; margin-bottom: 0;
                border-bottom: 1px solid rgba(80,160,48,.1);
            }

            /* ── Match card ── */
            .rnd-league-match {
                position: relative;
                display: flex; align-items: center; gap: 0;
                padding: 10px 14px; border-radius: 0;
                font-size: 13px; cursor: default;
                transition: background 0.15s;
                border-left: 3px solid transparent;
            }
            .rnd-league-match:nth-child(even) {
                background: rgba(0,0,0,.12);
            }
            .rnd-league-match:nth-child(odd) {
                background: rgba(0,0,0,.03);
            }
            .rnd-league-match:hover { background: rgba(255,255,255,.06); }
            .rnd-league-match.rnd-league-current {
                background: rgba(74,144,48,.18) !important;
                border-left-color: #6cc040;
            }
            .rnd-league-match.rnd-league-current:hover {
                background: rgba(74,144,48,.25) !important;
            }
            .rnd-league-home {
                flex: 1; text-align: right; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
                color: #c8e4b0; font-size: 13px; font-weight: 600;
                padding-right: 8px;
            }
            .rnd-league-away {
                flex: 1; text-align: left; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
                color: #c8e4b0; font-size: 13px; font-weight: 600;
                padding-left: 8px;
            }
            .rnd-league-logo {
                width: 22px; height: 22px; vertical-align: middle;
                flex-shrink: 0;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,.35));
            }
            .rnd-league-score-block {
                display: flex; align-items: center; justify-content: center;
                width: 70px; margin: 0 6px; flex-shrink: 0;
                background: rgba(0,0,0,.25); border-radius: 5px;
                padding: 4px 0;
            }
            .rnd-league-score-num {
                width: 22px; text-align: center;
                font-weight: 800; font-size: 16px; color: #e0f0d0;
                font-variant-numeric: tabular-nums; line-height: 1;
            }
            .rnd-league-score-sep {
                color: #4a6a3a; font-weight: 600; margin: 0 4px;
                font-size: 13px;
            }
            .rnd-league-match.live .rnd-league-score-block {
                background: rgba(106,220,58,.12);
                border: 1px solid rgba(106,220,58,.2);
            }
            .rnd-league-match.live .rnd-league-score-num {
                color: #6adc3a;
            }
            .rnd-league-events {
                display: flex; flex-wrap: wrap; gap: 1px 8px;
                justify-content: center;
                padding: 2px 20px 5px;
                font-size: 10px;
            }
            .rnd-league-evt {
                font-size: 10px; color: #8abc78;
            }
            .rnd-league-evt .evt-min {
                color: #5a7a48; font-weight: 600; font-size: 9px;
            }

            /* ── League Tooltip ── */
            .rnd-league-tooltip {
                position: absolute; z-index: 100;
                background: linear-gradient(160deg, #1a3d0f 0%, #0e2508 60%, #122a0a 100%);
                border: 1px solid rgba(80,160,48,.25);
                border-radius: 12px; padding: 0;
                min-width: 320px; max-width: 400px;
                box-shadow: 0 12px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(74,144,48,.1);
                pointer-events: none; opacity: 0;
                transition: opacity 0.15s;
                overflow: hidden;
            }
            .rnd-league-tooltip.visible { opacity: 1; }
            .rnd-league-tt-head {
                display: flex; align-items: center; justify-content: center;
                gap: 8px; padding: 12px 16px;
                background: linear-gradient(180deg, rgba(42,74,28,.3) 0%, transparent 100%);
                border-bottom: 1px solid rgba(80,160,48,.1);
            }
            .rnd-league-tt-team {
                font-size: 11px; font-weight: 700; color: #c8e8b0;
                max-width: 100px; white-space: nowrap;
                overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-league-tt-score {
                display: flex; align-items: center; gap: 0;
                background: rgba(0,0,0,.25); border-radius: 6px;
                padding: 4px 10px;
            }
            .rnd-league-tt-score-num {
                font-size: 20px; font-weight: 800; color: #e0f0d0;
                min-width: 16px; text-align: center; line-height: 1;
            }
            .rnd-league-tt-score-sep {
                color: #4a6a3a; margin: 0 5px; font-size: 14px;
            }
            .rnd-league-tt-logo {
                width: 24px; height: 24px;
                filter: drop-shadow(0 1px 3px rgba(0,0,0,.4));
            }
            .rnd-league-tt-stats {
                padding: 10px 16px;
            }
            .rnd-league-tt-stat-row {
                display: flex; align-items: center; margin-bottom: 6px;
            }
            .rnd-league-tt-stat-row:last-child { margin-bottom: 0; }
            .rnd-league-tt-val {
                font-weight: 800; font-size: 13px; min-width: 24px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-league-tt-val.home { text-align: right; color: #80e048; }
            .rnd-league-tt-val.away { text-align: left; color: #5ba8f0; }
            .rnd-league-tt-val.leading { font-size: 15px; }
            .rnd-league-tt-label {
                flex: 1; text-align: center;
                font-size: 9px; color: #6a9a58; font-weight: 700;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .rnd-league-tt-bar {
                flex: 1; display: flex; height: 4px; border-radius: 2px;
                overflow: hidden; background: rgba(0,0,0,.2); gap: 1px;
                margin: 0 8px;
            }
            .rnd-league-tt-seg {
                border-radius: 2px; min-width: 2px;
                transition: width 0.3s ease;
            }
            .rnd-league-tt-seg.home {
                background: linear-gradient(90deg, #4a9030, #6cc048);
            }
            .rnd-league-tt-seg.away {
                background: linear-gradient(90deg, #3a7ab8, #5b9bff);
            }
            .rnd-league-tt-events {
                border-top: 1px solid rgba(80,160,48,.08);
                padding: 8px 16px 10px;
                font-size: 10px; color: #8abc78;
            }
            .rnd-league-tt-evt-row {
                display: flex; gap: 8px;
                padding: 2px 0;
                border-bottom: 1px solid rgba(80,160,48,.04);
            }
            .rnd-league-tt-evt-row:last-child { border-bottom: none; }
            .tt-evt-home {
                flex: 1; text-align: right; color: #8abc78;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .tt-evt-away {
                flex: 1; text-align: left; color: #8abc78;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-league-tt-events .evt-min {
                color: #5a7a48; font-weight: 600; font-size: 9px;
            }

            /* ── League Standings ── */
            .rnd-league-tbl {
                width: 100%; border-collapse: collapse;
                font-size: 12px;
            }
            .rnd-league-tbl th {
                padding: 8px 6px; text-align: center;
                color: #6a9a58; font-weight: 700;
                border-bottom: 2px solid rgba(80,160,48,.18);
                font-size: 10px; white-space: nowrap;
                text-transform: uppercase; letter-spacing: 0.8px;
            }
            .rnd-league-tbl th:first-child,
            .rnd-league-tbl td:first-child { text-align: center; width: 48px; }
            .rnd-league-tbl th:nth-child(2),
            .rnd-league-tbl td:nth-child(2) { text-align: left; }
            .rnd-league-tbl td {
                padding: 7px 6px; text-align: center;
                color: #90c480; border-bottom: 1px solid rgba(255,255,255,.03);
                white-space: nowrap; font-variant-numeric: tabular-nums;
                font-size: 12px;
            }
            .rnd-league-tbl tr {
                transition: background .12s;
            }
            .rnd-league-tbl tr:nth-child(even) {
                background: rgba(0,0,0,.12);
            }
            .rnd-league-tbl tr:nth-child(odd) {
                background: rgba(0,0,0,.03);
            }
            .rnd-league-tbl tr:hover { background: rgba(255,255,255,.06); }
            .rnd-league-tbl tr.rnd-league-hl {
                background: rgba(74,144,48,.15) !important;
            }
            .rnd-league-tbl tr.rnd-league-hl:hover {
                background: rgba(74,144,48,.22) !important;
            }
            .rnd-league-tbl tr.rnd-league-hl td {
                color: #c0e8b0; font-weight: 600;
            }
            .rnd-league-tbl td.pts {
                color: #e0f0cc; font-weight: 800; font-size: 13px;
            }
            .rnd-league-tbl td.pos-num {
                font-weight: 700; color: #6a8a58; font-size: 11px;
            }
            .rnd-league-tbl .club-cell {
                display: flex; align-items: center; gap: 6px;
                max-width: 170px; overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-league-tbl .club-logo {
                width: 18px; height: 18px; flex-shrink: 0;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,.3));
            }
            .rnd-league-tbl .club-name {
                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                font-weight: 500;
            }
            .rnd-league-tbl td.gd-pos { color: #5ab03a; }
            .rnd-league-tbl td.gd-neg { color: #c86a4a; }
            .rnd-league-tbl td.w-col { color: #5ab03a; }
            .rnd-league-tbl td.l-col { color: #c86a4a; }

            /* ── Position arrows ── */
            .pos-arrow {
                display: inline-block; font-size: 9px; margin-left: 3px;
                font-weight: 700; vertical-align: middle;
            }
            .pos-arrow.pos-up { color: #5ee038; }
            .pos-arrow.pos-down { color: #e05a3a; }
            .pos-arrow.pos-same { color: #4a6a3a; font-size: 8px; }

            /* ── Zone indicators ── */
            .rnd-league-tbl tr.zone-relegation {
                border-left: 3px solid #d64040;
            }
            .rnd-league-tbl tr.zone-relegation td:first-child {
                border-left: 3px solid #d64040;
            }
            .rnd-league-tbl tr.zone-relegation td {
                color: #d09090;
            }
            .rnd-league-tbl tr.zone-relegation td.pos-num {
                color: #d64040;
            }
            .rnd-league-tbl tr.zone-playoff {
                border-left: 3px solid #d6a030;
            }
            .rnd-league-tbl tr.zone-playoff td:first-child {
                border-left: 3px solid #d6a030;
            }
            .rnd-league-tbl tr.zone-playoff td.pos-num {
                color: #d6a030;
            }

            /* ── Legend ── */
            .rnd-league-legend {
                display: flex; gap: 16px; padding: 8px 12px 4px;
                font-size: 10px; color: #6a8a58;
            }
            .legend-item {
                display: flex; align-items: center; gap: 5px;
            }
            .legend-dot {
                width: 10px; height: 10px; border-radius: 2px;
            }
            .legend-dot.legend-rel { background: #d64040; }
            .legend-dot.legend-po { background: #d6a030; }

            /* ── Analysis Tab ── */
            .rnd-analysis-wrap {
                max-width: 100%; padding: 0 0 20px;
            }
            .rnd-an-section {
                margin-bottom: 2px;
                background: rgba(0,0,0,.08);
                border-bottom: 1px solid rgba(80,160,48,.06);
            }
            .rnd-an-section-head {
                display: flex; align-items: center; gap: 8px;
                padding: 12px 20px 8px;
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 1.5px;
            }
            .rnd-an-section-head .an-icon { font-size: 14px; }

            /* Form strip */
            .rnd-an-form-row {
                display: flex; align-items: center; gap: 12px;
                padding: 6px 20px 14px;
            }
            .rnd-an-form-side {
                flex: 1; display: flex; align-items: center; gap: 6px;
            }
            .rnd-an-form-side.away { justify-content: flex-end; flex-direction: row-reverse; }
            .rnd-an-form-label {
                font-size: 11px; font-weight: 700; color: #8aac78;
                min-width: 40px;
            }
            .rnd-an-form-side.home .rnd-an-form-label { text-align: right; }
            .rnd-an-form-side.away .rnd-an-form-label { text-align: left; }
            .rnd-an-form-dots {
                display: flex; gap: 3px;
            }
            .rnd-an-form-dot {
                width: 22px; height: 22px; border-radius: 4px;
                display: flex; align-items: center; justify-content: center;
                font-size: 10px; font-weight: 800; color: #fff;
                text-shadow: 0 1px 2px rgba(0,0,0,.4);
            }
            .rnd-an-form-dot.w { background: #3a9a2a; }
            .rnd-an-form-dot.d { background: #8a8a3a; }
            .rnd-an-form-dot.l { background: #b84a3a; }
            .rnd-an-form-pts {
                font-size: 13px; font-weight: 800; color: #c8e8b0;
                min-width: 24px; text-align: center;
            }

            /* Form comparison bar */
            .rnd-an-form-bar-wrap {
                padding: 0 20px 12px;
            }
            .rnd-an-form-bar {
                display: flex; height: 6px; border-radius: 3px;
                overflow: hidden; background: rgba(0,0,0,.2); gap: 1px;
            }
            .rnd-an-form-seg {
                border-radius: 3px; transition: width 0.3s;
            }
            .rnd-an-form-seg.home { background: linear-gradient(90deg, #4a9030, #6cc048); }
            .rnd-an-form-seg.away { background: linear-gradient(90deg, #3a7ab8, #5b9bff); }

            /* Strength bars */
            .rnd-an-strength-row {
                display: flex; align-items: center; gap: 0;
                padding: 5px 20px;
            }
            .rnd-an-strength-row:nth-child(even) { background: rgba(0,0,0,.06); }
            .rnd-an-str-val {
                min-width: 44px; font-weight: 800; font-size: 13px;
                font-variant-numeric: tabular-nums;
            }
            .rnd-an-str-val.home { text-align: right; color: #80e048; padding-right: 8px; }
            .rnd-an-str-val.away { text-align: left; color: #5ba8f0; padding-left: 8px; }
            .rnd-an-str-val.leading { font-size: 15px; }
            .rnd-an-str-label {
                min-width: 54px; text-align: center;
                font-size: 10px; font-weight: 700; color: #6a9a58;
                text-transform: uppercase; letter-spacing: 0.5px;
            }
            .rnd-an-str-bar {
                flex: 1; height: 8px; border-radius: 4px;
                background: rgba(0,0,0,.2); overflow: hidden;
            }
            .rnd-an-str-fill {
                height: 100%; border-radius: 4px; transition: width 0.5s ease;
            }
            .rnd-an-str-fill.home { background: linear-gradient(90deg, #3a7828, #6cc048); float: right; }
            .rnd-an-str-fill.away { background: linear-gradient(90deg, #5b9bff, #3a7ab8); }

            /* Key players */
            .rnd-an-keys {
                display: flex; gap: 0; padding: 0;
            }
            .rnd-an-keys-side {
                flex: 1; display: flex; flex-direction: column; gap: 2px;
                padding: 6px 12px 12px;
            }
            .rnd-an-keys-side.away { border-left: 1px solid rgba(80,160,48,.06); }
            .rnd-an-key-player {
                display: flex; align-items: center; gap: 8px;
                padding: 6px 8px; border-radius: 6px;
                transition: background .12s;
            }
            .rnd-an-key-player:nth-child(even) { background: rgba(0,0,0,.06); }
            .rnd-an-key-player:hover { background: rgba(255,255,255,.05); }
            .rnd-an-key-face {
                width: 36px; height: 36px; border-radius: 50%;
                overflow: hidden; flex-shrink: 0;
                border: 2px solid rgba(80,160,48,.3);
            }
            .rnd-an-key-face img {
                width: 100%; height: 100%; object-fit: cover; object-position: top;
            }
            .rnd-an-key-info { flex: 1; min-width: 0; }
            .rnd-an-key-name {
                font-size: 12px; font-weight: 600; color: #c8e4b0;
                white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            }
            .rnd-an-key-meta {
                font-size: 10px; color: #6a9a58;
            }
            .rnd-an-key-r5 {
                font-size: 14px; font-weight: 800;
                font-variant-numeric: tabular-nums;
                min-width: 40px; text-align: right;
            }
            .rnd-an-key-rank {
                font-size: 16px; font-weight: 800; color: #3a5a2a;
                min-width: 20px; text-align: center;
            }

            /* Profile stats grid */
            .rnd-an-profile-grid {
                display: grid; grid-template-columns: 1fr 1fr;
                gap: 2px; padding: 0 20px 12px;
            }
            .rnd-an-profile-card {
                display: flex; align-items: center; gap: 10px;
                padding: 10px 14px; background: rgba(0,0,0,.08);
                border-radius: 6px;
            }
            .rnd-an-profile-icon { font-size: 18px; }
            .rnd-an-profile-info { flex: 1; }
            .rnd-an-profile-label {
                font-size: 9px; font-weight: 700; color: #5a7a48;
                text-transform: uppercase; letter-spacing: 1px;
            }
            .rnd-an-profile-vals {
                display: flex; gap: 8px; margin-top: 2px;
            }
            .rnd-an-profile-val {
                font-size: 14px; font-weight: 800;
            }
            .rnd-an-profile-val.home { color: #80e048; }
            .rnd-an-profile-val.away { color: #5ba8f0; }
            .rnd-an-profile-vs {
                font-size: 10px; color: #4a6a3a; font-weight: 600;
            }

            /* Tactical matchup */
            .rnd-an-tactics {
                display: flex; gap: 0; padding: 0;
            }
            .rnd-an-tactic-side {
                flex: 1; padding: 8px 20px 14px;
            }
            .rnd-an-tactic-side.away {
                border-left: 1px solid rgba(80,160,48,.06);
            }
            .rnd-an-tactic-team {
                font-size: 11px; font-weight: 700; color: #8aac78;
                margin-bottom: 6px;
            }
            .rnd-an-tactic-item {
                display: flex; align-items: center; gap: 6px;
                padding: 4px 0; font-size: 12px; color: #a0c890;
            }
            .rnd-an-tactic-item .t-icon { font-size: 13px; width: 20px; text-align: center; }
            .rnd-an-tactic-item .t-label {
                font-size: 9px; color: #5a7a48; text-transform: uppercase;
                letter-spacing: 0.5px; min-width: 55px;
            }
            .rnd-an-tactic-item .t-val { font-weight: 700; color: #c8e4b0; }

            /* Unavailable */
            .rnd-an-unavail {
                display: flex; gap: 0; padding: 0;
            }
            .rnd-an-unavail-side {
                flex: 1; padding: 6px 20px 12px;
            }
            .rnd-an-unavail-side.away {
                border-left: 1px solid rgba(80,160,48,.06);
            }
            .rnd-an-unavail-player {
                display: flex; align-items: center; gap: 6px;
                padding: 4px 0; font-size: 12px; color: #c86a4a;
            }
            .rnd-an-unavail-none {
                font-size: 11px; color: #5a7a48; font-style: italic;
                padding: 4px 0;
            }

            /* Prediction */
            .rnd-an-prediction {
                display: flex; flex-direction: column; align-items: center;
                padding: 16px 20px 20px; gap: 10px;
            }
            .rnd-an-pred-teams {
                display: flex; align-items: center; gap: 16px; width: 100%;
            }
            .rnd-an-pred-side {
                flex: 1; text-align: center;
            }
            .rnd-an-pred-logo {
                width: 48px; height: 48px;
                filter: drop-shadow(0 2px 6px rgba(0,0,0,.4));
            }
            .rnd-an-pred-name {
                font-size: 11px; font-weight: 700; color: #8aac78;
                margin-top: 4px;
            }
            .rnd-an-pred-pct {
                font-size: 28px; font-weight: 800; margin-top: 2px;
            }
            .rnd-an-pred-pct.home { color: #80e048; }
            .rnd-an-pred-pct.away { color: #5ba8f0; }
            .rnd-an-pred-pct.draw { color: #b8b848; }
            .rnd-an-pred-bar-wrap {
                width: 100%; display: flex; gap: 2px;
                height: 10px; border-radius: 5px; overflow: hidden;
            }
            .rnd-an-pred-seg {
                height: 100%; border-radius: 5px; transition: width 0.5s;
            }
            .rnd-an-pred-seg.home { background: linear-gradient(90deg, #4a9030, #6cc048); }
            .rnd-an-pred-seg.draw { background: linear-gradient(90deg, #8a8a3a, #b8b848); }
            .rnd-an-pred-seg.away { background: linear-gradient(90deg, #3a7ab8, #5b9bff); }
            .rnd-an-pred-label {
                font-size: 10px; font-weight: 700; color: #6a9a58;
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

