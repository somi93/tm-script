const STYLE_ID = 'tmvu-club-fixtures-style';

export const TmClubFixturesStyles = {
    inject() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmcf-wrap {
                display: flex;
                flex-direction: column;
                gap: var(--tmu-space-lg);
                width: 100%;
            }

            .tmcf-summary {
                margin-bottom: 0;
            }

            .tmcf-summary.tmu-summary-strip-boxed {
                gap: var(--tmu-space-md);
                padding: 0;
                background: transparent;
                border: 0;
            }

            .tmcf-summary.tmu-summary-strip-boxed .tmu-summary-item {
                flex: 1 1 140px;
                min-width: 0;
                padding: var(--tmu-space-md) var(--tmu-space-md);
                background: var(--tmu-surface-card);
                border: 1px solid var(--tmu-border-soft);
            }

            .tmcf-summary .tmu-summary-value {
                font-size: var(--tmu-font-2xl);
                line-height: 1;
            }

            .tmcf-filters {
                display: flex;
                gap: var(--tmu-space-sm);
                flex-wrap: wrap;
            }

            .tmcf-filters .tmu-btn {
                flex: 0 0 auto;
            }

            .tmcf-month {
                background: var(--tmu-surface-panel);
                border: 1px solid var(--tmu-border-soft);
                border-radius: var(--tmu-space-md);
                box-shadow: 0 0 9px var(--tmu-shadow-ring);
                overflow: hidden;
            }
            // Accordion
            .tmcf-month-head.tmu-btn {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--tmu-space-md);
                width: 100%;
                padding: var(--tmu-space-md) var(--tmu-space-lg);
                background: var(--tmu-surface-tab-hover);
                border-bottom: 1px solid var(--tmu-border-strong);
                border-left: 0;
                border-right: 0;
                border-top: 0;
                text-align: left;
                border-radius: 0;
                color: var(--tmu-text-strong);
            }

            .tmcf-month-head.tmu-btn:hover:not(:disabled) {
                background: var(--tmu-surface-tab-active);
            }

            .tmcf-month-head-main {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--tmu-space-md);
                flex: 1 1 auto;
                min-width: 0;
            }

            .tmcf-month-title {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-md);
                font-weight: 800;
            }

            .tmcf-month-meta {
                color: var(--tmu-text-faint);
                font-size: var(--tmu-font-xs);
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            .tmcf-month-arrow {
                color: var(--tmu-text-faint);
                flex: 0 0 auto;
                font-size: var(--tmu-font-md);
                transition: transform 0.15s ease, color 0.15s ease;
            }

            .tmcf-month.is-open .tmcf-month-arrow {
                color: var(--tmu-text-main);
                transform: rotate(180deg);
            }

            .tmcf-table-wrap {
                padding: var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-md);
            }

            .tmcf-table-wrap.is-collapsed {
                display: none;
            }

            .tmcf-table .tmcf-result a,
            .tmcf-table .tmcf-opponent a {
                text-decoration: none;
            }

            .tmcf-table .tmcf-result a:hover,
            .tmcf-table .tmcf-opponent a:hover {
                text-decoration: none;
            }

            .tmcf-date {
                color: var(--tmu-text-main);
                font-weight: 600;
            }

            .tmcf-type {
                display: inline-flex;
                align-items: center;
                min-width: 88px;
                justify-content: center;
                border-radius: 999px;
                font-size: var(--tmu-font-xs);
                font-weight: 700;
                letter-spacing: 0.45px;
                padding: var(--tmu-space-xs) var(--tmu-space-sm);
                text-transform: uppercase;
            }

            .tmcf-type-league { background: var(--tmu-success-fill-soft); color: var(--tmu-success-strong); }
            .tmcf-type-friendly { background: var(--tmu-info-fill); color: var(--tmu-info-strong); }
            .tmcf-type-cup { background: var(--tmu-warning-fill); color: var(--tmu-text-warm-accent); }
            .tmcf-type-international { background: var(--tmu-accent-fill-soft); color: var(--tmu-purple); }
            .tmcf-type-other { background: var(--tmu-surface-overlay-soft); color: var(--tmu-text-main); }

            .tmcf-opponent {
                display: flex;
                align-items: center;
                gap: var(--tmu-space-sm);
                min-width: 0;
            }

            .tmcf-opponent-label {
                color: var(--tmu-text-faint);
                font-size: var(--tmu-font-xs);
                font-weight: 700;
                letter-spacing: 0.45px;
                text-transform: uppercase;
            }

            .tmcf-opponent-name {
                min-width: 0;
            }

            .tmcf-opponent-name a,
            .tmcf-opponent-name span {
                color: var(--tmu-text-main);
                font-weight: 700;
            }

            .tmcf-venue {
                font-size: var(--tmu-font-xs);
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            .tmcf-venue-home { color: var(--tmu-success); }
            .tmcf-venue-away { color: var(--tmu-info); }

            .tmcf-result {
                font-weight: 800;
            }

            .tmcf-result a { color: var(--tmu-text-strong); }
            .tmcf-result-win a { color: var(--tmu-success); }
            .tmcf-result-draw a { color: var(--tmu-warning); }
            .tmcf-result-loss a { color: var(--tmu-danger); }
            .tmcf-result-upcoming a { color: var(--tmu-text-muted); }

        `;

        document.head.appendChild(style);
    },
};