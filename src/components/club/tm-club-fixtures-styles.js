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
                gap: 16px;
                width: 100%;
            }

            .tmcf-summary {
                display: grid;
                grid-template-columns: repeat(6, minmax(0, 1fr));
                gap: 12px;
            }

            .tmcf-stat {
                background: rgba(15, 37, 8, 0.6);
                border: 1px solid rgba(40, 69, 29, 0.9);
                border-radius: 8px;
                padding: 12px 10px;
                text-align: center;
            }

            .tmcf-stat-value {
                color: #eff8e8;
                font-size: 24px;
                font-weight: 800;
                line-height: 1;
            }

            .tmcf-stat-label {
                color: #6a9a58;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.6px;
                text-transform: uppercase;
                margin-top: 6px;
            }

            .tmcf-filters {
                display: flex;
                gap: 8px;
                flex-wrap: wrap;
            }

            .tmcf-filter-btn {
                background: rgba(42, 74, 28, 0.35);
                border: 1px solid #2a4a1c;
                border-radius: 999px;
                color: #8aac72;
                cursor: pointer;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.35px;
                padding: 6px 12px;
                transition: all 0.15s;
            }

            .tmcf-filter-btn:hover {
                background: rgba(42, 74, 28, 0.6);
                color: #c8e0b4;
            }

            .tmcf-filter-btn.is-active {
                background: rgba(108, 192, 64, 0.18);
                border-color: #6cc040;
                color: #eff8e8;
                box-shadow: 0 0 8px rgba(108, 192, 64, 0.15);
            }

            .tmcf-month {
                background: #1c3410;
                border: 1px solid #28451d;
                border-radius: 10px;
                box-shadow: 0 0 9px #192a19;
                overflow: hidden;
            }

            .tmcf-month-head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                width: 100%;
                padding: 12px 14px;
                background: rgba(24, 49, 13, 0.9);
                border-bottom: 1px solid rgba(40, 69, 29, 0.95);
                border-left: 0;
                border-right: 0;
                border-top: 0;
                cursor: pointer;
                text-align: left;
            }

            .tmcf-month-head-main {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                flex: 1 1 auto;
                min-width: 0;
            }

            .tmcf-month-title {
                color: #eff8e8;
                font-size: 15px;
                font-weight: 800;
            }

            .tmcf-month-meta {
                color: #6a9a58;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            .tmcf-month-arrow {
                color: #6a9a58;
                flex: 0 0 auto;
                font-size: 14px;
                transition: transform 0.15s ease, color 0.15s ease;
            }

            .tmcf-month.is-open .tmcf-month-arrow {
                color: #c8e0b4;
                transform: rotate(180deg);
            }

            .tmcf-table-wrap {
                padding: 8px 12px 10px;
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
                color: #a9c996;
                font-weight: 600;
            }

            .tmcf-type {
                display: inline-flex;
                align-items: center;
                min-width: 88px;
                justify-content: center;
                border-radius: 999px;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.45px;
                padding: 4px 8px;
                text-transform: uppercase;
            }

            .tmcf-type-league { background: rgba(86, 162, 58, 0.18); color: #9fe56d; }
            .tmcf-type-friendly { background: rgba(73, 111, 167, 0.2); color: #86b7ff; }
            .tmcf-type-cup { background: rgba(174, 129, 35, 0.24); color: #ffd46b; }
            .tmcf-type-international { background: rgba(128, 95, 190, 0.22); color: #d0b5ff; }
            .tmcf-type-other { background: rgba(112, 112, 112, 0.18); color: #d4dccd; }

            .tmcf-opponent {
                display: flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
            }

            .tmcf-opponent-label {
                color: #6a9a58;
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.45px;
                text-transform: uppercase;
            }

            .tmcf-opponent-name {
                min-width: 0;
            }

            .tmcf-opponent-name a,
            .tmcf-opponent-name span {
                color: #c8e0b4;
                font-weight: 700;
            }

            .tmcf-venue {
                font-size: 10px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            .tmcf-venue-home { color: #80e048; }
            .tmcf-venue-away { color: #86b7ff; }

            .tmcf-result {
                font-weight: 800;
            }

            .tmcf-result a { color: #eff8e8; }
            .tmcf-result-win a { color: #80e048; }
            .tmcf-result-draw a { color: #ffd46b; }
            .tmcf-result-loss a { color: #f87171; }
            .tmcf-result-upcoming a { color: #8aac72; }

            .tmcf-empty,
            .tmcf-error {
                background: #1c3410;
                border: 1px solid #28451d;
                border-radius: 10px;
                box-shadow: 0 0 9px #192a19;
                color: #90b878;
                font-size: 13px;
                padding: 28px 20px;
                text-align: center;
            }

            @media (max-width: 1100px) {
                .tmcf-summary {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }
            }

            @media (max-width: 760px) {
                .tmcf-summary {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }

                .tmcf-month-head {
                    align-items: flex-start;
                    flex-direction: column;
                }

                .tmcf-month-head-main {
                    align-items: flex-start;
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(style);
    },
};