// tm-league-styles.js - League page CSS injection
// Depends on: nothing
// Exposed as: TmLeagueStyles = { inject }

const inject = () => {
    if (document.getElementById('tsa-league-style')) return;
    const style = document.createElement('style');
    style.id = 'tsa-league-style';
    style.textContent = `
            .tsa-controls {
                display: flex;
                align-items: center;
                gap: var(--tmu-space-sm);
                padding: var(--tmu-space-md) var(--tmu-space-lg);
                font-size: var(--tmu-font-sm);
                color: var(--tmu-text-main);
            }
            .tsa-progress {
                font-size: var(--tmu-font-sm);
                color: var(--tmu-text-faint);
                margin-left: auto;
            }
            #tm_script_num_matches::-webkit-inner-spin-button,
            #tm_script_num_matches::-webkit-outer-spin-button { opacity: 0; transition: opacity 0.15s; }
            #tm_script_num_matches:focus::-webkit-inner-spin-button,
            #tm_script_num_matches:focus::-webkit-outer-spin-button { opacity: 1; }
            #tm_script_num_matches { -moz-appearance: textfield; }
            #tm_script_num_matches:focus { -moz-appearance: number-input; }
            .tmvu-main.tmvu-league-layout {
                display: flex;
                gap: var(--tmu-space-lg);
                align-items: flex-start;
            }
            .tmvu-league-main {
                flex: 1 1 auto;
                min-width: 0;
            }
            .tmvu-league-sidebar {
                flex: 0 0 390px;
                min-width: 0;
            }

            .tmvu-league-feed-card {
                margin-top: var(--tmu-space-lg);
            }

            .tmvu-main.tmvu-league-layout .tmu-card,
            .tmvu-main.tmvu-league-layout .tmu-flat-panel,
            .tmvu-main.tmvu-league-layout .tmu-panel,
            .tmvu-main.tmvu-league-layout .tmvu-round-panel,
            .tmvu-main.tmvu-league-layout .tmvu-league-feed-card tm-card {
                background: var(--tmu-league-panel-bg, var(--tmu-surface-panel));
                border-color: var(--tmu-league-panel-border, var(--tmu-border-soft-alpha));
            }

            .tmvu-main.tmvu-league-layout .tmu-card-head,
            .tmvu-main.tmvu-league-layout .tmu-flat-panel .tmu-card-head,
            .tmvu-main.tmvu-league-layout .tmvu-round-panel .tmu-card-head {
                background: var(--tmu-league-head-bg, linear-gradient(180deg, var(--tmu-success-fill-soft), var(--tmu-success-fill-faint)));
                border-bottom-color: var(--tmu-league-head-border, var(--tmu-border-soft-alpha));
            }

            .tmvu-main.tmvu-league-layout .tmvu-standings-wrap {
                background: var(--tmu-league-table-shell, var(--tmu-surface-dark-soft));
                border-color: var(--tmu-league-panel-border, var(--tmu-border-soft-alpha-mid));
            }

            .tmvu-main.tmvu-league-layout .tmvu-standings-wrap tr:nth-child(even) {
                background: var(--tmu-league-table-even, var(--tmu-border-contrast)) !important;
            }

            .tmvu-main.tmvu-league-layout .tmvu-standings-wrap tbody tr:nth-child(odd) {
                background: var(--tmu-league-table-odd, transparent) !important;
            }

            .tmvu-main.tmvu-league-layout .tmvu-standings-wrap tbody tr:hover {
                background: var(--tmu-league-table-row-hover, var(--tmu-surface-dark-mid)) !important;
            }

            .tmvu-main.tmvu-league-layout .tmvu-league-sidebar .tmvu-match-row:nth-child(even),
            .tmvu-main.tmvu-league-layout .tmvu-league-sidebar .tsa-skill-row:nth-child(even) {
                background: var(--tmu-league-sidebar-stripe, rgba(255,255,255,.035));
            }

            .tmvu-main.tmvu-league-layout .tmvu-league-sidebar .tmvu-match-row:nth-child(odd),
            .tmvu-main.tmvu-league-layout .tmvu-league-sidebar .tsa-skill-row:nth-child(odd) {
                background: var(--tmu-league-sidebar-stripe-alt, transparent);
            }

            .tmvu-main.tmvu-league-layout .tsa-skill-row:hover {
                background: var(--tmu-league-table-row-hover, var(--tmu-surface-tab-hover));
            }
           
            /* ── History mode banner ── */
            .tsa-history-banner {
                display: flex; align-items: center; gap: var(--tmu-space-sm);
                padding: var(--tmu-space-xs) var(--tmu-space-md); font-size: var(--tmu-font-xs); font-weight: 700;
                color: var(--tmu-warning); background: var(--tmu-warning-fill);
                border-bottom: 1px solid var(--tmu-border-warning);
            }
            /* ── Squad Analysis list ── */
            .tsa-skill-list { display: flex; flex-direction: column; }
            .tsa-skill-head,
            .tsa-skill-row {
                display: grid;
                grid-template-columns: 24px 1fr 48px 52px 44px;
                align-items: center;
                gap: var(--tmu-space-sm);
                padding: var(--tmu-space-sm) var(--tmu-space-md);
                font-size: var(--tmu-font-sm);
            }
            .tsa-skill-head {
                font-size: var(--tmu-font-xs);
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: var(--tmu-text-faint);
                border-bottom: 1px solid var(--tmu-border-faint);
            }
            .tsa-skill-sortable {
                cursor: pointer;
                color: var(--tmu-text-panel-label);
                user-select: none;
            }
            .tsa-skill-sortable:hover { color: var(--tmu-text-strong); }
            .tsa-skill-sorted { color: var(--tmu-text-strong); }
            .tsa-skill-row {
                border-bottom: 1px solid var(--tmu-border-faint);
                transition: background 0.12s;
                color: var(--tmu-text-main);
            }
            .tsa-skill-row:last-child { border-bottom: none; }
            .tsa-skill-row:hover { background: var(--tmu-surface-tab-hover); }
            .tsa-skill-rank { color: var(--tmu-text-faint); font-size: var(--tmu-font-xs); }
            .tsa-skill-club { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .tsa-skill-val  { text-align: right; font-variant-numeric: tabular-nums; }
        `;
    document.head.appendChild(style);
};

export const TmLeagueStyles = { inject };
