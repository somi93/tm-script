const STYLE_ID = 'tmvu-players-page-style';

export const injectPlayersPageStyles = () => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-players-shell {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-lg);
            width: 100%;
            min-width: 0;
        }
        .tmvu-players-head {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-md);
            padding: 0 0 var(--tmu-space-sm);
        }
        .tmvu-players-title {
            margin: 0;
            color: var(--tmu-text-strong);
            font-size: 24px;
            font-weight: 800;
            letter-spacing: .01em;
        }
        .tmvu-players-controls {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--tmu-space-md);
            margin-bottom: var(--tmu-space-md);
        }
        .tmvu-players-sections {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-lg);
            min-width: 0;
        }
        .tmvu-players-sections > section {
            min-width: 0;
        }
        .tmvu-players-table-wrap {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow-x: auto;
            overflow-y: hidden;
        }
        .tmvu-players-section-title {
            margin: 0 0 var(--tmu-space-sm);
            font-size: var(--tmu-font-md);
            font-weight: 800;
            color: var(--tmu-text-strong);
        }
        .tmvu-players-table .tmvu-players-name a {
            color: var(--tmu-text-strong);
            text-decoration: none;
            font-weight: 700;
        }
        .tmvu-players-table .tmvu-players-name a:hover {
            color: var(--tmu-accent);
            text-decoration: none;
        }
        .tmvu-players-table .tmvu-players-pos {
            color: var(--tmu-text-muted);
            font-weight: 700;
            white-space: nowrap;
        }
        .tmvu-players-table .tmvu-players-r5 {
            color: var(--tmu-text-strong);
            font-weight: 700;
        }
        .tmvu-players-table .tmvu-players-r5.is-pending {
            color: var(--tmu-text-faint);
        }
        .tmvu-players-table .tmvu-players-delta {
            font-weight: 700;
        }
        .tmvu-players-table .tmvu-players-delta.pos {
            color: var(--tmu-success);
        }
        .tmvu-players-table .tmvu-players-delta.neg {
            color: var(--tmu-danger);
        }
        .tmvu-players-skill-cell {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1px;
            min-width: 44px;
            width: 100%;
            padding: 3px 4px;
            border-radius: var(--tmu-space-xs);
            font-weight: 700;
            color: var(--tmu-text-main);
        }
        .tmvu-players-skill-cell.gain-decimal {
            background: color-mix(in srgb, var(--tmu-success) 14%, transparent);
        }
        .tmvu-players-skill-cell.gain-integer {
            background: color-mix(in srgb, var(--tmu-success) 28%, transparent);
        }
        .tmvu-players-skill-cell.loss-decimal,
        .tmvu-players-skill-cell.loss-integer {
            background: color-mix(in srgb, var(--tmu-danger) 12%, transparent);
        }
        .tmvu-players-skill-cell.max {
            color: var(--tmu-metal-gold);
        }
        .tmvu-players-skill-cell.elite {
            color: var(--tmu-metal-silver);
        }
        .tmvu-players-skill-main {
            line-height: 1.1;
        }
        .tmvu-players-skill-delta {
            font-size: 10px;
            line-height: 1;
            font-weight: 700;
        }
        .tmvu-players-skill-delta.pos {
            color: var(--tmu-success-strong);
        }
        .tmvu-players-skill-delta.neg {
            color: var(--tmu-danger);
        }
        .tmvu-players-empty {
            padding: var(--tmu-space-md) 0;
            color: var(--tmu-text-muted);
        }
        .tmvu-players-source-frame {
            width: 0;
            height: 0;
            border: 0;
            position: absolute;
            left: -9999px;
            top: -9999px;
            opacity: 0;
            pointer-events: none;
        }
    `;

    document.head.appendChild(style);
};