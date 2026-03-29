const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeFeedTime = (value) => clean(String(value || '').replace(/\s*\+\d+\s*$/g, ''));

const isNativeFeedPostVisible = (postEl, feedRoot) => {
    let node = postEl;
    while (node && node !== feedRoot) {
        if (node !== postEl) {
            if (node.classList?.contains('hide')) return false;
            const style = node.getAttribute?.('style') || '';
            if (/display\s*:\s*none/i.test(style)) return false;
        }
        node = node.parentElement;
    }
    return !postEl.classList?.contains('hide');
};

const extractClubIdFromHref = (href) => String(href || '').match(/\/club\/(\d+)/i)?.[1] || '';

const getClubLogoFromId = (clubId) => {
    const id = clean(clubId);
    return id ? `/pics/club_logos/${id}.png` : '';
};

const getClubLogoFromHref = (href) => {
    const clubId = extractClubIdFromHref(href);
    return getClubLogoFromId(clubId);
};

const normalizeFeedLogoSrc = (src) => String(src || '').replace(/_25(\.png(?:\?[^\s"']*)?)$/i, '$1');

const resolvePreferredFeedLogo = (rawSrc, clubId = '') => {
    const normalizedSrc = normalizeFeedLogoSrc(rawSrc);
    const preferredClubLogo = getClubLogoFromId(clubId);

    if (/\/logos_nonpro\//i.test(normalizedSrc) && preferredClubLogo) {
        return {
            src: preferredClubLogo,
            fallbackSrc: normalizedSrc,
        };
    }

    return {
        src: normalizedSrc || preferredClubLogo,
        fallbackSrc: '',
    };
};

const findFeedCommentAuthorAnchor = (commentEl) => commentEl?.querySelector('.comment_name a, .comment_author a') || null;

const findFeedCommentLogo = (commentEl) => commentEl?.querySelector('.comment_name img, .comment_author img, img.club_logo, img[src*="club_logos"]') || null;

const findHiddenCommentsAction = (postEl) => postEl?.querySelector(
    '.hidden_comments_link .faux_link, .hidden_comments_link [onclick], .hidden_comments_link a[href], .hidden_comments_link, .comments_header .faux_link, .comments_header [onclick], .comments_header a[href], .comments_count [onclick], .comments_count a[href], .comments_count'
) || null;

const getFeedTotalCommentCount = (postEl) => {
    const directCount = postEl?.querySelectorAll('.comments .comment_holder .comment_text, .comments .comment .comment_text')?.length || 0;
    const summaryText = clean(postEl?.querySelector('.hidden_comments_link, .comments_header, .comments_count')?.textContent || '');
    const summaryCount = Number(summaryText.match(/(\d+)/)?.[1] || 0);
    return Math.max(directCount, summaryCount, 0);
};

const getFeedCommentBodyHtml = (commentEl) => {
    const bodySource = commentEl?.querySelector('.comment_text');
    if (!bodySource) {
        return `<div class="tmvu-home-feed-comment-body"><div>${escapeHtml(clean(commentEl?.textContent || ''))}</div></div>`;
    }

    const bodyClone = bodySource.cloneNode(true);
    const timeNode = bodyClone.querySelector('.comment_time');
    const timeText = normalizeFeedTime(commentEl?.querySelector('.comment_time')?.textContent || timeNode?.textContent || '');
    if (timeNode) timeNode.remove();

    const contentHtml = bodyClone.innerHTML.trim();
    const wrappedContent = /^<div[\s>]/i.test(contentHtml) ? contentHtml : `<div>${contentHtml}</div>`;

    return `<div class="tmvu-home-feed-comment-body">${timeText ? `<div class="tmvu-home-feed-comment-time" style="float: right;">${escapeHtml(timeText)}</div>` : ''}${wrappedContent}</div>`;
};

const parseFeedComments = (postEl) => Array.from(postEl.querySelectorAll('.comments .comment_holder, .comments .comment'))
    .filter((commentEl) => commentEl.querySelector('.comment_text'))
    .map((commentEl) => {
        const authorAnchor = findFeedCommentAuthorAnchor(commentEl);
        const authorHref = authorAnchor?.getAttribute('href') || '';
        const clubId = extractClubIdFromHref(authorHref);
        const preferredLogo = resolvePreferredFeedLogo(findFeedCommentLogo(commentEl)?.getAttribute('src') || '', clubId);
        return {
            authorName: clean(authorAnchor?.textContent || ''),
            authorHref,
            authorLogoSrc: preferredLogo.src || getClubLogoFromHref(authorHref),
            authorLogoFallbackSrc: preferredLogo.fallbackSrc || '',
            time: normalizeFeedTime(commentEl.querySelector('.comment_time')?.textContent || ''),
            bodyHtml: getFeedCommentBodyHtml(commentEl),
        };
    });

const parsePositiveCount = (value) => {
    const match = String(value || '').match(/\+\s*(\d+)/);
    return match ? Number(match[1]) || 0 : 0;
};

const findFeedLikeSummaryAction = (postEl) => postEl?.querySelector('.feed_like .faux_link, .feed_like [onclick], .feed_like a[href]') || null;

const findFeedAuthorAnchor = (postEl) => postEl?.querySelector('.post_profile_name a, .post_profile a[href], .post_profile_name, .post_profile') || null;

const findFeedBodyClubAnchor = (postEl) => postEl?.querySelector('.post_full_text a[href*="/club/"], .post_text a[href*="/club/"]') || null;

const findFeedProfileLogo = (postEl) => postEl?.querySelector('.post_profile img, .post_profile_image img, .post_profile_pic img, img.club_logo') || null;

const getFeedBodyHtml = (postEl) => {
    const bodySource = postEl?.querySelector('.post_full_text, .post_text');
    if (!bodySource) return '';

    const bodyClone = bodySource.cloneNode(true);
    bodyClone.querySelectorAll('.post_time, .post_profile_name, .post_profile, .feed_like, .hover_options').forEach((node) => node.remove());
    return bodyClone.innerHTML || '';
};

const getFeedAuthorName = (postEl) => {
    const anchor = findFeedAuthorAnchor(postEl);
    const bodyAnchor = findFeedBodyClubAnchor(postEl);
    const logo = findFeedProfileLogo(postEl);
    const directText = clean(anchor?.textContent || '');
    if (directText) return directText;

    const bodyAnchorText = clean(bodyAnchor?.textContent || '');
    if (bodyAnchorText) return bodyAnchorText;

    const titleText = clean(anchor?.getAttribute?.('title') || '');
    if (titleText) return titleText;

    const imgAlt = clean(logo?.getAttribute?.('alt') || '');
    if (imgAlt) return imgAlt;

    const imgTitle = clean(logo?.getAttribute?.('title') || '');
    if (imgTitle) return imgTitle;

    const bodyText = clean(postEl?.querySelector('.post_full_text, .post_text')?.textContent || '');
    const mentionMatch = bodyText.match(/^@([^\n]+?)\s(?:has|put|played|signed|won|lost|drew|sold|bought)\b/i);
    if (mentionMatch?.[1]) return clean(mentionMatch[1]);

    return '';
};

const getFeedAuthorHref = (postEl) => findFeedAuthorAnchor(postEl)?.getAttribute?.('href') || findFeedBodyClubAnchor(postEl)?.getAttribute?.('href') || '';

const parseNativeFeedPost = (postEl) => {
    const postId = clean(postEl.id || '').replace(/^feed_post/, '');
    const authorHref = getFeedAuthorHref(postEl);
    const preferredLogo = resolvePreferredFeedLogo(findFeedProfileLogo(postEl)?.getAttribute('src') || '', extractClubIdFromHref(authorHref));
    return {
        id: postId,
        authorName: getFeedAuthorName(postEl),
        authorHref,
        authorLogoSrc: preferredLogo.src,
        authorLogoFallbackSrc: preferredLogo.fallbackSrc || '',
        time: normalizeFeedTime(postEl.querySelector('.post_time')?.textContent || ''),
        bodyHtml: getFeedBodyHtml(postEl),
        likeText: clean(postEl.querySelector('.feed_like')?.textContent || ''),
        commentText: clean(postEl.querySelector('.hidden_comments_link, .comments_header, .comments_count')?.textContent || ''),
        totalCommentCount: getFeedTotalCommentCount(postEl),
        hiddenCommentsAction: findHiddenCommentsAction(postEl),
        likeCount: parsePositiveCount(postEl.querySelector('.feed_like')?.textContent || ''),
        likeSummaryEl: findFeedLikeSummaryAction(postEl),
        comments: parseFeedComments(postEl),
        isSimilarPost: false,
        sourceEl: postEl,
    };
};

export const queryVisibleNativeFeedPosts = (feedRoot) => Array.from(feedRoot?.querySelectorAll('.feed_post[id^="feed_post"]') || [])
    .filter((postEl) => isNativeFeedPostVisible(postEl, feedRoot));

export const findNativeHomeFeedAction = (postEl, action) => {
    if (action === 'like') return postEl.querySelector('.hover_options .like_icon[onclick*="feed_post_like"]');
    if (action === 'comment') return Array.from(postEl.querySelectorAll('.hover_options .faux_link')).find((element) => clean(element.textContent).toLowerCase() === 'comment');
    if (action === 'reply') return Array.from(postEl.querySelectorAll('.hover_options .faux_link')).find((element) => clean(element.textContent).toLowerCase() === 'reply to author');
    if (action === 'link') return postEl.querySelector('.post_option[onclick*="feed_pop_link_post"]');
    if (action === 'mute') return postEl.querySelector('.post_option.mute[onclick*="feed_post_mute"], .post_option.unmute[onclick*="feed_post_mute"]');
    return null;
};

export const findNativeHomeFeedCommentControls = (postEl) => {
    const nativeBox = postEl?.querySelector('.feed_comment_box');
    if (!nativeBox) return null;

    const textarea = nativeBox.querySelector('textarea, textarea[id^="comment"]');
    const submitInner = nativeBox.querySelector('.button_border, button, input[type="submit"], input[type="button"]');
    const submitButton = submitInner?.closest('.button') || submitInner;
    return { nativeBox, textarea, submitButton };
};

export const buildNativeHomeFeedPostMap = (feedRoot) => new Map(queryVisibleNativeFeedPosts(feedRoot).map((postEl) => {
    const post = parseNativeFeedPost(postEl);
    return [post.id, post];
}));
