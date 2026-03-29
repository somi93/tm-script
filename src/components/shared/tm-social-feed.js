import { TmApi } from '../../services/index.js';
import { buildHomeFeedModel } from '../../utils/home-feed.js';
import { buildNativeHomeFeedPostMap, findNativeHomeFeedAction, findNativeHomeFeedCommentControls, queryVisibleNativeFeedPosts } from '../../utils/home-feed-native.js';

const STYLE_ID = 'tmvu-social-feed-style';

const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
        '.tmvu-social-feed-source.tmvu-social-feed-source--hidden>:not([data-tmvu-social-feed-mount]){display:none!important}',
        '.tmvu-home-empty{padding:16px 4px;color:#78906a;font-size:12px}',
        '.tmvu-home-feed{display:flex;flex-direction:column;gap:14px}',
        '.tmvu-home-feed-post{display:flex;gap:18px;padding:18px 18px 16px;border-radius:16px;border:1px solid rgba(90,126,42,.18);background:linear-gradient(180deg, rgba(255,255,255,.018), rgba(255,255,255,.008)),rgba(12,24,9,.34);box-shadow:inset 0 1px 0 rgba(255,255,255,.02)}',
        '.tmvu-home-feed-post--similar{margin-left:20px;padding-left:22px;position:relative}',
        '.tmvu-home-feed-post--similar::before{content:"";position:absolute;left:8px;top:12px;bottom:12px;width:2px;border-radius:999px;background:rgba(205,233,76,.18)}',
        '.tmvu-home-feed-side{flex-shrink:0;width:116px;display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}',
        '.tmvu-home-feed-side-logo{width:76px;height:76px;border-radius:14px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.24);box-shadow:0 8px 18px rgba(4,12,4,.22)}',
        '.tmvu-home-feed-side-logo img{max-width:72px;max-height:72px;width:auto;height:auto;object-fit:contain;display:block}',
        '.tmvu-home-feed-side-fallback{font-size:28px;opacity:.35}',
        '.tmvu-home-feed-side-name{font-size:12px;font-weight:800;color:#d8ebc4;text-decoration:none;line-height:1.35;word-break:break-word}',
        '.tmvu-home-feed-side-name:hover{color:#fff}',
        '.tmvu-home-feed-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:10px}',
        '.tmvu-home-feed-time{display:block;float:right;font-size:11px;color:#7e9b6c;white-space:nowrap;font-variant-numeric:tabular-nums}',
        '.tmvu-home-feed-body{font-size:14px;color:#deefd0;line-height:1.72;word-break:break-word}',
        '.tmvu-home-feed-body a{color:#8ecc60;text-decoration:none}',
        '.tmvu-home-feed-body a:hover{text-decoration:underline}',
        '.tmvu-feed-stars{display:inline-flex;align-items:center;gap:1px;vertical-align:baseline}',
        '.tmvu-feed-stars-full{color:#fbbf24}',
        '.tmvu-feed-stars-empty{color:#3d6828}',
        '.tmvu-home-feed-meta{display:flex;align-items:center;justify-content:flex-start;gap:10px;padding-bottom:2px;color:#7f976f}',
        '.tmvu-home-feed-meta-left{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
        '.tmvu-home-feed-like-count,.tmvu-home-feed-comment-count{display:inline-flex;align-items:center;gap:6px;min-height:24px;padding:0 10px;border-radius:999px;border:1px solid rgba(61,104,40,.18);background:rgba(42,74,28,.18);color:#d5e5c8;font-size:11px;font-weight:800;line-height:1;letter-spacing:.01em}',
        '.tmvu-home-feed-like-count::before{content:"♥";font-size:10px;color:#7fc65a}',
        '.tmvu-home-feed-comment-count::before{content:"💬";font-size:11px;opacity:.9}',
        '.tmvu-home-feed-like-count{cursor:pointer;transition:background .12s,border-color .12s,color .12s;background:rgba(37,84,34,.18);border:none}',
        '.tmvu-home-feed-like-count:hover{background:rgba(108,192,64,.1);color:#edf7e7}',
        '.tmvu-home-feed-like-count:disabled{opacity:.55;cursor:default}',
        '.tmvu-home-feed-comment-count{border:none}',
        '.tmvu-home-feed-comment-count.tmvu-home-feed-comment-count--action{cursor:pointer;transition:background .12s,color .12s}',
        '.tmvu-home-feed-comment-count.tmvu-home-feed-comment-count--action:hover{background:rgba(108,192,64,.08);color:#edf7e7}',
        '.tmvu-home-feed-actions{display:flex;gap:9px;align-items:center;padding-top:2px;flex-wrap:wrap}',
        '.tmvu-home-feed-action{appearance:none;min-height:28px;padding:0 12px;border-radius:999px;border:1px solid rgba(61,104,40,.26);background:rgba(42,74,28,.26);color:#b1d295;cursor:pointer;font:inherit;font-size:11px;font-weight:800;line-height:1;text-decoration:none;display:inline-flex;align-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}',
        '.tmvu-home-feed-action:hover{background:rgba(108,192,64,.15);color:#e0f0c0;border-color:rgba(108,192,64,.3)}',
        '.tmvu-home-feed-action:disabled{opacity:.45;cursor:default}',
        '.tmvu-home-feed-similar{display:flex;justify-content:flex-end;padding:12px 0 0 18px;margin-top:12px;border-top:1px solid rgba(255,255,255,.04)}',
        '.tmvu-home-feed-similar-btn{appearance:none;background:transparent;border:none;color:#cde94c;cursor:pointer;font:inherit;font-size:12px;font-weight:800;line-height:1.2;padding:0;display:inline-flex;align-items:center;gap:6px}',
        '.tmvu-home-feed-similar-btn:hover{color:#e6f67f}',
        '.tmvu-home-feed-composer{margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.04)}',
        '.tmvu-home-feed-composer[hidden]{display:none!important}',
        '.tmvu-home-feed-composer-input{width:100%;min-height:84px;box-sizing:border-box;background:rgba(0,0,0,.28);border:1px solid rgba(61,104,40,.42);border-radius:10px;color:#dcebd5;padding:10px 12px;font:inherit;font-size:12px;line-height:1.45;resize:vertical}',
        '.tmvu-home-feed-composer-input::placeholder{color:#759067}',
        '.tmvu-home-feed-composer-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}',
        '.tmvu-home-feed-composer-btn{appearance:none;border:1px solid rgba(61,104,40,.42);background:rgba(0,0,0,.22);border-radius:999px;color:#c8e0b4;cursor:pointer;font:inherit;font-size:11px;font-weight:700;line-height:1;padding:7px 12px}',
        '.tmvu-home-feed-composer-btn:hover{background:rgba(61,104,40,.22);border-color:rgba(108,192,64,.45);color:#e8f5d8}',
        '.tmvu-home-feed-composer-btn[data-role="submit"]{background:rgba(61,104,40,.28);color:#eef8e8}',
        '.tmvu-home-feed-comments{display:flex;flex-direction:column;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.04)}',
        '.tmvu-home-feed-more-comments{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.028);border:1px dashed rgba(255,255,255,.06);color:#d8e8cc;cursor:pointer}',
        '.tmvu-home-feed-more-comments:hover{background:rgba(255,255,255,.04);border-color:rgba(108,192,64,.16)}',
        '.tmvu-home-feed-more-comments-badge{display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;border-radius:8px;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.2);font-size:18px;color:#86aa6b}',
        '.tmvu-home-feed-more-comments-copy{display:flex;flex-direction:column;gap:2px;min-width:0}',
        '.tmvu-home-feed-more-comments-title{font-size:12px;font-weight:800;color:#e5f2dd}',
        '.tmvu-home-feed-comment{display:flex;align-items:flex-start;gap:12px;padding:12px 13px;border-radius:12px;background:rgba(255,255,255,.022);border:1px solid rgba(255,255,255,.03)}',
        '.tmvu-home-feed-comment-logo{flex:0 0 42px;width:42px;height:42px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.2)}',
        '.tmvu-home-feed-comment-logo img{max-width:42px;max-height:42px;width:auto;height:auto;object-fit:contain;display:block}',
        '.tmvu-home-feed-comment-content{flex:1 1 auto;min-width:0}',
        '.tmvu-home-feed-comment-body{font-size:12px;line-height:1.62;color:#d2e5c8}',
        '.tmvu-home-feed-comment-time{display:block;float:right;font-size:10px;color:#6f8662;margin-left:8px}',
        '.tmvu-home-feed-flag-fallback{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:12px;padding:0 3px;border-radius:3px;background:rgba(255,255,255,.08);font-size:9px;font-weight:800;line-height:1;color:#d8e7cc;vertical-align:middle}',
        '.tmvu-home-feed-likes-overlay{position:fixed;inset:0;z-index:200000;background:rgba(0,0,0,.72);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px}',
        '.tmvu-home-feed-likes-dialog{width:min(520px,100%);max-height:min(72vh,760px);display:flex;flex-direction:column;gap:14px;padding:18px;border-radius:14px;border:1px solid rgba(108,192,64,.22);background:linear-gradient(160deg,#1a2e14 0%,#0e1e0a 100%);box-shadow:0 20px 60px rgba(0,0,0,.8)}',
        '.tmvu-home-feed-likes-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}',
        '.tmvu-home-feed-likes-title{font-size:15px;font-weight:800;color:#eef8e8}',
        '.tmvu-home-feed-likes-subtitle{margin-top:4px;font-size:11px;color:#8eb079}',
        '.tmvu-home-feed-likes-close{appearance:none;border:1px solid rgba(108,192,64,.18);background:rgba(42,74,28,.28);border-radius:999px;color:#dcebd4;cursor:pointer;font:inherit;font-size:11px;font-weight:700;line-height:1;padding:8px 12px}',
        '.tmvu-home-feed-likes-close:hover{background:rgba(108,192,64,.12)}',
        '.tmvu-home-feed-likes-body{overflow:auto;padding-right:4px}',
        '.tmvu-home-feed-likes-list{display:flex;flex-direction:column;gap:8px}',
        '.tmvu-home-feed-likes-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.02);text-decoration:none}',
        '.tmvu-home-feed-likes-item:hover{background:rgba(255,255,255,.04);border-color:rgba(108,192,64,.16)}',
        '.tmvu-home-feed-likes-item-logo{flex:0 0 40px;width:40px;height:40px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.2)}',
        '.tmvu-home-feed-likes-item-logo img{max-width:40px;max-height:40px;width:auto;height:auto;object-fit:contain;display:block}',
        '.tmvu-home-feed-likes-item-copy{min-width:0;display:flex;flex-direction:column;gap:3px}',
        '.tmvu-home-feed-likes-item-name{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:#e6f2dd}',
        '.tmvu-home-feed-likes-item-meta{font-size:10px;color:#7f976f}',
        '.tmvu-home-feed-load-more{display:flex;justify-content:center;padding-top:12px}',
        '.tmvu-home-feed-load-more-btn{appearance:none;min-width:190px;padding:9px 16px;border-radius:999px;border:1px solid rgba(108,192,64,.22);background:rgba(42,74,28,.28);color:#d8eacb;cursor:pointer;font:inherit;font-size:12px;font-weight:800;line-height:1.1}',
        '.tmvu-home-feed-load-more-btn:hover{background:rgba(108,192,64,.14);border-color:rgba(108,192,64,.35)}',
        '.tmvu-home-feed-load-more-btn:disabled{opacity:.6;cursor:default}',
        '@media (max-width: 760px){.tmvu-home-feed-post{flex-direction:column;padding:16px}.tmvu-home-feed-side{width:100%;flex-direction:row;justify-content:flex-start;text-align:left}.tmvu-home-feed-side-logo{width:64px;height:64px}}',
    ].join('');
    document.head.appendChild(style);
};

