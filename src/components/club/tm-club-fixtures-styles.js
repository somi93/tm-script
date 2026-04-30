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

            .tmcf-months-panel {
                background: var(--tmu-card-bg);
                border: 1px solid var(--tmu-border-soft-alpha);
                border-radius: var(--tmu-space-md);
                overflow: hidden;
                box-shadow: 0 14px 30px var(--tmu-shadow-elev);
            }

            .tmcf-summary {
                margin-bottom: 0;
            }

            .tmcf-summary.tmu-summary-strip-boxed {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: var(--tmu-space-md);
                padding: 0;
                background: transparent;
                border: 0;
            }

            .tmcf-summary.tmu-summary-strip-boxed .tmu-summary-item {
                min-width: 0;
                padding: var(--tmu-space-md) var(--tmu-space-md);
                background: var(--tmu-card-bg);
                border: 1px solid var(--tmu-border-soft);
                box-shadow: 0 8px 18px var(--tmu-shadow-soft);
            }

            .tmcf-summary .tmu-summary-value {
                font-size: var(--tmu-font-2xl);
                line-height: 1;
            }

            .tmcf-filters {
                display: flex;
                gap: var(--tmu-space-sm);
                flex-wrap: wrap;
                padding: var(--tmu-space-md);
                background: #1d290c;
                border: 1px solid var(--tmu-border-soft-alpha);
                border-radius: var(--tmu-space-md);
            }

            .tmcf-filters .tmu-btn {
                flex: 0 0 auto;
            }

            .tmcf-months-panel #tmcf-months {
                display: flex;
                flex-direction: column;
            }

            .tmcf-months-panel #tmcf-months > .tmu-tabs {
                background: var(--tmu-card-bg);
                box-shadow: inset 0 -1px 0 var(--tmu-border-soft-alpha);
            }

            .tmcf-months-panel #tmcf-months > .tmu-tabs .tmu-tab {
                min-height: 42px;
            }

            .tmcf-month-content {
                background: var(--tmu-fixture-panel-bg, var(--tmu-card-bg));
            }

            .tmcf-month-content .tmvu-fix-list {
                border-top: 1px solid var(--tmu-border-soft-alpha);
                background: var(--tmu-fixture-panel-bg, var(--tmu-card-bg));
            }

            @media (max-width: 1100px) {
                .tmcf-summary.tmu-summary-strip-boxed {
                    grid-template-columns: repeat(3, 1fr);
                }
            }

            @media (max-width: 700px) {
                .tmcf-summary.tmu-summary-strip-boxed {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;

        document.head.appendChild(style);
    },
};