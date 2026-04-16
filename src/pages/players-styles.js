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
        }
        .tmvu-players-no {
            cursor: pointer;
            color: var(--tmu-text-muted);
            font-weight: 700;
            border-radius: 3px;
            padding: 1px 4px;
            transition: background 0.15s, color 0.15s;
        }
        .tmvu-players-no:hover {
            background: var(--tmu-surface-item-hover);
            color: var(--tmu-text-strong);
        }
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
        .tmvu-players-team-panel { margin-bottom: var(--tmu-space-lg); }
        .tmvu-players-panel-body { padding: var(--tmu-space-md) var(--tmu-space-md) var(--tmu-space-sm); }
        .tmvu-players-team-title { font-size: var(--tmu-font-md); font-weight: 700; color: var(--tmu-text-strong); }
        .tmvu-players-team-count { color: var(--tmu-text-muted); font-weight: 400; margin-left: var(--tmu-space-xs); }
        .tmvu-players-section-title {
            margin: var(--tmu-space-md) 0 var(--tmu-space-sm);
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            color: var(--tmu-text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .tmvu-players-name {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-xs);
        }
        .tmvu-players-name a {
            color: var(--tmu-text-inverse);    
        }
        .tmvu-players-flag { display: inline-block; vertical-align: middle; flex-shrink: 0; }
            color: var(--tmu-text-inverse);
            text-decoration: none;
            font-weight: 700;
        }
        .tmvu-players-name a:hover {
            color: var(--tmu-accent);
            text-decoration: none;
        }
        .tmvu-players-pos {
            color: var(--tmu-text-muted);
            font-weight: 700;
            white-space: nowrap;
        }
        .tmvu-players-r5 {
            color: var(--tmu-text-strong);
            font-weight: 700;
        }
        .tmvu-players-r5-stack {
            display: inline-flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
        }
        .tmvu-players-r5.is-pending {
            color: var(--tmu-text-faint);
        }
        .tmvu-players-delta {
            font-size: 10px;
            font-weight: 700;
            line-height: 1;
        }
        .tmvu-players-delta.pos {
            color: var(--tmu-success);
        }
        .tmvu-players-delta.neg {
            color: var(--tmu-danger);
        }
        .tmvu-players-delta.zero {
            color: var(--tmu-text-faint);
        }
        .tmvu-players-skill-cell {
            display: inline-flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1px;
            min-width: 44px;
            width: calc(100% - 4px);
            margin: 0 1px;
            padding: 2px;
            border-radius: var(--tmu-space-xs);
            font-weight: 700;
            color: var(--tmu-text-main);
            position: relative;
        }
        .tmvu-players-skill-arrow {
            position: absolute;
            left: 3px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 9px;
            line-height: 1;
        }
        .tmvu-players-skill-arrow.up { color: var(--tmu-success-strong); }
        .tmvu-players-skill-arrow.down { color: var(--tmu-danger); }
        .tmvu-players-skill-cell.gain-decimal {
            background: color-mix(in srgb, var(--tmu-success) 15%, transparent);
        }
        .tmvu-players-skill-cell.gain-integer {
            background: color-mix(in srgb, var(--tmu-success) 50%, transparent);
        }
        .tmvu-players-skill-cell.loss-decimal {
            background: color-mix(in srgb, var(--tmu-danger) 22%, transparent);
        }
        .tmvu-players-skill-cell.loss-integer {
            background: color-mix(in srgb, var(--tmu-danger) 38%, transparent);
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
        body.tmvu-shell-active .tmvu-players-page.tmvu-main {
            width: min(1400px, calc(100% - 24px)) !important;
            max-width: 1400px !important;
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