const renderFlag = (country) => {
    const normalized = clean(country).toLowerCase();
    if (typeof window.get_flag === 'function' && normalized) return window.get_flag(normalized);
    if (!normalized) return '';
    return `<span class="tmvu-home-feed-flag-fallback">${escapeHtml(normalized.toUpperCase())}</span>`;
};

const formatFeedLikeTime = (unixTime) => {
    const value = Number(unixTime);
    if (!Number.isFinite(value) || value <= 0) return '';
    try {
        return new Date(value * 1000).toLocaleString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch (_) {
        return '';
    }
};

const renderFeedLogo = (src, fallbackSrc = '') => {
    const primary = escapeHtml(src || '');
    const fallback = escapeHtml(fallbackSrc || '');
    if (!primary) return '<span class="tmvu-home-feed-side-fallback">⚽</span>';
    if (!fallback || fallback === primary) return `<img src="${primary}" alt="">`;
    return `<img src="${primary}" data-fallback-src="${fallback}" onerror="if(this.dataset.fallbackSrc&&this.src!==this.dataset.fallbackSrc){this.src=this.dataset.fallbackSrc;this.removeAttribute('data-fallback-src');return;}this.onerror=null;this.style.display='none'" alt="">`;
};

const renderFeedDialogLogo = (clubId) => {
    const id = clean(clubId);
    if (!id) return '<span class="tmvu-home-feed-side-fallback">⚽</span>';
    return `<img src="/pics/club_logos/${escapeHtml(id)}.png" onerror="this.onerror=null;this.style.display='none';this.insertAdjacentHTML('afterend','<span class=&quot;tmvu-home-feed-side-fallback&quot;>⚽</span>')" alt="">`;
};

const normalizeFeedLikes = (payload) => {
    const likes = Array.isArray(payload?.likes) ? payload.likes : [];
    const clubs = payload?.clubs && typeof payload.clubs === 'object' ? payload.clubs : {};
    return likes.map((like) => {
        const clubId = clean(like?.club_id);
        const clubInfo = clubs[clubId] || {};
        const timeValue = Number(like?.time) || 0;
        return {
            clubId,
            clubName: clean(like?.club_name || clubInfo?.club_name) || `#${clubId}`,
            managerName: clean(clubInfo?.manager_name),
            country: clean(clubInfo?.country).toLowerCase(),
            timeValue,
            timeText: formatFeedLikeTime(timeValue),
            href: clubId ? `/club/${clubId}/` : '',
        };
    }).sort((left, right) => left.timeValue - right.timeValue);
};

const showFeedLikesDialog = async (post) => {
    const postId = clean(post?.id);
    if (!postId) return;

    document.getElementById('tmvu-home-feed-likes-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'tmvu-home-feed-likes-overlay';
    overlay.className = 'tmvu-home-feed-likes-overlay';
    overlay.innerHTML = `
        <div class="tmvu-home-feed-likes-dialog" role="dialog" aria-modal="true" aria-labelledby="tmvu-home-feed-likes-title">
            <div class="tmvu-home-feed-likes-head">
                <div>
                    <div id="tmvu-home-feed-likes-title" class="tmvu-home-feed-likes-title">Likes</div>
                    <div class="tmvu-home-feed-likes-subtitle">Loading clubs who liked this post...</div>
                </div>
                <button type="button" class="tmvu-home-feed-likes-close" data-feed-likes-close>Close</button>
            </div>
            <div class="tmvu-home-feed-likes-body" data-feed-likes-body>
                <div class="tmvu-home-empty">Loading likes...</div>
            </div>
        </div>
    `;

    const closeDialog = () => {
        document.removeEventListener('keydown', onKeyDown);
        overlay.remove();
    };

    const onKeyDown = (event) => {
        if (event.key === 'Escape') closeDialog();
    };

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay || event.target.closest('[data-feed-likes-close]')) closeDialog();
    });

    document.addEventListener('keydown', onKeyDown);
    document.body.appendChild(overlay);

    const body = overlay.querySelector('[data-feed-likes-body]');
    const subtitle = overlay.querySelector('.tmvu-home-feed-likes-subtitle');
    const likes = normalizeFeedLikes(await TmApi.fetchFeedLikes(postId));

    subtitle.textContent = likes.length
        ? `${likes.length} club${likes.length === 1 ? '' : 's'} liked this post`
        : 'No likes found for this post';

    if (!likes.length) {
        body.innerHTML = '<div class="tmvu-home-empty">No likes returned by the feed endpoint.</div>';
        return;
    }

    body.innerHTML = `
        <div class="tmvu-home-feed-likes-list">
            ${likes.map((like) => `
                <a class="tmvu-home-feed-likes-item" href="${escapeHtml(like.href || '#')}">
                    <div class="tmvu-home-feed-likes-item-logo">${renderFeedDialogLogo(like.clubId)}</div>
                    <div class="tmvu-home-feed-likes-item-copy">
                        <div class="tmvu-home-feed-likes-item-name">${like.country ? `${renderFlag(like.country)} ` : ''}${escapeHtml(like.clubName)}</div>
                        <div class="tmvu-home-feed-likes-item-meta">${escapeHtml([like.managerName, like.timeText].filter(Boolean).join(' • '))}</div>
                    </div>
                </a>
            `).join('')}
        </div>
    `;
};

