export const TmDbRepairStyles = {
        inject() {
            if (document.getElementById('tmrep-styles')) return;
            const style = document.createElement('style');
            style.id = 'tmrep-styles';
            style.textContent = `
        #tmrep-panel {
            background: #1c3410; border: 1px solid #2a4a1c; border-radius: 10px;
            padding: 16px; margin: 10px 0 16px 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #c8e0b4; max-width: 820px;
        }
        #tmrep-panel h2 { color: #6cc040; margin: 0 0 10px 0; font-size: 15px; }
        #tmrep-stats { font-size: 12px; color: #90b878; margin-bottom: 10px; }
        .tmrep-btn {
            background: #2a4a1c; border: 1px solid #6cc040; color: #6cc040;
            padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 13px;
            font-weight: 700; margin-right: 8px;
        }
        .tmrep-btn:hover { background: #3a6a28; }
        .tmrep-btn:disabled { opacity: 0.4; cursor: default; }
        .tmrep-bar-wrap {
            margin-top: 10px; background: rgba(108,192,64,0.1); border-radius: 6px;
            height: 12px; border: 1px solid rgba(108,192,64,0.3); overflow: hidden;
        }
        #tmrep-bar {
            height: 100%; width: 0%;
            background: linear-gradient(90deg, #3d6828, #6cc040);
            border-radius: 6px; transition: width 0.3s;
        }
        #tmrep-status { font-size: 11px; color: #6a9a58; margin-top: 5px; min-height: 14px; }
        #tmrep-log {
            margin-top: 10px; max-height: 220px; overflow-y: auto;
            font-size: 10px; font-family: monospace; line-height: 1.5;
            background: #0e1f0a; border-radius: 6px;
            padding: 8px; border: 1px solid #2a4a1c;
        }
        .tmrep-ok   { color: #6cc040; }
        .tmrep-err  { color: #f87171; }
        .tmrep-info { color: #6a9a58; }
`;
            document.head.appendChild(style);
        }
    };

