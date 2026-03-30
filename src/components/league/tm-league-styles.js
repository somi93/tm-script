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
                gap: 8px;
                padding: 10px 14px;
                border-bottom: 1px solid var(--tmu-border-input-overlay);
                font-size: 13px;
                color: var(--tmu-text-main);
            }
            .tsa-progress {
                font-size: 12px;
                color: var(--tmu-text-faint);
                margin-left: auto;
            }
            .tmvu-main.tmvu-league-layout {
                display: flex;
                gap: 16px;
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

            .tmvu-league-feed-native-source {
                display: none !important;
            }

            .tmvu-league-feed-card {
                margin-bottom: 12px;
            }

            .tmvu-league-feed-card .tmu-card {
                border: 1px solid var(--tmu-border-soft);
                border-radius: 14px;
                overflow: hidden;
                background: radial-gradient(circle at top left, rgba(108, 192, 64, 0.08), transparent 42%), linear-gradient(180deg, var(--tmu-surface-card-soft) 0%, var(--tmu-surface-embedded) 100%);
                box-shadow: 0 14px 30px var(--tmu-shadow-panel);
            }

            .tmvu-league-feed-card .tmu-card-body,
            .tmvu-league-feed-card-body {
                padding: 0 !important;
                gap: 0 !important;
            }

            .tmvu-league-feed-card .tmu-tabs {
                background: linear-gradient(180deg, rgba(108,192,64,.14), rgba(108,192,64,.04));
                border: none;
                border-bottom: 1px solid var(--tmu-border-faint);
                padding: 0 8px;
                gap: 6px;
                overflow-x: auto;
            }

            .tmvu-league-feed-card .tmu-tab {
                min-height: 48px;
                padding: 0 16px;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: .08em;
                color: var(--tmu-tabs-primary-text);
                border-bottom: 2px solid transparent;
            }

            .tmvu-league-feed-card .tmu-tab:hover:not(:disabled) {
                background: var(--tmu-border-contrast);
                color: var(--tmu-tabs-primary-hover-text);
            }

            .tmvu-league-feed-card .tmu-tab.active {
                background: linear-gradient(180deg, var(--tmu-border-contrast), rgba(255,255,255,0));
                color: var(--tmu-tabs-primary-active-text);
                border-bottom-color: var(--tmu-tabs-primary-active-border);
            }

            .tmvu-league-feed-panel {
                padding: 0;
            }

            /* ── Sidebar restyling ── */
            .tmvu-league-sidebar .box {
                background: var(--tmu-surface-card) !important;
                border: 1px solid var(--tmu-border-success) !important;
                border-radius: 8px !important;
                box-shadow: 0 12px 24px var(--tmu-shadow-elev) !important;
                overflow: hidden !important;
                margin-bottom: 10px !important;
            }
            .tmvu-league-sidebar .box h2 {
                background: transparent !important;
                color: var(--tmu-text-panel-label) !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                letter-spacing: 0.5px !important;
                text-transform: uppercase !important;
                padding: 10px 14px 8px !important;
                border-bottom: 1px solid var(--tmu-border-success) !important;
                margin: 0 !important;
            }
            .tmvu-league-sidebar .box table {
                background: transparent !important;
            }
            .tmvu-league-sidebar .box td, .tmvu-league-sidebar .box th {
                color: var(--tmu-text-main) !important;
                border-color: var(--tmu-border-input-overlay) !important;
                font-size: 13px !important;
            }
            .tmvu-league-sidebar .box tr:nth-child(even) td { background: var(--tmu-surface-panel) !important; }
            .tmvu-league-sidebar .box tr:nth-child(odd) td  { background: var(--tmu-surface-card-soft) !important; }
            .tmvu-league-sidebar .box a { color: var(--tmu-text-main) !important; }
            .tmvu-league-sidebar .box a:hover { color: var(--tmu-text-strong) !important; }
            /* Hide the native overall_table container */
            #overall_table_wrapper, #tsa-standings-native-wrap { display: none !important; }
            .tmvu-league-sidebar .box{display: none !important;}
           
            /* ── History mode banner ── */
            .tsa-history-banner {
                display: flex; align-items: center; gap: 8px;
                padding: 5px 10px; font-size: 10px; font-weight: 700;
                color: var(--tmu-warning); background: var(--tmu-warning-fill);
                border-bottom: 1px solid var(--tmu-border-warning);
            }
            /* ── Feed ── */
            .tsa-feed-list { display: flex; flex-direction: column; }
            .tsa-feed-entry {
                display: flex; gap: 8px; padding: 8px 10px;
                border-bottom: 1px solid var(--tmu-border-faint);
            }
            .tsa-feed-entry:last-child { border-bottom: none; }
            .tsa-feed-sub {
                padding: 5px 8px; background: var(--tmu-surface-overlay);
                border-left: 2px solid var(--tmu-border-success);
                margin: 2px 0;
            }
            .tsa-feed-logo { flex-shrink: 0; width: 25px; }
            .tsa-feed-icon { width: 25px; height: 25px; object-fit: contain; border-radius: 3px; }
            .tsa-feed-body { flex: 1; min-width: 0; }
            .tsa-feed-text { font-size: 11px; color: var(--tmu-text-main); line-height: 1.5; }
            .tsa-feed-club { color: var(--tmu-success); text-decoration: none; font-weight: 600; }
            .tsa-feed-club:hover { color: var(--tmu-text-strong); }
            .tsa-feed-player { color: var(--tmu-text-panel-label); text-decoration: none; }
            .tsa-feed-player:hover { color: var(--tmu-text-strong); }
            .tsa-feed-link { color: var(--tmu-text-faint); text-decoration: none; }
            .tsa-feed-link:hover { color: var(--tmu-text-main); }
            .tsa-feed-money { color: var(--tmu-warning); font-weight: 700; }
            .tsa-feed-stars { color: var(--tmu-success); letter-spacing: 1px; }
            .tsa-feed-time { color: var(--tmu-text-dim); font-size: 10px; margin-left: 6px; white-space: nowrap; }
            .tsa-feed-actions { display: flex; gap: 10px; margin-top: 3px; }
            .tsa-feed-like-btn {
                font-size: 11px; color: var(--tmu-text-dim); cursor: pointer;
                display: flex; align-items: center; gap: 2px;
                transition: color 0.12s; user-select: none;
            }
            .tsa-feed-like-btn:hover { color: var(--tmu-success); }
            .tsa-feed-like-btn[data-liked="1"] { color: var(--tmu-danger); }
            .tsa-feed-subs { margin-top: 3px; }
            .tsa-feed-more {
                font-size: 10px; color: var(--tmu-text-dim); cursor: pointer;
                margin-top: 4px; padding: 2px 0; user-select: none;
            }
            .tsa-feed-more:hover { color: var(--tmu-success); }

            /* ── Native #feed reskin ── */
            #feed {
                background: rgba(8,18,4,0.88) !important;
                color: var(--tmu-text-main) !important; 
            }
            #feed .tsa-feed-top {
                background: rgba(0,0,0,0.35) !important;
                border-bottom: 1px solid var(--tmu-border-success) !important;
                padding: 5px 10px !important; color: var(--tmu-text-panel-label) !important; font-size: 11px !important;
            }
            #feed .tsa-feed-post { background: transparent !important; padding: 8px 10px !important; border-bottom: 1px solid var(--tmu-border-faint) !important; }
            #feed .tsa-feed-post:hover { background: rgba(61,104,40,0.05) !important; }
            #feed .tsa-feed-post-text { font-size: 13px !important; line-height: 1.5 !important; color: var(--tmu-text-inverse) !important; }
            #feed .tsa-feed-post-text a, #feed .tsa-feed-post-text .tsa-feed-nowrap a { color: var(--tmu-success) !important; text-decoration: none !important; }
            #feed .tsa-feed-post-text a:hover { color: var(--tmu-text-strong) !important; }
            #feed .tsa-feed-post-text .tsa-feed-subtle { color: var(--tmu-text-disabled) !important; font-size: 10px !important; }
            #feed .tsa-feed-like { font-size: 11px !important; font-weight: 700 !important; color: var(--tmu-text-inverse) !important; }
            #feed .tsa-feed-like-hidden { visibility: hidden !important; }
            #feed .tsa-feed-hover-options { font-size: 10px !important; }
            #feed .tsa-feed-hover-options .tsa-feed-link { color: var(--tmu-text-dim) !important; }
            #feed .tsa-feed-hover-options .tsa-feed-link:hover { color: var(--tmu-success) !important; }
            #feed .tsa-feed-hover-options .tsa-feed-like-icon { opacity: 0.55 !important; cursor: pointer !important; filter: sepia(1) saturate(2) hue-rotate(60deg) !important; }
            #feed .tsa-feed-hover-options .tsa-feed-like-icon:hover { opacity: 1 !important; }
            #feed .tsa-feed-comments { margin-top: 5px !important; }
            #feed .tsa-feed-comment-text { font-size: 12px !important; color: var(--tmu-text-inverse) !important; }
            #feed .tsa-feed-comment-text a { color: var(--tmu-success) !important; text-decoration: none !important; }
            #feed .tsa-feed-comment-text a:hover { color: var(--tmu-text-main) !important; }
            #feed .tsa-feed-comment-like.tsa-feed-positive { background-color: var(--tmu-success) !important; font-size: 10px !important; }
            #feed .tsa-feed-comment-time { color: var(--tmu-text-disabled) !important; font-size: 10px !important; }
            #feed .tsa-feed-comment-like.tsa-feed-like-icon { opacity: 0.4 !important; cursor: pointer !important; }
            #feed .tsa-feed-comment-like.tsa-feed-like-icon:hover { opacity: 0.9 !important; }
            #feed .tsa-feed-hidden-comments-link .tsa-feed-link { color: var(--tmu-text-disabled) !important; font-size: 10px !important; }
            #feed .tsa-feed-hidden-comments-link .tsa-feed-link:hover { color: var(--tmu-success) !important; }
            #feed .tsa-feed-similar-show, #feed .tsa-feed-similar-hide {
                color: var(--tmu-text-disabled) !important;font-size: 12px !important;
            }
            #feed .tsa-feed-similar-show:hover, #feed .tsa-feed-similar-hide:hover { color: var(--tmu-text-faint) !important; }
            #feed .tsa-feed-textarea-placeholder {
                color: var(--tmu-text-dim) !important; font-size: 11px !important; cursor: text !important;
                background: rgba(0,0,0,0.25) !important; border: 1px solid var(--tmu-border-success) !important;
                border-radius: 3px !important; padding: 3px 7px !important;
            }
            #feed .tsa-feed-comment-box textarea {
                background: rgba(0,0,0,0.35) !important; color: var(--tmu-text-main) !important;
                border: 1px solid var(--tmu-border-input-overlay) !important; border-radius: 3px !important;
                font-size: 11px !important;
            }
            #feed .tsa-feed-comment-button .tsa-feed-button-border {
                background: var(--tmu-surface-tab-hover) !important; color: var(--tmu-text-panel-label) !important;
                border: 1px solid var(--tmu-border-input-overlay) !important; font-size: 11px !important;
                padding: 3px 10px !important; border-radius: 3px !important; cursor: pointer !important;
            }
            #feed .tsa-feed-comment-button .tsa-feed-button-border:hover { background: rgba(108,192,64,0.3) !important; color: var(--tmu-text-main) !important; }
            #feed .tsa-feed-post-menu > div { color: var(--tmu-text-disabled-strong) !important; font-size: 16px !important; }
            #feed .tsa-feed-post-menu-list {
                background: var(--tmu-surface-embedded) !important; border: 1px solid var(--tmu-border-input-overlay) !important;
                border-radius: 4px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;
            }
            #feed .tsa-feed-post-menu-item { color: var(--tmu-text-muted) !important; font-size: 11px !important; padding: 5px 12px !important; }
            #feed .tsa-feed-post-menu-item:hover { background: var(--tmu-surface-tab-hover) !important; color: var(--tmu-text-main) !important; }

            #press_link .button_border {
                background: var(--tmu-surface-tab-hover) !important; color: var(--tmu-text-panel-label) !important;
                border: 1px solid var(--tmu-border-input-overlay) !important; border-radius: 3px !important;
                font-size: 11px !important; padding: 4px 12px !important; cursor: pointer !important;
            }
            #press_link .button_border:hover { background: rgba(108,192,64,0.3) !important; color: var(--tmu-text-main) !important; }
        `;
    document.head.appendChild(style);
};

export const TmLeagueStyles = { inject };
