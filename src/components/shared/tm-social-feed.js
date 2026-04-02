import { TmApi } from '../../services/index.js';
import { buildHomeFeedModel } from '../../utils/home-feed.js';
import { buildNativeHomeFeedPostMap, findNativeHomeFeedAction, findNativeHomeFeedCommentControls, queryVisibleNativeFeedPosts } from '../../utils/home-feed-native.js';
import { TmUI } from './tm-ui.js';

const STYLE_ID = 'tmvu-social-feed-style';

const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const buttonHtml = ({ cls = '', attrs = {}, shape = 'full', size = 'sm', color = 'secondary', ...opts } = {}) => TmUI.button({
    cls,
    attrs,
    shape,
    size,
    color,
    ...opts,
}).outerHTML;

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
        '.tmvu-social-feed-source.tmvu-social-feed-source--hidden>:not([data-tmvu-social-feed-mount]){display:none!important}',
        '.tmvu-home-feed{display:flex;flex-direction:column;gap:var(--tmu-space-lg)}',
        '.tmvu-home-feed-post{display:flex;gap:var(--tmu-space-xl);padding:var(--tmu-space-xl) var(--tmu-space-xl) var(--tmu-space-lg);border-radius:var(--tmu-space-lg);border:1px solid var(--tmu-border-soft-alpha);background:linear-gradient(180deg, var(--tmu-border-contrast), transparent),var(--tmu-surface-dark-mid);box-shadow:inset 0 1px 0 var(--tmu-border-contrast)}',
        '.tmvu-home-feed-post--similar{margin-left:var(--tmu-space-xl);padding-left:var(--tmu-space-xl);position:relative}',
        '.tmvu-home-feed-post--similar::before{content:"";position:absolute;left:var(--tmu-space-sm);top:var(--tmu-space-md);bottom:var(--tmu-space-md);width:2px;border-radius:999px;background:var(--tmu-success-fill-soft)}',
        '.tmvu-home-feed-side{flex-shrink:0;width:116px;display:flex;flex-direction:column;align-items:center;gap:var(--tmu-space-sm);text-align:center}',
        '.tmvu-home-feed-side-logo{width:76px;height:76px;border-radius:var(--tmu-space-lg);overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--tmu-surface-panel);border:1px solid var(--tmu-border-input-overlay);box-shadow:0 8px 18px var(--tmu-shadow-elev)}',
        '.tmvu-home-feed-side-logo img{max-width:72px;max-height:72px;width:auto;height:auto;object-fit:contain;display:block}',
        '.tmvu-home-feed-side-fallback{font-size:var(--tmu-font-3xl);opacity:.35}',
        '.tmvu-home-feed-side-name{font-size:var(--tmu-font-sm);font-weight:800;color:var(--tmu-text-strong);text-decoration:none;line-height:1.35;word-break:break-word}',
        '.tmvu-home-feed-side-name:hover{color:var(--tmu-text-inverse)}',
        '.tmvu-home-feed-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:var(--tmu-space-md)}',
        '.tmvu-home-feed-time{display:block;float:right;font-size:var(--tmu-font-xs);color:var(--tmu-text-dim);white-space:nowrap;font-variant-numeric:tabular-nums}',
        '.tmvu-home-feed-body{font-size:var(--tmu-font-md);color:var(--tmu-text-strong);line-height:1.72;word-break:break-word}',
        '.tmvu-home-feed-body a{color:var(--tmu-accent);text-decoration:none}',
        '.tmvu-home-feed-body a:hover{text-decoration:underline}',
        '.tmvu-feed-stars{display:inline-flex;align-items:center;gap:0;vertical-align:baseline}',
        '.tmvu-feed-stars-full{color:var(--tmu-warning)}',
        '.tmvu-feed-stars-empty{color:var(--tmu-border-embedded)}',
        '.tmvu-home-feed-meta{display:flex;align-items:center;justify-content:flex-start;gap:var(--tmu-space-md);padding-bottom:0;color:var(--tmu-text-dim)}',
        '.tmvu-home-feed-meta-left{display:flex;align-items:center;gap:var(--tmu-space-md);flex-wrap:wrap}',
        '.tmvu-home-feed-like-count,.tmvu-home-feed-comment-count{display:inline-flex;align-items:center;gap:var(--tmu-space-sm);min-height:24px;padding:0 var(--tmu-space-md);border-radius:999px;border:1px solid var(--tmu-border-input-overlay);background:var(--tmu-surface-tab-active);color:var(--tmu-text-strong);font-size:var(--tmu-font-xs);font-weight:800;line-height:1;letter-spacing:.01em}',
        '.tmvu-home-feed-like-count::before{content:"♥";font-size:var(--tmu-font-xs);color:var(--tmu-success)}',
        '.tmvu-home-feed-comment-count::before{content:"💬";font-size:var(--tmu-font-xs);opacity:.9}',
        '.tmvu-home-feed-like-count{cursor:pointer;transition:background .12s,border-color .12s,color .12s;background:var(--tmu-surface-tab-active);border:none}',
        '.tmvu-home-feed-like-count:hover{background:var(--tmu-surface-tab-hover);color:var(--tmu-text-strong)}',
        '.tmvu-home-feed-like-count:disabled{opacity:.55;cursor:default}',
        '.tmvu-home-feed-comment-count{border:none}',
        '.tmvu-home-feed-comment-count.tmvu-home-feed-comment-count--action{cursor:pointer;transition:background .12s,color .12s}',
        '.tmvu-home-feed-comment-count.tmvu-home-feed-comment-count--action:hover{background:var(--tmu-surface-tab-hover);color:var(--tmu-text-strong)}',
        '.tmvu-home-feed-actions{display:flex;gap:var(--tmu-space-sm);align-items:center;padding-top:0;flex-wrap:wrap}',
        '.tmvu-home-feed-action{appearance:none;min-height:28px;padding:0 var(--tmu-space-md);border-radius:999px;border:1px solid var(--tmu-border-input-overlay);background:var(--tmu-surface-tab-active);color:var(--tmu-text-main);cursor:pointer;font:inherit;font-size:var(--tmu-font-xs);font-weight:800;line-height:1;text-decoration:none;display:inline-flex;align-items:center;box-shadow:inset 0 1px 0 var(--tmu-border-contrast)}',
        '.tmvu-home-feed-action:hover{background:var(--tmu-surface-tab-hover);color:var(--tmu-text-strong);border-color:var(--tmu-border-success)}',
        '.tmvu-home-feed-action:disabled{opacity:.45;cursor:default}',
        '.tmvu-home-feed-similar{display:flex;justify-content:flex-end;padding:var(--tmu-space-md) 0 0 var(--tmu-space-xl);margin-top:var(--tmu-space-md);border-top:1px solid var(--tmu-border-contrast)}',
        '.tmvu-home-feed-similar-btn{appearance:none;background:transparent;border:none;color:var(--tmu-accent);cursor:pointer;font:inherit;font-size:var(--tmu-font-sm);font-weight:800;line-height:1.2;padding:0;display:inline-flex;align-items:center;gap:var(--tmu-space-sm)}',
        '.tmvu-home-feed-similar-btn:hover{color:var(--tmu-text-strong)}',
        '.tmvu-home-feed-composer{margin-top:var(--tmu-space-md);padding-top:var(--tmu-space-md);border-top:1px solid var(--tmu-border-contrast)}',
        '.tmvu-home-feed-composer[hidden]{display:none!important}',
        '.tmvu-home-feed-composer-input{width:100%;min-height:84px;box-sizing:border-box;background:var(--tmu-surface-overlay);border:1px solid var(--tmu-border-input-overlay);border-radius:var(--tmu-space-md);color:var(--tmu-text-main);padding:var(--tmu-space-md) var(--tmu-space-md);font:inherit;font-size:var(--tmu-font-sm);line-height:1.45;resize:vertical}',
        '.tmvu-home-feed-composer-input::placeholder{color:var(--tmu-text-faint)}',
        '.tmvu-home-feed-composer-actions{display:flex;justify-content:flex-end;gap:var(--tmu-space-sm);margin-top:var(--tmu-space-sm)}',
        '.tmvu-home-feed-composer-btn{appearance:none;border:1px solid var(--tmu-border-input-overlay);background:var(--tmu-surface-overlay);border-radius:999px;color:var(--tmu-text-main);cursor:pointer;font:inherit;font-size:var(--tmu-font-xs);font-weight:700;line-height:1;padding:var(--tmu-space-sm) var(--tmu-space-md)}',
        '.tmvu-home-feed-composer-btn:hover{background:var(--tmu-surface-tab-hover);border-color:var(--tmu-border-success);color:var(--tmu-text-strong)}',
        '.tmvu-home-feed-composer-btn[data-role="submit"]{background:var(--tmu-surface-tab-active);color:var(--tmu-text-strong)}',
        '.tmvu-home-feed-comments{display:flex;flex-direction:column;gap:var(--tmu-space-md);margin-top:var(--tmu-space-lg);padding-top:var(--tmu-space-md);border-top:1px solid var(--tmu-border-contrast)}',
        '.tmvu-home-feed-more-comments{display:flex;align-items:center;gap:var(--tmu-space-md);padding:var(--tmu-space-md) var(--tmu-space-md);border-radius:var(--tmu-space-md);background:var(--tmu-surface-overlay);border:1px dashed var(--tmu-border-contrast);color:var(--tmu-text-main);cursor:pointer}',
        '.tmvu-home-feed-more-comments:hover{background:var(--tmu-surface-tab-hover);border-color:var(--tmu-border-success)}',
        '.tmvu-home-feed-more-comments-badge{display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;border-radius:var(--tmu-space-sm);background:var(--tmu-surface-panel);border:1px solid var(--tmu-border-input-overlay);font-size:var(--tmu-font-lg);color:var(--tmu-text-muted)}',
        '.tmvu-home-feed-more-comments-copy{display:flex;flex-direction:column;gap:var(--tmu-space-xs);min-width:0}',
        '.tmvu-home-feed-more-comments-title{font-size:var(--tmu-font-sm);font-weight:800;color:var(--tmu-text-strong)}',
        '.tmvu-home-feed-comment{display:flex;align-items:flex-start;gap:var(--tmu-space-md);padding:var(--tmu-space-md) var(--tmu-space-lg);border-radius:var(--tmu-space-md);background:var(--tmu-surface-overlay);border:1px solid var(--tmu-border-contrast)}',
        '.tmvu-home-feed-comment-logo{flex:0 0 42px;width:42px;height:42px;border-radius:var(--tmu-space-sm);overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--tmu-surface-panel);border:1px solid var(--tmu-border-input-overlay)}',
        '.tmvu-home-feed-comment-logo img{max-width:42px;max-height:42px;width:auto;height:auto;object-fit:contain;display:block}',
        '.tmvu-home-feed-comment-content{flex:1 1 auto;min-width:0}',
        '.tmvu-home-feed-comment-body{font-size:var(--tmu-font-sm);line-height:1.62;color:var(--tmu-text-main)}',
        '.tmvu-home-feed-comment-time{display:block;float:right;font-size:var(--tmu-font-xs);color:var(--tmu-text-faint);margin-left:var(--tmu-space-sm)}',
        '.tmvu-home-feed-flag-fallback{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:12px;padding:0 var(--tmu-space-xs);border-radius:var(--tmu-space-xs);background:var(--tmu-surface-overlay);font-size:var(--tmu-font-2xs);font-weight:800;line-height:1;color:var(--tmu-text-strong);vertical-align:middle}',
        '.tmvu-home-feed-likes-overlay{position:fixed;inset:0;z-index:200000;background:var(--tmu-shadow-panel);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:var(--tmu-space-xl)}',
        '.tmvu-home-feed-likes-dialog{width:min(520px,100%);max-height:min(72vh,760px);display:flex;flex-direction:column;gap:var(--tmu-space-lg);padding:var(--tmu-space-xl);border-radius:var(--tmu-space-lg);border:1px solid var(--tmu-border-success);background:linear-gradient(160deg,var(--tmu-surface-card) 0%,var(--tmu-surface-dark-muted) 100%);box-shadow:0 20px 60px var(--tmu-shadow-panel)}',
        '.tmvu-home-feed-likes-head{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--tmu-space-md)}',
        '.tmvu-home-feed-likes-title{font-size:var(--tmu-font-md);font-weight:800;color:var(--tmu-text-strong)}',
        '.tmvu-home-feed-likes-subtitle{margin-top:var(--tmu-space-xs);font-size:var(--tmu-font-xs);color:var(--tmu-text-muted)}',
        '.tmvu-home-feed-likes-close{appearance:none;border:1px solid var(--tmu-border-success);background:var(--tmu-surface-tab-active);border-radius:999px;color:var(--tmu-text-strong);cursor:pointer;font:inherit;font-size:var(--tmu-font-xs);font-weight:700;line-height:1;padding:var(--tmu-space-sm) var(--tmu-space-md)}',
        '.tmvu-home-feed-likes-close:hover{background:var(--tmu-surface-tab-hover)}',
        '.tmvu-home-feed-likes-body{overflow:auto;padding-right:var(--tmu-space-xs)}',
        '.tmvu-home-feed-likes-list{display:flex;flex-direction:column;gap:var(--tmu-space-sm)}',
        '.tmvu-home-feed-likes-item{display:flex;align-items:center;gap:var(--tmu-space-md);padding:var(--tmu-space-md) var(--tmu-space-md);border-radius:var(--tmu-space-md);border:1px solid var(--tmu-border-contrast);background:var(--tmu-surface-overlay);text-decoration:none}',
        '.tmvu-home-feed-likes-item:hover{background:var(--tmu-surface-tab-hover);border-color:var(--tmu-border-success)}',
        '.tmvu-home-feed-likes-item-logo{flex:0 0 40px;width:40px;height:40px;border-radius:var(--tmu-space-sm);overflow:hidden;display:flex;align-items:center;justify-content:center;background:var(--tmu-surface-panel);border:1px solid var(--tmu-border-input-overlay)}',
        '.tmvu-home-feed-likes-item-logo img{max-width:40px;max-height:40px;width:auto;height:auto;object-fit:contain;display:block}',
        '.tmvu-home-feed-likes-item-copy{min-width:0;display:flex;flex-direction:column;gap:var(--tmu-space-xs)}',
        '.tmvu-home-feed-likes-item-name{display:flex;align-items:center;gap:var(--tmu-space-sm);font-size:var(--tmu-font-sm);font-weight:800;color:var(--tmu-text-strong)}',
        '.tmvu-home-feed-likes-item-meta{font-size:var(--tmu-font-xs);color:var(--tmu-text-dim)}',
        '.tmvu-home-feed-load-more{display:flex;justify-content:center;padding-top:var(--tmu-space-md)}',
        '.tmvu-home-feed-load-more-btn{appearance:none;min-width:190px;padding:var(--tmu-space-md) var(--tmu-space-lg);border-radius:999px;border:1px solid var(--tmu-border-success);background:var(--tmu-surface-tab-active);color:var(--tmu-text-strong);cursor:pointer;font:inherit;font-size:var(--tmu-font-sm);font-weight:800;line-height:1.1}',
        '.tmvu-home-feed-load-more-btn:hover{background:var(--tmu-surface-tab-hover);border-color:var(--tmu-border-success)}',
        '.tmvu-home-feed-load-more-btn:disabled{opacity:.6;cursor:default}',
        '@media (max-width: 760px){.tmvu-home-feed-post{flex-direction:column;padding:var(--tmu-space-lg)}.tmvu-home-feed-side{width:100%;flex-direction:row;justify-content:flex-start;text-align:left}.tmvu-home-feed-side-logo{width:64px;height:64px}}',
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
                ${buttonHtml({ label: 'Close', cls: 'tmvu-home-feed-likes-close', attrs: { 'data-feed-likes-close': true } })}
            </div>
            <div class="tmvu-home-feed-likes-body" data-feed-likes-body>
                ${TmUI.loading('Loading likes...', true)}
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
        body.innerHTML = TmUI.empty('No likes returned by the feed endpoint.', true);
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
                ${buttonHtml({ label: 'Cancel', cls: 'tmvu-home-feed-composer-btn', attrs: { 'data-role': 'cancel' } })}
                ${buttonHtml({ label: mode === 'reply' ? 'Reply' : 'Comment', cls: 'tmvu-home-feed-composer-btn', attrs: { 'data-role': 'submit' } })}
            </div>
        `;
        targetEl.hidden = false;
        targetEl.__tmFeedComposerControls = controls;

        const input = targetEl.querySelector('[data-role="input"]');
        targetEl.onclick = (event) => {
            const cancelButton = event.target.closest('[data-role="cancel"]');
            if (cancelButton && targetEl.contains(cancelButton)) {
                targetEl.hidden = true;
                targetEl.innerHTML = '';
                return;
            }

            const submitButton = event.target.closest('[data-role="submit"]');
            if (!submitButton || !targetEl.contains(submitButton)) return;

            const value = clean(input?.value || '');
            if (!value) {
                input?.focus();
                return;
            }

            const composerControls = targetEl.__tmFeedComposerControls;
            if (!composerControls?.textarea || !composerControls?.submitButton) return;
            setNativeCommentValue(composerControls.textarea, value);
            triggerNativeClick(composerControls.submitButton);
            targetEl.hidden = true;
            targetEl.innerHTML = '';
            setTimeout(renderCurrent, 500);
            setTimeout(renderCurrent, 1200);
        };

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
            mount.innerHTML = TmUI.empty(escapeHtml(emptyCopy), true);
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
                                    ${buttonHtml({ label: 'Like', cls: 'tmvu-home-feed-action', attrs: { 'data-feed-action': 'like' } })}
                                    ${buttonHtml({ label: 'Comment', cls: 'tmvu-home-feed-action', attrs: { 'data-feed-action': 'comment' } })}
                                    ${buttonHtml({ label: 'Reply', cls: 'tmvu-home-feed-action', attrs: { 'data-feed-action': 'reply' } })}
                                    ${buttonHtml({ label: 'Link', cls: 'tmvu-home-feed-action', attrs: { 'data-feed-action': 'link' } })}
                                    ${buttonHtml({ label: 'Mute', cls: 'tmvu-home-feed-action', attrs: { 'data-feed-action': 'mute' } })}
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
                                        ${buttonHtml({ label: similarStoriesLabel, cls: 'tmvu-home-feed-similar-btn', color: 'secondary', attrs: { 'data-feed-similar-stories': true } })}
                                    </div>
                                ` : ''}
                            </div>
                        </article>
                    `;
                }).join('')}
                ${feedModel?.kind === 'api' && (feedModel?.canLoadMore || feedModel?.isLoadingMore) ? `
                    <div class="tmvu-home-feed-load-more">
                        ${buttonHtml({
                            label: feedModel?.isLoadingMore ? 'Loading more...' : 'Load older feed posts',
                            cls: 'tmvu-home-feed-load-more-btn',
                            attrs: {
                                'data-feed-load-more': true,
                                disabled: Boolean(feedModel?.isLoadingMore),
                            },
                        })}
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

        const postsById = new Map(posts.map((entry) => [entry.id, entry]));

        mount.querySelectorAll('[data-feed-post-id]').forEach((postNode) => {
            const postId = postNode.getAttribute('data-feed-post-id');
            const post = postId ? postsById.get(postId) : null;
            if (!post) return;

            postNode.querySelectorAll('[data-feed-action]').forEach((button) => {
                const action = button.getAttribute('data-feed-action');
                const nativeAction = post.sourceEl ? findNativeHomeFeedAction(post.sourceEl, action) : null;
                button.disabled = !nativeAction;
            });
        });

        mount.onclick = (event) => {
            const loadMoreButton = event.target.closest('[data-feed-load-more]');
            if (loadMoreButton && mount.contains(loadMoreButton)) {
                event.preventDefault();
                if (!loadMoreButton.disabled) onLoadMore?.();
                return;
            }

            const postNode = event.target.closest('[data-feed-post-id]');
            if (!postNode || !mount.contains(postNode)) return;

            const postId = postNode.getAttribute('data-feed-post-id');
            const post = postId ? postsById.get(postId) : null;
            if (!post) return;

            if (event.target.closest('[data-feed-like-summary]')) {
                showFeedLikesDialog(post);
                return;
            }

            if (event.target.closest('[data-feed-comment-summary], [data-feed-more-comments]')) {
                openCommentThread(post);
                return;
            }

            if (event.target.closest('[data-feed-similar-stories]')) {
                event.preventDefault();
                if (state.expandedSimilarFeedPostIds.has(post.id)) state.expandedSimilarFeedPostIds.delete(post.id);
                else state.expandedSimilarFeedPostIds.add(post.id);
                renderCurrent();
                return;
            }

            const actionButton = event.target.closest('[data-feed-action]');
            if (!actionButton || actionButton.disabled) return;

            const action = actionButton.getAttribute('data-feed-action');
            const nativeAction = post.sourceEl ? findNativeHomeFeedAction(post.sourceEl, action) : null;
            if (!nativeAction) return;

            if (action === 'comment' || action === 'reply') {
                const composerEl = postNode.querySelector('[data-feed-composer]');
                handleFeedComposerAction(post, action, composerEl);
                return;
            }

            if (action === 'link' || action === 'mute') runNativeActionByOnclick(nativeAction);
            else triggerNativeClick(nativeAction);
        };
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
            hostMount.innerHTML = TmUI.loading(escapeHtml(copy), true);
        },
        renderEmpty(copy = emptyCopy) {
            if (!hostMount) return;
            hostMount.innerHTML = TmUI.empty(escapeHtml(copy), true);
        },
        ...renderer,
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