import { TmUI } from './tm-ui.js';

const STYLE_ID = 'tmvu-native-feed-style';

const buttonHtml = ({ cls = '', attrs = {}, shape = 'full', size = 'sm', color = 'secondary', ...opts } = {}) => TmUI.button({
    cls,
    attrs,
    shape,
    size,
    color,
    ...opts,
}).outerHTML;

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-native-feed-box {
            background: var(--tmu-surface-input-dark-focus) !important;
            border: 1px solid var(--tmu-border-faint) !important;
            border-radius: var(--tmu-space-sm) !important;
            overflow: hidden !important;
            box-shadow: 0 0 10px var(--tmu-shadow-elev);
        }

        .tmvu-native-feed-box .box_shadow,
        .tmvu-native-feed-box .box_footer {
            display: none !important;
        }

        .tmvu-native-feed-head {
            background: var(--tmu-shadow-panel) !important;
            border-bottom: 1px solid var(--tmu-border-soft-alpha-strong) !important;
            padding: var(--tmu-space-sm) var(--tmu-space-md) !important;
        }

        .tmvu-native-feed-head h2 {
            color: var(--tmu-success) !important;
                font-size: var(--tmu-font-sm) !important;
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
            border-bottom: 1px solid var(--tmu-border-input-overlay) !important;
            background: var(--tmu-surface-overlay-soft) !important;
            margin: 0 !important;
            padding: 0 !important;
        }

        .tmvu-native-feed-tabs > div {
            flex: 1;
            padding: var(--tmu-space-sm) var(--tmu-space-md);
              font-size: var(--tmu-font-xs);
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: var(--tmu-text-faint);
            border: none;
            border-bottom: 2px solid transparent;
            background: var(--tmu-surface-input-dark) !important;
            cursor: pointer;
            transition: all 0.15s;
            text-align: center;
        }

        .tmvu-native-feed-tabs > div > div {
            pointer-events: none;
        }

        .tmvu-native-feed-tabs > div:hover {
            color: var(--tmu-text-main);
            background: var(--tmu-border-contrast) !important;
        }

        .tmvu-native-feed-tabs > div.active_tab {
            color: var(--tmu-text-strong);
            border-bottom-color: var(--tmu-success);
            background: var(--tmu-success-fill-faint) !important;
        }

        .tmvu-native-feed-root {
            margin: 0 !important;
            background: var(--tmu-surface-input-dark) !important;
            color: var(--tmu-text-main) !important;
        }

        .tmvu-native-feed-root .feed_top {
            display: none !important;
        }

        .tmvu-native-feed-root .feed_post {
            background: transparent !important;
            padding: var(--tmu-space-sm) var(--tmu-space-md) !important;
            border-bottom: 1px solid var(--tmu-border-soft-alpha) !important;
        }

        .tmvu-native-feed-root .feed_post:hover {
            background: var(--tmu-compare-fill) !important;
        }

        .tmvu-native-feed-root .post_text,
        .tmvu-native-feed-root .post_full_text {
              font-size: var(--tmu-font-sm) !important;
            line-height: 1.5 !important;
            color: var(--tmu-text-inverse) !important;
        }

        .tmvu-native-feed-root .post_text a,
        .tmvu-native-feed-root .post_full_text a,
        .tmvu-native-feed-root .comment_text a {
            color: var(--tmu-success) !important;
            text-decoration: none !important;
        }

        .tmvu-native-feed-root .post_text a:hover,
        .tmvu-native-feed-root .post_full_text a:hover,
        .tmvu-native-feed-root .comment_text a:hover {
            color: var(--tmu-text-strong) !important;
        }

        .tmvu-native-feed-root .post_time,
        .tmvu-native-feed-root .comment_time,
        .tmvu-native-feed-root .subtle {
            color: var(--tmu-text-disabled) !important;
            font-size: var(--tmu-font-xs) !important;
        }

        .tmvu-native-feed-root .feed_like,
        .tmvu-native-feed-root .comment_like {
              font-size: var(--tmu-font-xs) !important;
            font-weight: 700 !important;
            color: var(--tmu-text-inverse) !important;
        }

        .tmvu-native-feed-root .like_hidden {
            visibility: hidden !important;
        }

        .tmvu-native-feed-root .hover_options,
        .tmvu-native-feed-root .hidden_comments_link {
            font-size: var(--tmu-font-xs) !important;
        }

        .tmvu-native-feed-root .hover_options .faux_link,
        .tmvu-native-feed-root .hidden_comments_link .faux_link,
        .tmvu-native-feed-root .post_text .faux_link,
        .tmvu-native-feed-root .post_full_text .faux_link {
            color: var(--tmu-text-dim) !important;
        }

        .tmvu-native-feed-root .hover_options .faux_link:hover,
        .tmvu-native-feed-root .hidden_comments_link .faux_link:hover,
        .tmvu-native-feed-root .post_text .faux_link:hover,
        .tmvu-native-feed-root .post_full_text .faux_link:hover {
            color: var(--tmu-success) !important;
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
            margin-top: var(--tmu-space-xs) !important;
        }

        .tmvu-native-feed-root .comment_text {
            font-size: var(--tmu-font-sm) !important;
            color: var(--tmu-text-inverse) !important;
        }

        .tmvu-native-feed-root .textarea_placehold {
            color: var(--tmu-text-faint) !important;
              font-size: var(--tmu-font-xs) !important;
            cursor: text !important;
            background: var(--tmu-surface-overlay) !important;
            border: 1px solid var(--tmu-border-soft-alpha-strong) !important;
            border-radius: var(--tmu-space-xs) !important;
            padding: var(--tmu-space-xs) var(--tmu-space-sm) !important;
        }

        .tmvu-native-feed-root textarea {
            background: var(--tmu-surface-overlay-strong) !important;
            color: var(--tmu-text-main) !important;
            border: 1px solid var(--tmu-border-faint) !important;
            border-radius: var(--tmu-space-xs) !important;
              font-size: var(--tmu-font-xs) !important;
        }

        .tmvu-native-feed-root .button_border {
            background: var(--tmu-surface-tab-hover) !important;
            color: var(--tmu-text-panel-label) !important;
            border: 1px solid var(--tmu-border-faint) !important;
              font-size: var(--tmu-font-xs) !important;
            padding: var(--tmu-space-xs) var(--tmu-space-md) !important;
            border-radius: var(--tmu-space-xs) !important;
            cursor: pointer !important;
        }

        .tmvu-native-feed-root .button_border:hover {
            background: var(--tmu-success-fill-strong) !important;
            color: var(--tmu-text-main) !important;
        }

        .tmvu-native-feed-root .post_options > div:first-child {
            color: var(--tmu-text-disabled-strong) !important;
            font-size: var(--tmu-font-lg) !important;
        }

        .tmvu-native-feed-root .post_options {
            background: var(--tmu-surface-input-dark-focus) !important;
            border: 1px solid var(--tmu-border-faint) !important;
            border-radius: var(--tmu-space-xs) !important;
            box-shadow: 0 4px 12px var(--tmu-shadow-panel) !important;
        }

        .tmvu-native-feed-root .post_option {
            color: var(--tmu-text-faint) !important;
              font-size: var(--tmu-font-xs) !important;
            padding: var(--tmu-space-xs) var(--tmu-space-md) !important;
        }

        .tmvu-native-feed-root .post_option:hover {
            background: var(--tmu-success-fill-strong) !important;
            color: var(--tmu-text-strong) !important;
        }

        .tmvu-native-feed-root .tmvu-feed-post-actions {
            display: flex;
            flex-wrap: wrap;
            gap: var(--tmu-space-sm);
            margin: var(--tmu-space-md) 0 0;
        }

        .tmvu-native-feed-root .tmvu-feed-post-action {
            appearance: none;
            border: 1px solid var(--tmu-border-input-overlay);
            background: var(--tmu-compare-bar-bg);
            border-radius: 999px;
            color: var(--tmu-text-main);
            cursor: pointer;
            font: inherit;
              font-size: var(--tmu-font-xs);
            font-weight: 700;
            line-height: 1;
            padding: var(--tmu-space-sm) var(--tmu-space-md);
        }

        .tmvu-native-feed-root .tmvu-feed-post-action:hover {
            background: var(--tmu-success-fill-hover);
            border-color: var(--tmu-border-success);
            color: var(--tmu-text-strong);
        }

        .tmvu-native-feed-root .tmvu-feed-post-action:disabled {
            opacity: 0.45;
            cursor: default;
        }

        .tmvu-native-feed-root .tmvu-feed-post-action.is-menu-open {
            background: var(--tmu-success-fill-hover);
            border-color: var(--tmu-success);
            color: var(--tmu-text-strong);
        }

        .tmvu-native-feed-root .coin {
            color: var(--tmu-text-strong) !important;
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
            padding: var(--tmu-space-sm) var(--tmu-space-md) !important;
              font-size: var(--tmu-font-xs) !important;
            border-bottom: 1px solid var(--tmu-border-soft-alpha) !important;
            background: var(--tmu-surface-panel) !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li:hover {
            background: var(--tmu-compare-fill) !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box {
            color: var(--tmu-text-main) !important;
              font-size: var(--tmu-font-xs) !important;
            line-height: 1.5 !important;
            background-color: transparent !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box a {
            color: var(--tmu-success) !important;
            text-decoration: none !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box a:hover {
            color: var(--tmu-text-strong) !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box span {
            color: var(--tmu-text-dim) !important;
            font-size: var(--tmu-font-xs) !important;
        }

        .tmvu-native-feed-box #feed_div .icon_box img {
            filter: sepia(1) saturate(2) hue-rotate(60deg) brightness(0.9) !important;
            width: 14px !important;
            vertical-align: middle !important;
        }

        .tmvu-native-feed-box #feed_div .add_comment a {
            color: var(--tmu-text-dim) !important;
            font-size: var(--tmu-font-xs) !important;
            text-decoration: none !important;
            background: var(--tmu-success-fill-hover) !important;
            border-radius: var(--tmu-space-xs) !important;
            padding: 0 var(--tmu-space-sm) !important;
        }

        .tmvu-native-feed-box #feed_div .add_comment a:hover {
            color: var(--tmu-success) !important;
            background: var(--tmu-success-fill-strong) !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li.view_more {
            text-align: center !important;
            color: var(--tmu-text-dim) !important;
            cursor: pointer !important;
            border-bottom: none !important;
            padding: var(--tmu-space-sm) !important;
        }

        .tmvu-native-feed-box #feed_div .feed > li.view_more:hover {
            color: var(--tmu-success) !important;
        }
    `;

    document.head.appendChild(style);
}

function sanitizeFeedRoot(feedRoot) {
    if (!feedRoot) return;

    if (feedRoot.classList.contains('w480')) feedRoot.classList.remove('w480');
    if (feedRoot.classList.contains('std')) feedRoot.classList.remove('std');
    if (!feedRoot.classList.contains('tmvu-native-feed-root')) {
        feedRoot.classList.add('tmvu-native-feed-root');
    }

    ensurePostActions(feedRoot);
    bindActionDelegation(feedRoot);
}

function getFeedPosts(feedRoot) {
    return feedRoot.querySelectorAll('.feed_content > .feed_post[id^="feed_post"]');
}

function triggerNativeClick(element) {
    if (!element) return false;

    try {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        return true;
    } catch (_) {
        try {
            element.click();
            return true;
        } catch (_) {
            return false;
        }
    }
}

function parseNativeActionArgs(onclickValue) {
    const match = String(onclickValue || '').match(/([A-Za-z0-9_]+)\((.*)\)/);
    if (!match) return null;

    const rawArgs = match[2].trim();
    if (!rawArgs) return { fnName: match[1], args: [] };

    return {
        fnName: match[1],
        args: rawArgs
            .split(',')
            .map((part) => part.trim())
            .map((part) => {
                if (part === 'true') return true;
                if (part === 'false') return false;
                if (/^['"].*['"]$/.test(part)) return part.slice(1, -1);
                const numeric = Number(part);
                return Number.isNaN(numeric) ? part : numeric;
            })
    };
}

function runNativeActionByOnclick(element) {
    const onclickValue = element?.getAttribute('onclick');
    if (!onclickValue) return false;

    const parsed = parseNativeActionArgs(onclickValue);
    if (!parsed) return false;

    const fn = window[parsed.fnName];
    if (typeof fn !== 'function') return triggerNativeClick(element);

    try {
        fn(...parsed.args);
        return true;
    } catch (_) {
        return triggerNativeClick(element);
    }
}

function findNativePostAction(postEl, action) {
    if (action === 'like') {
        return postEl.querySelector('.hover_options .like_icon[onclick*="feed_post_like"]');
    }

    if (action === 'comment') {
        return Array.from(postEl.querySelectorAll('.hover_options .faux_link')).find((element) =>
            String(element.textContent || '').trim().toLowerCase() === 'comment'
        ) || postEl.querySelector('.feed_comment_box .textarea_placehold');
    }

    if (action === 'reply') {
        return Array.from(postEl.querySelectorAll('.hover_options .faux_link')).find((element) =>
            String(element.textContent || '').trim().toLowerCase() === 'reply to author'
        ) || postEl.querySelector('.feed_comment_box .textarea_placehold');
    }

    if (action === 'link') {
        return postEl.querySelector('.post_option[onclick*="feed_pop_link_post"]');
    }

    if (action === 'mute') {
        return postEl.querySelector('.post_option.mute[onclick*="feed_post_mute"], .post_option.unmute[onclick*="feed_post_mute"]');
    }

    if (action === 'more') {
        return postEl.querySelector('.post_options_button, .post_options');
    }

    return null;
}

function togglePostMenu(postEl, buttonEl) {
    const menu = postEl.querySelector('.post_options');
    if (!menu) return false;

    const nextOpen = menu.style.display === 'none' || !menu.style.display;
    const feedRoot = postEl.closest('.tmvu-native-feed-root') || document;

    feedRoot.querySelectorAll('.post_options').forEach((otherMenu) => {
        if (otherMenu !== menu) otherMenu.style.display = 'none';
    });
    feedRoot.querySelectorAll('.tmvu-feed-post-action[data-action="more"]').forEach((otherButton) => {
        if (otherButton !== buttonEl) otherButton.classList.remove('is-menu-open');
    });

    menu.style.display = nextOpen ? 'block' : 'none';
    if (buttonEl) buttonEl.classList.toggle('is-menu-open', nextOpen);
    return true;
}

function focusCommentBox(postEl, replyMode = false) {
    const trigger = findNativePostAction(postEl, replyMode ? 'reply' : 'comment');
    if (trigger) triggerNativeClick(trigger);

    const textarea = postEl.querySelector('.feed_comment_box textarea, textarea[id^="comment"]');
    if (!textarea) return false;

    try { textarea.focus({ preventScroll: true }); } catch (_) { textarea.focus(); }
    return true;
}

function runPostAction(postEl, action, buttonEl) {
    if (!postEl) return false;

    if (action === 'more') {
        return togglePostMenu(postEl, buttonEl);
    }

    if (action === 'comment') {
        return focusCommentBox(postEl, false);
    }

    if (action === 'reply') {
        return focusCommentBox(postEl, true);
    }

    const nativeAction = findNativePostAction(postEl, action);
    if (!nativeAction) return false;

    if (action === 'link' || action === 'mute') {
        return runNativeActionByOnclick(nativeAction);
    }

    return triggerNativeClick(nativeAction);
}

function updateActionAvailability(postEl) {
    const actionBar = postEl.querySelector('.tmvu-feed-post-actions');
    if (!actionBar) return;

    const states = {
        like: Boolean(findNativePostAction(postEl, 'like')),
        comment: Boolean(findNativePostAction(postEl, 'comment')),
        reply: Boolean(findNativePostAction(postEl, 'reply')),
        link: Boolean(findNativePostAction(postEl, 'link')),
        mute: Boolean(findNativePostAction(postEl, 'mute')),
        more: Boolean(findNativePostAction(postEl, 'more')),
    };

    actionBar.querySelectorAll('.tmvu-feed-post-action').forEach((button) => {
        const isEnabled = Boolean(states[button.dataset.action]);
        button.disabled = !isEnabled;
        if (button.dataset.action === 'more' && !isEnabled) button.classList.remove('is-menu-open');
    });
}

function ensurePostActions(feedRoot) {
    getFeedPosts(feedRoot).forEach((postEl) => {
        if (!postEl.querySelector('.tmvu-feed-post-actions')) {
            const actionBar = document.createElement('div');
            actionBar.className = 'tmvu-feed-post-actions';
            actionBar.innerHTML = [
                buttonHtml({ label: 'Like', cls: 'tmvu-feed-post-action', attrs: { 'data-action': 'like' } }),
                buttonHtml({ label: 'Comment', cls: 'tmvu-feed-post-action', attrs: { 'data-action': 'comment' } }),
                buttonHtml({ label: 'Reply', cls: 'tmvu-feed-post-action', attrs: { 'data-action': 'reply' } }),
                buttonHtml({ label: 'Link', cls: 'tmvu-feed-post-action', attrs: { 'data-action': 'link' } }),
                buttonHtml({ label: 'Mute', cls: 'tmvu-feed-post-action', attrs: { 'data-action': 'mute' } }),
                buttonHtml({ label: 'More', cls: 'tmvu-feed-post-action', attrs: { 'data-action': 'more' } })
            ].join('');

            const anchor = postEl.querySelector('.feed_post_inner') || postEl.querySelector('.feed_post_content') || postEl;
            anchor.appendChild(actionBar);
        }

        updateActionAvailability(postEl);
    });
}

function bindActionDelegation(feedRoot) {
    if (feedRoot.dataset.tmvuFeedActionsBound === '1') return;
    feedRoot.dataset.tmvuFeedActionsBound = '1';

    feedRoot.addEventListener('click', (event) => {
        const button = event.target.closest('.tmvu-feed-post-action');
        if (button) {
            event.preventDefault();
            event.stopPropagation();

            const postEl = button.closest('.feed_post[id^="feed_post"]');
            if (runPostAction(postEl, button.dataset.action, button)) {
                updateActionAvailability(postEl);
            }
            return;
        }

        if (!event.target.closest('.post_options')) {
            feedRoot.querySelectorAll('.post_options').forEach((menu) => {
                menu.style.display = 'none';
            });
            feedRoot.querySelectorAll('.tmvu-feed-post-action[data-action="more"]').forEach((menuButton) => {
                menuButton.classList.remove('is-menu-open');
            });
        }
    });
}

function installFeedSanitizer(feedRoot) {
    if (!feedRoot) return null;

    if (feedRoot._tmvuFeedObserver) {
        sanitizeFeedRoot(feedRoot);
        return feedRoot._tmvuFeedObserver;
    }

    sanitizeFeedRoot(feedRoot);

    let sanitizeQueued = false;
    const observer = new MutationObserver((mutations) => {
        if (!mutations.some((mutation) => mutation.type === 'childList')) return;
        if (sanitizeQueued) return;

        sanitizeQueued = true;
        requestAnimationFrame(() => {
            sanitizeQueued = false;
            sanitizeFeedRoot(feedRoot);
        });
    });

    observer.observe(feedRoot, {
        childList: true,
        subtree: true
    });

    feedRoot._tmvuFeedObserver = observer;
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
    mountStandaloneFeed,
};