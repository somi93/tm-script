// tm-league-styles.js - League page CSS injection
// Depends on: nothing
// Exposed as: TmLeagueStyles = { inject }

const inject = () => {
    if (document.getElementById('tsa-league-style')) return;
    const style = document.createElement('style');
    style.id = 'tsa-league-style';
    style.textContent = `
            .tmvu-main.tmvu-league-layout {
                --tsa-surface-main: #18310d;
                --tsa-surface-main-2: #13280a;
                --tsa-surface-side: #1d3911;
                --tsa-surface-side-2: #17300d;
                --tsa-border-strong: rgba(103, 156, 63, 0.34);
                --tsa-border-soft: rgba(61,104,40,0.34);
                --tsa-shadow: 0 12px 28px rgba(0,0,0,0.24);
            }

            .tsa-controls {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 10px 14px;
                border-bottom: 1px solid var(--tsa-border-soft);
                font-size: 13px;
                color: #c8e0b4;
            }
            .tsa-progress {
                font-size: 12px;
                color: #6a9a58;
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
                border: 1px solid #28451d;
                border-radius: 14px;
                overflow: hidden;
                background: radial-gradient(circle at top left, rgba(108, 192, 64, 0.08), transparent 42%), linear-gradient(180deg, #16280f 0%, #12200d 100%);
                box-shadow: 0 14px 30px rgba(4,12,4,.34);
            }

            .tmvu-league-feed-card .tmu-card-body,
            .tmvu-league-feed-card-body {
                padding: 0 !important;
                gap: 0 !important;
            }

            .tmvu-league-feed-card .tmu-tabs {
                background: linear-gradient(180deg, rgba(108,192,64,.14), rgba(108,192,64,.04));
                border: none;
                border-bottom: 1px solid rgba(106,154,88,.16);
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
                color: #89aa73;
                border-bottom: 2px solid transparent;
            }

            .tmvu-league-feed-card .tmu-tab:hover:not(:disabled) {
                background: rgba(255,255,255,.025);
                color: #d7efbf;
            }

            .tmvu-league-feed-card .tmu-tab.active {
                background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,0));
                color: #eef8e8;
                border-bottom-color: #8fcd55;
            }

            .tmvu-league-feed-panel {
                padding: 0;
            }

            /* ── Sidebar restyling ── */
            .tmvu-league-sidebar .box {
                background: var(--tsa-surface-side) !important;
                border: 1px solid rgba(111,168,67,0.26) !important;
                border-radius: 8px !important;
                box-shadow: 0 12px 24px rgba(0,0,0,0.24) !important;
                overflow: hidden !important;
                margin-bottom: 10px !important;
            }
            .tmvu-league-sidebar .box h2 {
                background: transparent !important;
                color: #86b367 !important;
                font-size: 11px !important;
                font-weight: 700 !important;
                letter-spacing: 0.5px !important;
                text-transform: uppercase !important;
                padding: 10px 14px 8px !important;
                border-bottom: 1px solid rgba(111,168,67,0.2) !important;
                margin: 0 !important;
            }
            .tmvu-league-sidebar .box table {
                background: transparent !important;
            }
            .tmvu-league-sidebar .box td, .tmvu-league-sidebar .box th {
                color: #c8e0b4 !important;
                border-color: rgba(42,74,28,0.4) !important;
                font-size: 13px !important;
            }
            .tmvu-league-sidebar .box tr:nth-child(even) td { background: #1c3510 !important; }
            .tmvu-league-sidebar .box tr:nth-child(odd) td  { background: #172d0d !important; }
            .tmvu-league-sidebar .box a { color: #c8e0b4 !important; }
            .tmvu-league-sidebar .box a:hover { color: #e8f5d8 !important; }
            /* Hide the native overall_table container */
            #overall_table_wrapper, #tsa-standings-native-wrap { display: none !important; }
            .tmvu-league-sidebar .box{display: none !important;}
           
            /* ── History mode banner ── */
            .tsa-history-banner {
                display: flex; align-items: center; gap: 8px;
                padding: 5px 10px; font-size: 10px; font-weight: 700;
                color: #fbbf24; background: rgba(251,191,36,0.08);
                border-bottom: 1px solid rgba(251,191,36,0.25);
            }
            /* ── Feed ── */
            .tsa-feed-list { display: flex; flex-direction: column; }
            .tsa-feed-entry {
                display: flex; gap: 8px; padding: 8px 10px;
                border-bottom: 1px solid rgba(61,104,40,0.2);
            }
            .tsa-feed-entry:last-child { border-bottom: none; }
            .tsa-feed-sub {
                padding: 5px 8px; background: rgba(0,0,0,0.15);
                border-left: 2px solid rgba(61,104,40,0.3);
                margin: 2px 0;
            }
            .tsa-feed-logo { flex-shrink: 0; width: 25px; }
            .tsa-feed-icon { width: 25px; height: 25px; object-fit: contain; border-radius: 3px; }
            .tsa-feed-body { flex: 1; min-width: 0; }
            .tsa-feed-text { font-size: 11px; color: #c8e0b4; line-height: 1.5; }
            .tsa-feed-club { color: #6cc040; text-decoration: none; font-weight: 600; }
            .tsa-feed-club:hover { color: #e8f8d8; }
            .tsa-feed-player { color: #a0d878; text-decoration: none; }
            .tsa-feed-player:hover { color: #e8f8d8; }
            .tsa-feed-link { color: #6a9a58; text-decoration: none; }
            .tsa-feed-link:hover { color: #c8e0b4; }
            .tsa-feed-money { color: #fbbf24; font-weight: 700; }
            .tsa-feed-stars { color: #6cc040; letter-spacing: 1px; }
            .tsa-feed-time { color: #3d6828; font-size: 10px; margin-left: 6px; white-space: nowrap; }
            .tsa-feed-actions { display: flex; gap: 10px; margin-top: 3px; }
            .tsa-feed-like-btn {
                font-size: 11px; color: #4a7038; cursor: pointer;
                display: flex; align-items: center; gap: 2px;
                transition: color 0.12s; user-select: none;
            }
            .tsa-feed-like-btn:hover { color: #6cc040; }
            .tsa-feed-like-btn[data-liked="1"] { color: #ef4444; }
            .tsa-feed-subs { margin-top: 3px; }
            .tsa-feed-more {
                font-size: 10px; color: #4a7038; cursor: pointer;
                margin-top: 4px; padding: 2px 0; user-select: none;
            }
            .tsa-feed-more:hover { color: #6cc040; }

            /* ── Native #feed reskin ── */
            #feed {
                background: rgba(8,18,4,0.88) !important;
                color: #c8e0b4 !important; 
            }
            #feed .tsa-feed-top {
                background: rgba(0,0,0,0.35) !important;
                border-bottom: 1px solid rgba(61,104,40,0.3) !important;
                padding: 5px 10px !important; color: #3d6828 !important; font-size: 11px !important;
            }
            #feed .tsa-feed-post { background: transparent !important; padding: 8px 10px !important; border-bottom: 1px solid rgba(61,104,40,0.18) !important; }
            #feed .tsa-feed-post:hover { background: rgba(61,104,40,0.05) !important; }
            #feed .tsa-feed-post-text { font-size: 13px !important; line-height: 1.5 !important; color: #fff !important; }
            #feed .tsa-feed-post-text a, #feed .tsa-feed-post-text .tsa-feed-nowrap a { color: #6cc040 !important; text-decoration: none !important; }
            #feed .tsa-feed-post-text a:hover { color: #d0f0b0 !important; }
            #feed .tsa-feed-post-text .tsa-feed-subtle { color: #ddd !important; font-size: 10px !important; }
            #feed .tsa-feed-like { font-size: 11px !important; font-weight: 700 !important; color: #fff !important; }
            #feed .tsa-feed-like-hidden { visibility: hidden !important; }
            #feed .tsa-feed-hover-options { font-size: 10px !important; }
            #feed .tsa-feed-hover-options .tsa-feed-link { color: #4a7038 !important; }
            #feed .tsa-feed-hover-options .tsa-feed-link:hover { color: #6cc040 !important; }
            #feed .tsa-feed-hover-options .tsa-feed-like-icon { opacity: 0.55 !important; cursor: pointer !important; filter: sepia(1) saturate(2) hue-rotate(60deg) !important; }
            #feed .tsa-feed-hover-options .tsa-feed-like-icon:hover { opacity: 1 !important; }
            #feed .tsa-feed-comments { margin-top: 5px !important; }
            #feed .tsa-feed-comment-text { font-size: 12px !important; color: #fff !important; }
            #feed .tsa-feed-comment-text a { color: #5a9040 !important; text-decoration: none !important; }
            #feed .tsa-feed-comment-text a:hover { color: #c8e0b4 !important; }
            #feed .tsa-feed-comment-like.tsa-feed-positive { background-color: #070 !important; font-size: 10px !important; }
            #feed .tsa-feed-comment-time { color: #ccc !important; font-size: 10px !important; }
            #feed .tsa-feed-comment-like.tsa-feed-like-icon { opacity: 0.4 !important; cursor: pointer !important; }
            #feed .tsa-feed-comment-like.tsa-feed-like-icon:hover { opacity: 0.9 !important; }
            #feed .tsa-feed-hidden-comments-link .tsa-feed-link { color: #ccc !important; font-size: 10px !important; }
            #feed .tsa-feed-hidden-comments-link .tsa-feed-link:hover { color: #6cc040 !important; }
            #feed .tsa-feed-similar-show, #feed .tsa-feed-similar-hide {
                color: #a5aca1 !important;font-size: 12px !important;
            }
            #feed .tsa-feed-similar-show:hover, #feed .tsa-feed-similar-hide:hover { color: #6a9a58 !important; }
            #feed .tsa-feed-textarea-placeholder {
                color: #3d6828 !important; font-size: 11px !important; cursor: text !important;
                background: rgba(0,0,0,0.25) !important; border: 1px solid rgba(61,104,40,0.3) !important;
                border-radius: 3px !important; padding: 3px 7px !important;
            }
            #feed .tsa-feed-comment-box textarea {
                background: rgba(0,0,0,0.35) !important; color: #c8e0b4 !important;
                border: 1px solid rgba(61,104,40,0.45) !important; border-radius: 3px !important;
                font-size: 11px !important;
            }
            #feed .tsa-feed-comment-button .tsa-feed-button-border {
                background: rgba(61,104,40,0.35) !important; color: #90b878 !important;
                border: 1px solid rgba(61,104,40,0.5) !important; font-size: 11px !important;
                padding: 3px 10px !important; border-radius: 3px !important; cursor: pointer !important;
            }
            #feed .tsa-feed-comment-button .tsa-feed-button-border:hover { background: rgba(108,192,64,0.3) !important; color: #c8e0b4 !important; }
            #feed .tsa-feed-post-menu > div { color: #2d4820 !important; font-size: 16px !important; }
            #feed .tsa-feed-post-menu-list {
                background: #0c1a07 !important; border: 1px solid rgba(61,104,40,0.5) !important;
                border-radius: 4px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.6) !important;
            }
            #feed .tsa-feed-post-menu-item { color: #5a8a48 !important; font-size: 11px !important; padding: 5px 12px !important; }
            #feed .tsa-feed-post-menu-item:hover { background: rgba(61,104,40,0.3) !important; color: #c8e0b4 !important; }

            #press_link .button_border {
                background: rgba(61,104,40,0.3) !important; color: #90b878 !important;
                border: 1px solid rgba(61,104,40,0.5) !important; border-radius: 3px !important;
                font-size: 11px !important; padding: 4px 12px !important; cursor: pointer !important;
            }
            #press_link .button_border:hover { background: rgba(108,192,64,0.3) !important; color: #c8e0b4 !important; }
        `;
    document.head.appendChild(style);
};

export const TmLeagueStyles = { inject };
