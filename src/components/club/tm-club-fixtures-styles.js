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

            .tmcf-month-content {
                padding-top: var(--tmu-space-sm);
            }
        `;

        document.head.appendChild(style);
    },
};