const triggerNativeClick = (element) => {
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
};

const parseNativeActionArgs = (onclickValue) => {
    const match = String(onclickValue || '').match(/([A-Za-z0-9_]+)\((.*)\)/);
    if (!match) return null;

    const rawArgs = match[2].trim();
    if (!rawArgs) return { fnName: match[1], args: [] };

    return {
        fnName: match[1],
        args: rawArgs.split(',').map((part) => part.trim()).map((part) => {
            if (part === 'true') return true;
            if (part === 'false') return false;
            if (/^['"].*['"]$/.test(part)) return part.slice(1, -1);
            const numeric = Number(part);
            return Number.isNaN(numeric) ? part : numeric;
        }),
    };
};

const runNativeActionByOnclick = (element) => {
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
};

const setNativeCommentValue = (textarea, value) => {
    if (!textarea) return;
    textarea.value = value;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    textarea.dispatchEvent(new Event('change', { bubbles: true }));
    textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
};

const formatCommentCountLabel = (count) => `${count} comment${count === 1 ? '' : 's'}`;
const formatLikeCountLabel = (count) => `${count} like${count === 1 ? '' : 's'}`;

const createFeedRenderer = ({ getMount, getFeedRoot, emptyCopy, onLoadMore }) => {
    const state = {
        expandedFeedPostIds: new Set(),
        expandedSimilarFeedPostIds: new Set(),
        currentModel: null,
        currentFeedRoot: null,
    };

    const getRenderablePosts = (feedRoot, feedModel = null) => {
        if (feedModel?.kind === 'api') {
            return feedModel.topPosts.flatMap((post) => state.expandedSimilarFeedPostIds.has(post.id)
                ? [post, ...(post.similarEntries || [])]
                : [post]);
        }
        if (Array.isArray(feedModel?.topPosts)) return feedModel.topPosts;
        return queryVisibleNativeFeedPosts(feedRoot);
    };

    const getSimilarStoriesLabel = (post) => {
        const similarCount = Array.isArray(post?.similarEntries) ? post.similarEntries.length : 0;
        if (!similarCount) return '';
        return state.expandedSimilarFeedPostIds.has(post.id)
            ? 'Hide similar stories'
            : `Show ${similarCount} similar stories`;
    };

    const getCommentSummaryLabel = (post) => {
        const totalCount = Number(post?.totalCommentCount) || 0;
        return totalCount ? formatCommentCountLabel(totalCount) : '';
    };

    const getRemainingCommentCopy = (post, visibleCommentCount) => {
        const loadedCount = Array.isArray(post?.comments) ? post.comments.length : 0;
        const hiddenLoadedCount = Math.max(loadedCount - visibleCommentCount, 0);
        const hiddenNativeCount = Math.max((Number(post?.totalCommentCount) || 0) - loadedCount, 0);
        if (hiddenLoadedCount > 0) return { title: `Show ${hiddenLoadedCount} more loaded comments` };
        if (hiddenNativeCount > 0) return { title: `Open full thread (${hiddenNativeCount} more on TM)` };
        return null;
    };

    const renderCurrent = () => {
        if (state.currentModel) {
            renderCards(state.currentFeedRoot || getFeedRoot?.() || null, state.currentModel);
            return;
        }
        renderCards(state.currentFeedRoot || getFeedRoot?.() || null, null);
    };

    const mountFeedComposer = (targetEl, postEl, mode = 'comment') => {
        if (!targetEl || !postEl) return;

        const controls = findNativeHomeFeedCommentControls(postEl);
        if (!controls?.textarea || !controls?.submitButton) {
            targetEl.hidden = true;
            targetEl.innerHTML = '';
            return;
        }

        targetEl.innerHTML = `
            <textarea class="tmvu-home-feed-composer-input" data-role="input" placeholder="${mode === 'reply' ? 'Write a reply...' : 'Write a comment...'}"></textarea>
            <div class="tmvu-home-feed-composer-actions">
                <button type="button" class="tmvu-home-feed-composer-btn" data-role="cancel">Cancel</button>
                <button type="button" class="tmvu-home-feed-composer-btn" data-role="submit">${mode === 'reply' ? 'Reply' : 'Comment'}</button>
            </div>
        `;
        targetEl.hidden = false;

        const input = targetEl.querySelector('[data-role="input"]');
        targetEl.querySelector('[data-role="cancel"]')?.addEventListener('click', () => {
            targetEl.hidden = true;
            targetEl.innerHTML = '';
        });
        targetEl.querySelector('[data-role="submit"]')?.addEventListener('click', () => {
            const value = clean(input?.value || '');
            if (!value) {
                input?.focus();
                return;
            }
            setNativeCommentValue(controls.textarea, value);
            triggerNativeClick(controls.submitButton);
            targetEl.hidden = true;
            targetEl.innerHTML = '';
            setTimeout(renderCurrent, 500);
            setTimeout(renderCurrent, 1200);
        });

        if (input) {
            try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }
        }
    };

    const handleFeedComposerAction = (post, action, composerEl) => {
        const nativeAction = findNativeHomeFeedAction(post.sourceEl, action);
        if (!nativeAction) return false;
        triggerNativeClick(nativeAction);
        requestAnimationFrame(() => mountFeedComposer(composerEl, post.sourceEl, action));
        return true;
    };

    const renderCards = (feedRoot, feedModel = null) => {
        const mount = getMount();
        if (!mount) return;

        const posts = getRenderablePosts(feedRoot, feedModel);
        state.currentFeedRoot = feedRoot;
        state.currentModel = feedModel;

        if (!posts.length) {
            mount.innerHTML = `<div class="tmvu-home-empty">${escapeHtml(emptyCopy)}</div>`;
            return;
        }

        mount.innerHTML = `
            <div class="tmvu-home-feed">
                ${posts.map((post) => {
                    const isExpanded = state.expandedFeedPostIds.has(post.id);
                    const renderedComments = isExpanded ? post.comments : post.comments.slice(0, 3);
                    const remainingCommentCopy = getRemainingCommentCopy(post, renderedComments.length);
                    const commentSummaryLabel = getCommentSummaryLabel(post);
                    const hasCommentSummaryAction = Boolean(remainingCommentCopy || post.hiddenCommentsAction || (post.comments.length > 3));
                    const similarStoriesLabel = getSimilarStoriesLabel(post);
                    return `
                        <article class="tmvu-home-feed-post${post.isSimilarPost ? ' tmvu-home-feed-post--similar' : ''}" data-feed-post-id="${escapeHtml(post.id)}">
                            <div class="tmvu-home-feed-side">
                                <div class="tmvu-home-feed-side-logo">${renderFeedLogo(post.authorLogoSrc, post.authorLogoFallbackSrc)}</div>
                                ${post.authorName ? (post.authorHref ? `<a class="tmvu-home-feed-side-name" href="${escapeHtml(post.authorHref)}">${escapeHtml(post.authorName)}</a>` : `<div class="tmvu-home-feed-side-name">${escapeHtml(post.authorName)}</div>`) : ''}
                            </div>
                            <div class="tmvu-home-feed-main">
                                <div>${post.time ? `<div class="tmvu-home-feed-time" style="float:right;">${escapeHtml(post.time)}</div>` : ''}<div class="tmvu-home-feed-body">${post.bodyHtml || ''}</div></div>
                                <div class="tmvu-home-feed-meta">
                                    <div class="tmvu-home-feed-meta-left">
                                        ${post.likeCount > 0 ? `<button type="button" class="tmvu-home-feed-like-count" data-feed-like-summary title="Show likes">${escapeHtml(formatLikeCountLabel(post.likeCount))}</button>` : ''}
                                        ${commentSummaryLabel ? (hasCommentSummaryAction ? `<button type="button" class="tmvu-home-feed-comment-count tmvu-home-feed-comment-count--action" data-feed-comment-summary title="Open comments">${escapeHtml(commentSummaryLabel)}</button>` : `<span class="tmvu-home-feed-comment-count">${escapeHtml(commentSummaryLabel)}</span>`) : ''}
                                    </div>
                                </div>
                                <div class="tmvu-home-feed-actions">
                                    <button type="button" class="tmvu-home-feed-action" data-feed-action="like">Like</button>
                                    <button type="button" class="tmvu-home-feed-action" data-feed-action="comment">Comment</button>
                                    <button type="button" class="tmvu-home-feed-action" data-feed-action="reply">Reply</button>
                                    <button type="button" class="tmvu-home-feed-action" data-feed-action="link">Link</button>
                                    <button type="button" class="tmvu-home-feed-action" data-feed-action="mute">Mute</button>
                                </div>
                                <div class="tmvu-home-feed-composer" data-feed-composer hidden></div>
                                ${(post.totalCommentCount > 0 || post.comments.length) ? `
                                    <div class="tmvu-home-feed-comments">
                                        ${remainingCommentCopy ? `
                                            <button type="button" class="tmvu-home-feed-more-comments" data-feed-more-comments>
                                                <span class="tmvu-home-feed-more-comments-badge">+</span>
                                                <span class="tmvu-home-feed-more-comments-copy">
                                                    <span class="tmvu-home-feed-more-comments-title">${escapeHtml(remainingCommentCopy.title)}</span>
                                                </span>
                                            </button>
                                        ` : ''}
                                        ${renderedComments.map((comment) => `
                                            <div class="tmvu-home-feed-comment">
                                                <div class="tmvu-home-feed-comment-logo">${renderFeedLogo(comment.authorLogoSrc, comment.authorLogoFallbackSrc)}</div>
                                                <div class="tmvu-home-feed-comment-content">${comment.bodyHtml}</div>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                                ${similarStoriesLabel ? `
                                    <div class="tmvu-home-feed-similar">
                                        <button type="button" class="tmvu-home-feed-similar-btn" data-feed-similar-stories>${escapeHtml(similarStoriesLabel)}</button>
                                    </div>
                                ` : ''}
                            </div>
                        </article>
                    `;
                }).join('')}
                ${feedModel?.kind === 'api' && (feedModel?.canLoadMore || feedModel?.isLoadingMore) ? `
                    <div class="tmvu-home-feed-load-more">
                        <button type="button" class="tmvu-home-feed-load-more-btn" data-feed-load-more ${feedModel?.isLoadingMore ? 'disabled' : ''}>${feedModel?.isLoadingMore ? 'Loading more...' : 'Load older feed posts'}</button>
                    </div>
                ` : ''}
            </div>
        `;

        const openCommentThread = (post) => {
            if (!post) return;
            if (post.comments.length > 3 && !state.expandedFeedPostIds.has(post.id)) {
                state.expandedFeedPostIds.add(post.id);
                renderCurrent();
                return;
            }

            state.expandedFeedPostIds.add(post.id);
            const nativeTarget = post.hiddenCommentsAction?.matches?.('.hidden_comments_link, .comments_header, .comments_count')
                ? post.hiddenCommentsAction.querySelector('.faux_link, [onclick], a[href]') || post.hiddenCommentsAction
                : post.hiddenCommentsAction;

            if (!nativeTarget) {
                renderCurrent();
                return;
            }

            if (!runNativeActionByOnclick(nativeTarget)) triggerNativeClick(nativeTarget);
            setTimeout(renderCurrent, 500);
            setTimeout(renderCurrent, 1200);
        };

        mount.querySelectorAll('[data-feed-post-id]').forEach((postNode) => {
            const post = posts.find((entry) => entry.id === postNode.getAttribute('data-feed-post-id'));
            if (!post) return;

            const composerEl = postNode.querySelector('[data-feed-composer]');
            postNode.querySelector('[data-feed-like-summary]')?.addEventListener('click', () => showFeedLikesDialog(post));
            postNode.querySelector('[data-feed-comment-summary]')?.addEventListener('click', () => openCommentThread(post));
            postNode.querySelector('[data-feed-more-comments]')?.addEventListener('click', () => openCommentThread(post));
            postNode.querySelector('[data-feed-similar-stories]')?.addEventListener('click', (event) => {
                event.preventDefault();
                if (state.expandedSimilarFeedPostIds.has(post.id)) state.expandedSimilarFeedPostIds.delete(post.id);
                else state.expandedSimilarFeedPostIds.add(post.id);
                renderCurrent();
            });

            postNode.querySelectorAll('[data-feed-action]').forEach((button) => {
                const action = button.getAttribute('data-feed-action');
                const nativeAction = post.sourceEl ? findNativeHomeFeedAction(post.sourceEl, action) : null;
                button.disabled = !nativeAction;
                button.addEventListener('click', () => {
                    if (!nativeAction) return;
                    if (action === 'comment' || action === 'reply') {
                        handleFeedComposerAction(post, action, composerEl);
                        return;
                    }
                    if (action === 'link' || action === 'mute') runNativeActionByOnclick(nativeAction);
                    else triggerNativeClick(nativeAction);
                });
            });
        });

        mount.querySelector('[data-feed-load-more]')?.addEventListener('click', () => onLoadMore?.());
    };

    return {
        renderModel(feedModel, feedRoot = getFeedRoot?.() || state.currentFeedRoot || null) {
            renderCards(feedRoot, feedModel);
        },
        renderPosts(posts, options = {}) {
            renderCards(options.feedRoot || getFeedRoot?.() || state.currentFeedRoot || null, {
                kind: options.kind || 'api',
                topPosts: Array.isArray(posts) ? posts : [],
                lastPost: options.lastPost || '',
                canLoadMore: Boolean(options.canLoadMore),
                isLoadingMore: Boolean(options.isLoadingMore),
            });
        },
        renderNative(feedRoot = getFeedRoot?.() || state.currentFeedRoot || null) {
            renderCards(feedRoot, null);
        },
        renderCurrent,
    };
};

export const createSocialFeedComponent = ({
    mount,
    getFeedRoot,
    emptyCopy = 'No feed posts loaded.',
    loadingCopy = 'Loading feed...',
    onLoadMore = null,
} = {}) => {
    injectStyles();

    let hostMount = mount;
    const renderer = createFeedRenderer({
        getMount: () => hostMount,
        getFeedRoot,
        emptyCopy,
        onLoadMore: async () => {
            if (typeof onLoadMore === 'function') await onLoadMore();
        },
    });

    return {
        setMount(nextMount) {
            hostMount = nextMount;
        },
        renderLoading(copy = loadingCopy) {
            if (!hostMount) return;
            hostMount.innerHTML = `<div class="tmvu-home-empty">${escapeHtml(copy)}</div>`;
        },
        renderEmpty(copy = emptyCopy) {
            if (!hostMount) return;
            hostMount.innerHTML = `<div class="tmvu-home-empty">${escapeHtml(copy)}</div>`;
        },
        ...renderer,
        async loadMore() {
            if (typeof onLoadMore === 'function') await onLoadMore();
        },
    };
};

export const createSocialFeedController = ({
    mount,
    getFeedRoot,
    fetchFeedPayload,
    emptyCopy = 'No feed posts loaded.',
    loadingCopy = 'Loading feed...',
} = {}) => {
    injectStyles();

    const apiFeedState = {
        topPosts: [],
        lastPost: '',
        canLoadMore: false,
        isLoadingMore: false,
    };

    const getApiFeedStateModel = () => apiFeedState.topPosts.length
        ? {
            kind: 'api',
            topPosts: apiFeedState.topPosts,
            lastPost: apiFeedState.lastPost,
            canLoadMore: apiFeedState.canLoadMore,
            isLoadingMore: apiFeedState.isLoadingMore,
        }
        : null;

    const mergeApiFeedPosts = (existingPosts, nextPosts) => {
        const merged = new Map();
        existingPosts.forEach((post) => merged.set(post.id, post));
        nextPosts.forEach((post) => {
            if (!merged.has(post.id)) merged.set(post.id, post);
        });
        return Array.from(merged.values());
    };

    const component = createSocialFeedComponent({
        mount,
        getFeedRoot,
        emptyCopy,
        loadingCopy,
        onLoadMore: async () => {
            if (apiFeedState.isLoadingMore || !apiFeedState.canLoadMore) return;
            apiFeedState.isLoadingMore = true;
            component.renderModel(getApiFeedStateModel());
            await loadApiFeedPage({ lastPost: apiFeedState.lastPost });
            apiFeedState.isLoadingMore = false;
            component.renderModel(getApiFeedStateModel());
        },
    });

    const fetchApiFeedModel = async ({ lastPost = '' } = {}) => {
        const feedRoot = getFeedRoot?.() || null;
        const payload = await fetchFeedPayload({ lastPost, feedRoot });
        return buildHomeFeedModel({
            payload,
            nativePostMap: buildNativeHomeFeedPostMap(feedRoot),
            fetchFeedNames: TmApi.fetchFeedNames,
        });
    };

    const loadApiFeedPage = async ({ reset = false, lastPost = '' } = {}) => {
        const apiFeedModel = await fetchApiFeedModel({ lastPost });
        if (!apiFeedModel?.topPosts?.length) {
            if (reset) {
                apiFeedState.topPosts = [];
                apiFeedState.lastPost = '';
            }
            apiFeedState.canLoadMore = false;
            return null;
        }

        apiFeedState.topPosts = reset
            ? apiFeedModel.topPosts
            : mergeApiFeedPosts(apiFeedState.topPosts, apiFeedModel.topPosts);
        apiFeedState.lastPost = apiFeedModel.lastPost || apiFeedState.lastPost;
        apiFeedState.canLoadMore = Boolean(apiFeedModel.lastPost) && apiFeedModel.lastPost !== lastPost;
        return getApiFeedStateModel();
    };

    return {
        async render() {
            if (!mount) return false;

            const feedRoot = getFeedRoot?.() || null;
            component.renderLoading();

            const apiFeedModel = await loadApiFeedPage({ reset: true });
            if (apiFeedModel?.topPosts?.length) {
                component.renderModel(apiFeedModel);
                return true;
            }
            if (feedRoot && queryVisibleNativeFeedPosts(feedRoot).length) {
                component.renderNative(feedRoot);
                return true;
            }

            component.renderEmpty();
            return false;
        },
    };
};