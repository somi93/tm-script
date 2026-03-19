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
            .tsa-input {
                width: 48px;
                padding: 4px 6px;
                text-align: center;
                background: rgba(0,0,0,0.22);
                border: 1px solid rgba(103,156,63,0.34);
                border-radius: 5px;
                color: #e8f5d8;
                font-size: 13px;
                outline: none;
            }
            .tsa-input:focus { border-color: #6cc040; }
            .tsa-btn {
                padding: 6px 14px;
                background: #476f2c;
                border: none;
                border-radius: 6px;
                color: #e8f5d8;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                transition: background 0.15s;
            }
            .tsa-btn:hover { background: #5a8538; }
            .tsa-btn:disabled { opacity: 0.3; cursor: default; }
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
            /* Navigation tabs — player script style */
            .tsa-nav-tabs {
                display: flex;
                background: rgba(0,0,0,0.18);
                border: 1px solid var(--tsa-border-soft);
                border-radius: 8px 8px 0 0;
                overflow: hidden;
                margin-bottom: 6px;
            }
            .tsa-tab {
                flex: 1;
                padding: 9px 12px;
                text-align: center;
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #90b878;
                border: none;
                border-bottom: 2px solid transparent;
                transition: all 0.15s;
                background: transparent;
                text-decoration: none !important;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                white-space: nowrap;
            }
            .tsa-tab-icon { font-size: 14px; line-height: 1; }
            .tsa-tab:hover { color: #c8e0b4; background: rgba(74, 120, 43, 0.35); }
            .tsa-tab.tsa-tab-active { color: #e8f5d8; border-bottom-color: #6cc040; background: rgba(79, 132, 44, 0.34); }

            /* ── History mode banner ── */
            .tsa-history-banner {
                display: flex; align-items: center; gap: 8px;
                padding: 5px 10px; font-size: 10px; font-weight: 700;
                color: #fbbf24; background: rgba(251,191,36,0.08);
                border-bottom: 1px solid rgba(251,191,36,0.25);
            }
            .tsa-history-live-btn {
                background: none; border: 1px solid rgba(251,191,36,0.4);
                border-radius: 3px; color: #fbbf24; font-size: 10px;
                font-weight: 700; cursor: pointer; padding: 1px 6px;
                margin-left: auto;
            }
            .tsa-history-live-btn:hover { background: rgba(251,191,36,0.15); }

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

            /* ── Feed box outer shell ── */
            .box:has(#feed) {
                background: rgba(8,18,4,0.92) !important;
                border: 1px solid rgba(61,104,40,0.45) !important;
                border-radius: 6px !important; overflow: hidden !important;
            }
            .box:has(#feed) .box_shadow { display: none !important; }
            .tsa-feed-head {
                background: rgba(0,0,0,0.5);
                border-bottom: 1px solid rgba(61,104,40,0.3);
                padding: 7px 12px;
            }
            .tsa-feed-head h2 {
                color: #6cc040; font-size: 13px; margin: 0;
            }
            .box:has(#feed) .box_footer {
            display: none !important;
            }
            .box:has(#feed) .tabs_outer,
            .tsa-feed-tabs-outer {
                display: block !important;
                background: transparent;
                margin: 0;
                padding: 0;
            }
            .box:has(#feed) .tabs_content,
            .tsa-feed-content {
                display: block !important;
                background: transparent;
            }
            .box:has(#feed) .tabs_new,
            .tsa-feed-tabs {
                display: flex;
                border-bottom: 1px solid rgba(61,104,40,0.4);
                background: rgba(0,0,0,0.12);
                margin: 0; padding: 0;
            }
            .box:has(#feed) .tabs_new > div,
            .tsa-feed-tabs > div {
                flex: 1;
                padding: 6px 10px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.5px;
                text-transform: uppercase;
                color: #6a9a58;
                border: none;
                border-bottom: 2px solid transparent;
                background: transparent;
                cursor: pointer;
                transition: all 0.15s;
                text-align: center;
                background: rgba(8,18,4,0.88) !important;
            }
            .box:has(#feed) .tabs_new > div > div,
            .tsa-feed-tabs > div > div { pointer-events: none; }
            .box:has(#feed) .tabs_new > div:hover,
            .tsa-feed-tabs > div:hover { color: #c8e0b4; background: rgba(255,255,255,0.04); }
            .box:has(#feed) .tabs_new > div.active_tab,
            .tsa-feed-tabs > div.active_tab {
                color: #e8f5d8; border-bottom-color: #6cc040;
                background: rgba(108,192,64,0.07);
            }

            /* ── Press Announcements panel ── */
            #league_pa, #feed_div { background: transparent !important; }
            #feed_div .feed { list-style: none !important; margin: 0 !important; padding: 0 !important; }
            #feed_div .feed > li {
                padding: 6px 10px !important; font-size: 11px !important;
                border-bottom: 1px solid rgba(61,104,40,0.15) !important;
                background: #1c3410 !important;
            }
            #feed_div .feed > li:hover { background: rgba(61,104,40,0.05) !important; }
            #feed_div .icon_box {
                color: #b8d0a0 !important; font-size: 11px !important;
                line-height: 1.5 !important; background-color: transparent !important;
            }
            #feed_div .icon_box a { color: #6cc040 !important; text-decoration: none !important; }
            #feed_div .icon_box a:hover { color: #d0f0b0 !important; }
            #feed_div .icon_box span { color: #3d6828 !important; font-size: 10px !important; }
            #feed_div .icon_box img {
                filter: sepia(1) saturate(2) hue-rotate(60deg) brightness(0.9) !important;
                width: 14px !important; vertical-align: middle !important;
            }
            #feed_div .add_comment a {
                color: #3d5828 !important; font-size: 10px !important; text-decoration: none !important;
                background: rgba(61,104,40,0.2) !important; border-radius: 3px !important;
                padding: 1px 6px !important;
            }
            #feed_div .add_comment a:hover { color: #6cc040 !important; background: rgba(61,104,40,0.35) !important; }
            #feed_div .feed > li.view_more {
                text-align: center !important; color: #4a7038 !important;
                cursor: pointer !important; border-bottom: none !important; padding: 8px !important;
            }
            #feed_div .feed > li.view_more:hover { color: #6cc040 !important; }
            #press_link .button_border {
                background: rgba(61,104,40,0.3) !important; color: #90b878 !important;
                border: 1px solid rgba(61,104,40,0.5) !important; border-radius: 3px !important;
                font-size: 11px !important; padding: 4px 12px !important; cursor: pointer !important;
            }
            #press_link .button_border:hover { background: rgba(108,192,64,0.3) !important; color: #c8e0b4 !important; }

            /* ── League feed extras ── */
            #feed {margin-top: 0 !important;margin: 0 !important;}
            #feed .feed_top{display: none !important;}
            #feed .tsa-feed-logo-wrap .tsa-feed-logo { border-radius: 3px !important; opacity: 0.85 !important; }
            #feed .tsa-feed-post-text .coin { color: #fff !important; font-weight: 600 !important; }
            #feed .tsa-feed-post-text img[src*="star"] { filter: sepia(1) saturate(3) hue-rotate(60deg) !important; }
            #feed .tsa-feed-more-button {
                background: rgba(61,104,40,0.35) !important; color: #90b878 !important;
                border-top: 1px solid rgba(61,104,40,0.3) !important; cursor: pointer !important;
                font-size: 11px !important; padding: 8px !important;
            }
            #feed .tsa-feed-more-button:hover { background: rgba(61,104,40,0.55) !important; color: #c8e0b4 !important; }

            /* ── Change League button ── */
            .tsa-change-league-btn {
                background: none; border: none;
                color: #6a9a58; font-size: 10px; font-weight: 700;
                letter-spacing: 0.5px; text-transform: uppercase;
                cursor: pointer; padding: 0; flex-shrink: 0;
                font-family: inherit; transition: color 0.15s;
            }
            .tsa-change-league-btn:hover { color: #c8e0b4; }
        `;
        document.head.appendChild(style);
    };

    export const TmLeagueStyles = { inject };
