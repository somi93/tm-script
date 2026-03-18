const STYLE_ID = 'tmvu-native-feed-style';

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-native-feed-box {
            background: rgba(8, 18, 4, 0.92) !important;
            border: 1px solid rgba(61, 104, 40, 0.45) !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
        }

        .tmvu-native-feed-box .box_shadow,
        .tmvu-native-feed-box .box_footer {
            display: none !important;
        }

        .tmvu-native-feed-head {
            background: rgba(0, 0, 0, 0.5) !important;
            border-bottom: 1px solid rgba(61, 104, 40, 0.3) !important;
            padding: 7px 12px !important;
        }

        .tmvu-native-feed-head h2 {
            color: #6cc040 !important;
            font-size: 13px !important;
            margin: 0 !important;
        }

        .tmvu-native-feed-tabs-outer {
            display: block !important;
            background: transparent !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .tmvu-native-feed-content {
            display: block !important;
            background: transparent !important;
        }

        .tmvu-native-feed-tabs {
            display: flex !important;
            border-bottom: 1px solid rgba(61, 104, 40, 0.4) !important;
            background: rgba(0, 0, 0, 0.12) !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .tmvu-native-feed-tabs > div {
            flex: 1;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #6a9a58;
            border: none;
            border-bottom: 2px solid transparent;
            background: rgba(8, 18, 4, 0.88) !important;
            cursor: pointer;
            transition: all 0.15s;
            text-align: center;
        }

        .tmvu-native-feed-tabs > div > div {
            pointer-events: none;
        }

        .tmvu-native-feed-tabs > div:hover {
            color: #c8e0b4;
            background: rgba(255, 255, 255, 0.04) !important;
        }

        .tmvu-native-feed-tabs > div.active_tab {
            color: #e8f5d8;
            border-bottom-color: #6cc040;
            background: rgba(108, 192, 64, 0.07) !important;
        }

        .tmvu-native-feed-root {
            margin: 0 !important;
            background: rgba(8, 18, 4, 0.88) !important;
            color: #c8e0b4 !important;
        }

        .tmvu-native-feed-root .feed_top {
            display: none !important;
        }

        .tmvu-native-feed-root .feed_post {
            background: transparent !important;
            padding: 8px 10px !important;
            border-bottom: 1px solid rgba(61, 104, 40, 0.18) !important;
        }

        .tmvu-native-feed-root .feed_post:hover {
            background: rgba(61, 104, 40, 0.05) !important;
        }

        .tmvu-native-feed-root .post_text,
        .tmvu-native-feed-root .post_full_text {
            font-size: 13px !important;
            line-height: 1.5 !important;
            color: #fff !important;
        }

        .tmvu-native-feed-root .post_text a,
        .tmvu-native-feed-root .post_full_text a,
        .tmvu-native-feed-root .comment_text a {
            color: #6cc040 !important;
            text-decoration: none !important;
        }

        .tmvu-native-feed-root .post_text a:hover,
        .tmvu-native-feed-root .post_full_text a:hover,
        .tmvu-native-feed-root .comment_text a:hover {
            color: #d0f0b0 !important;
        }

        .tmvu-native-feed-root .post_time,
        .tmvu-native-feed-root .comment_time,
        .tmvu-native-feed-root .subtle {
            color: #ccc !important;
            font-size: 10px !important;
        }

        .tmvu-native-feed-root .feed_like,
        .tmvu-native-feed-root .comment_like {
            font-size: 11px !important;
            font-weight: 700 !important;
            color: #fff !important;
        }

        .tmvu-native-feed-root .like_hidden {
            visibility: hidden !important;
        }

        .tmvu-native-feed-root .hover_options,
        .tmvu-native-feed-root .hidden_comments_link {
            font-size: 10px !important;
        }

        .tmvu-native-feed-root .hover_options .faux_link,
        .tmvu-native-feed-root .hidden_comments_link .faux_link,
        .tmvu-native-feed-root .post_text .faux_link,
        .tmvu-native-feed-root .post_full_text .faux_link {
            color: #4a7038 !important;
        }

        .tmvu-native-feed-root .hover_options .faux_link:hover,
        .tmvu-native-feed-root .hidden_comments_link .faux_link:hover,
        .tmvu-native-feed-root .post_text .faux_link:hover,
        .tmvu-native-feed-root .post_full_text .faux_link:hover {
            color: #6cc040 !important;
        }

        .tmvu-native-feed-root .like_icon {
            opacity: 0.55 !important;
            cursor: pointer !important;
            filter: sepia(1) saturate(2) hue-rotate(60deg) !important;
        }

        .tmvu-native-feed-root .like_icon:hover {
            opacity: 1 !important;
        }

        .tmvu-native-feed-root .comments {
            margin-top: 5px !important;
        }

        .tmvu-native-feed-root .comment_text {
            font-size: 12px !important;
            color: #fff !important;
        }

        .tmvu-native-feed-root .textarea_placehold {
            color: #3d6828 !important;
            font-size: 11px !important;
            cursor: text !important;
            background: rgba(0, 0, 0, 0.25) !important;
            border: 1px solid rgba(61, 104, 40, 0.3) !important;
            border-radius: 3px !important;
            padding: 3px 7px !important;
        }

        .tmvu-native-feed-root textarea {
            background: rgba(0, 0, 0, 0.35) !important;
            color: #c8e0b4 !important;
            border: 1px solid rgba(61, 104, 40, 0.45) !important;
            border-radius: 3px !important;
            font-size: 11px !important;
        }

        .tmvu-native-feed-root .button_border {
            background: rgba(61, 104, 40, 0.35) !important;
            color: #90b878 !important;
            border: 1px solid rgba(61, 104, 40, 0.5) !important;
            font-size: 11px !important;
            padding: 3px 10px !important;
            border-radius: 3px !important;
            cursor: pointer !important;
        }

        .tmvu-native-feed-root .button_border:hover {
            background: rgba(108, 192, 64, 0.3) !important;
            color: #c8e0b4 !important;
        }

        .tmvu-native-feed-root .post_options > div:first-child {
            color: #2d4820 !important;
            font-size: 16px !important;
        }

        .tmvu-native-feed-root .post_options {
            background: #0c1a07 !important;
            border: 1px solid rgba(61, 104, 40, 0.5) !important;
            border-radius: 4px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;
        }

        .tmvu-native-feed-root .post_option {
            color: #5a8a48 !important;
            font-size: 11px !important;
            padding: 5px 12px !important;
        }

        .tmvu-native-feed-root .post_option:hover {
            background: rgba(61, 104, 40, 0.3) !important;
            color: #c8e0b4 !important;
        }

        .tmvu-native-feed-root .coin {
            color: #fff !important;
            font-weight: 600 !important;
        }

        .tmvu-native-feed-root img[src*="star"] {
            filter: sepia(1) saturate(3) hue-rotate(60deg) !important;
        }

        .tmvu-native-feed-box #league_pa,
        .tmvu-native-feed-box #feed_div {
            background: transparent !important;
        }

        .tmvu-native-feed-box #feed_div .feed {
            list-style: none !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li {
            padding: 6px 10px !important;
            font-size: 11px !important;
            border-bottom: 1px solid rgba(61, 104, 40, 0.15) !important;
            background: #1c3410 !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li:hover {
            background: rgba(61, 104, 40, 0.05) !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box {
            color: #b8d0a0 !important;
            font-size: 11px !important;
            line-height: 1.5 !important;
            background-color: transparent !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box a {
            color: #6cc040 !important;
            text-decoration: none !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box a:hover {
            color: #d0f0b0 !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box span {
            color: #3d6828 !important;
            font-size: 10px !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box img {
            filter: sepia(1) saturate(2) hue-rotate(60deg) brightness(0.9) !important;
            width: 14px !important;
            vertical-align: middle !important;
        }

        .tmvu-native-feed-box #feed_div .add_comment a {
            color: #3d5828 !important;
            font-size: 10px !important;
            text-decoration: none !important;
            background: rgba(61, 104, 40, 0.2) !important;
            border-radius: 3px !important;
            padding: 1px 6px !important;
        }

        .tmvu-native-feed-box #feed_div .add_comment a:hover {
            color: #6cc040 !important;
            background: rgba(61, 104, 40, 0.35) !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li.view_more {
            text-align: center !important;
            color: #4a7038 !important;
            cursor: pointer !important;
            border-bottom: none !important;
            padding: 8px !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li.view_more:hover {
            color: #6cc040 !important;
        }
    `;

    document.head.appendChild(style);
}

function sanitizeFeedRoot(feedRoot) {
    if (!feedRoot) return;
    feedRoot.classList.remove('w480', 'std');
    feedRoot.classList.add('tmvu-native-feed-root');
}

function installFeedSanitizer(feedRoot) {
    if (!feedRoot) return null;

    sanitizeFeedRoot(feedRoot);

    const observer = new MutationObserver(() => {
        sanitizeFeedRoot(feedRoot);
    });

    observer.observe(feedRoot, { attributes: true, attributeFilter: ['class'] });
    return observer;
}

function patchFeedBox(feedBox, { resolveMode = null, requestMode = null } = {}) {
    if (!feedBox) return { observer: null, feedRoot: null };

    injectStyles();

    feedBox.classList.add('tmvu-native-feed-box');

    const head = feedBox.querySelector('.box_head');
    if (head) {
        head.classList.add('tmvu-native-feed-head');
        head.querySelector('h2')?.classList.remove('std');
    }

    const tabsOuter = feedBox.querySelector('.tabs_outer, .tmvu-native-feed-tabs-outer');
    const tabs = feedBox.querySelector('.tabs_new, .tmvu-native-feed-tabs');
    const content = feedBox.querySelector('.tabs_content, .tmvu-native-feed-content');

    if (tabsOuter && tabs && content) {
        tabsOuter.classList.add('tmvu-native-feed-tabs-outer');
        tabs.classList.remove('tabs_new');
        tabs.classList.add('tmvu-native-feed-tabs');
        content.classList.add('tmvu-native-feed-content');

        if (resolveMode && requestMode) {
            const tabButtons = Array.from(tabs.children);
            const panes = Array.from(content.children);

            const activateTab = (index) => {
                tabButtons.forEach(btn => btn.classList.remove('active_tab'));
                panes.forEach(pane => { pane.style.display = 'none'; });
                if (!tabButtons[index] || !panes[index]) return;
                tabButtons[index].classList.add('active_tab');
                panes[index].style.display = '';
                requestMode(resolveMode(tabButtons[index], panes[index]));
            };

            tabButtons.forEach((button, index) => {
                button.onclick = (event) => {
                    event.preventDefault();
                    activateTab(index);
                };
            });

            let activeIdx = tabButtons.findIndex(button => button.classList.contains('active_tab'));
            if (activeIdx < 0) activeIdx = panes.findIndex(pane => pane.style.display !== 'none');
            activateTab(activeIdx >= 0 ? activeIdx : 0);
        }
    }

    const feedRoot = feedBox.querySelector('#feed');
    const observer = installFeedSanitizer(feedRoot);
    return { observer, feedRoot };
}

function mountStandaloneFeed(container, feedRoot, { title = 'Feed' } = {}) {
    if (!container || !feedRoot) return { observer: null, feedRoot: null, shell: null };

    injectStyles();

    const shell = document.createElement('section');
    shell.className = 'tmvu-native-feed-box';
    shell.innerHTML = `
        <div class="box_head tmvu-native-feed-head"><h2>${title}</h2></div>
        <div class="box_body"><div class="box_shadow"></div><div class="tmvu-native-feed-slot"></div></div>
    `;

    shell.querySelector('.tmvu-native-feed-slot')?.appendChild(feedRoot);
    container.appendChild(shell);

    const observer = installFeedSanitizer(feedRoot);
    return { observer, feedRoot, shell };
}

export const TmNativeFeed = {
    injectStyles,
    sanitizeFeedRoot,
    installFeedSanitizer,
    patchFeedBox,
    mountStandaloneFeed,
};