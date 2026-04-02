export const TmDbRepairStyles = {
    inject() {
        if (document.getElementById('tmrep-styles')) return;
        const style = document.createElement('style');
        style.id = 'tmrep-styles';
        style.textContent = `
        #tmrep-panel,
        #tmmeta-panel,
        #tmrtn-panel,
        #tmkey-panel {
            background: var(--tmu-surface-panel); border: 1px solid var(--tmu-border-soft); border-radius: var(--tmu-space-md);
            padding: var(--tmu-space-lg); margin: var(--tmu-space-md) 0 var(--tmu-space-lg) 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: var(--tmu-text-main); max-width: 820px;
        }
        #tmrep-panel h2, #tmmeta-panel h2, #tmrtn-panel h2, #tmkey-panel h2 { color: var(--tmu-success); margin: 0 0 var(--tmu-space-md) 0; font-size: var(--tmu-font-md); }
        #tmrep-stats, #tmmeta-stats, #tmrtn-stats, #tmkey-stats { font-size: var(--tmu-font-sm); color: var(--tmu-text-panel-label); margin-bottom: var(--tmu-space-md); }
        .tmrep-bar-wrap {
            margin-top: var(--tmu-space-md); background: var(--tmu-success-fill); border-radius: var(--tmu-space-sm);
            height: 12px; border: 1px solid var(--tmu-border-success); overflow: hidden;
        }
        #tmrep-bar {
            height: 100%; width: 0%;
            background: linear-gradient(90deg, var(--tmu-border-embedded), var(--tmu-success));
            border-radius: var(--tmu-space-sm); transition: width 0.3s;
        }
        #tmrep-status { font-size: var(--tmu-font-xs); color: var(--tmu-text-faint); margin-top: var(--tmu-space-xs); min-height: 14px; }
        #tmrep-log {
            margin-top: var(--tmu-space-md); max-height: 220px; overflow-y: auto;
            font-size: var(--tmu-font-xs); font-family: monospace; line-height: 1.5;
            background: var(--tmu-surface-card-soft); border-radius: var(--tmu-space-sm);
            padding: var(--tmu-space-sm); border: 1px solid var(--tmu-border-soft);
        }
        .tmrep-ok   { color: var(--tmu-success); }
        .tmrep-err  { color: var(--tmu-danger); }
        .tmrep-info { color: var(--tmu-text-faint); }
`;
        document.head.appendChild(style);
    }
};

