const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeFeedTime = (value) => clean(String(value || '').replace(/\s*\+\d+\s*$/g, ''));

const extractFeedPlayerIds = (text) => Array.from(String(text || '').matchAll(/\[player=(\d+)\]/g), (match) => clean(match[1])).filter(Boolean);

const extractFeedClubIds = (item) => {
    const textIds = Array.from(String(item?.text || '').matchAll(/@(\d+)/g), (match) => clean(match[1]));
    const attributeIds = Array.isArray(item?.attributes?.club_ids) ? item.attributes.club_ids.map(clean) : [];
    return [...textIds, ...attributeIds].filter(Boolean);
};

const normalizeFeedNames = (payload) => {
    const players = Array.isArray(payload?.players) ? payload.players : [];
    const clubs = Array.isArray(payload?.clubs) ? payload.clubs : [];
    const playerMap = new Map();
    const clubMap = new Map();

    players.forEach((player) => {
        const id = clean(player?.id);
        if (!id) return;
        playerMap.set(id, clean(player?.name) || `#${id}`);
    });

    clubs.forEach((club) => {
        const id = clean(club?.id || club?.club_id);
        const name = clean(club?.name || club?.club_name);
        if (!id || !name) return;
        clubMap.set(id, name);
    });

    return { playerMap, clubMap };
};

const resolveFeedLinkTarget = (target) => {
    const raw = clean(target);
    if (!raw) return '';
    if (raw.startsWith('/')) return raw;
    if (/^league;/i.test(raw)) return '/league/';
    return '';
};

const buildFeedLinkHtml = (target, label) => {
    const safeLabel = escapeHtml(clean(label) || target);
    const href = resolveFeedLinkTarget(target);
    if (!href) return safeLabel;
    return `<a href="${escapeHtml(href)}">${safeLabel}</a>`;
};

const formatFeedMoney = (value) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return escapeHtml(String(value || ''));
    return escapeHtml(amount.toLocaleString('en-US'));
};

const renderFeedFlagHtml = (country) => {
    const normalized = clean(country).toLowerCase();
    if (!normalized) return '';
    if (typeof window !== 'undefined' && typeof window.get_flag === 'function') {
        return window.get_flag(normalized);
    }
    return `<span class="tmvu-feed-flag-fallback">${escapeHtml(normalized.toUpperCase())}</span>`;
};

const renderPotentialStarsHtml = (value) => {
    const raw = Number(value);
    const normalized = Number.isFinite(raw) ? Math.max(0, Math.min(10, raw)) : 0;
    const fullStars = Math.max(0, Math.min(5, Math.floor(normalized / 2)));
    let html = '<span class="tmvu-feed-stars" aria-label="Potential">';
    for (let index = 0; index < fullStars; index += 1) html += '<span class="tmvu-feed-stars-full">★</span>';
    for (let index = fullStars; index < 5; index += 1) html += '<span class="tmvu-feed-stars-empty">★</span>';
    html += '</span>';
    return html;
};

const replaceFeedClubMentions = (content, clubMap, storeReplacement) => content.replace(/(^|[^\w])([@#])(\d+)\b/g, (match, prefix, _marker, clubId) => {
    const id = clean(clubId);
    const label = clubMap.get(id) || `#${id}`;
    const linkHtml = `<a href="/club/${escapeHtml(id)}/">${escapeHtml(label)}</a>`;
    return `${prefix}${storeReplacement(linkHtml)}`;
});

const renderFeedTextHtml = (text, { playerMap = new Map(), clubMap = new Map() } = {}) => {
    const replacements = [];
    let content = String(text || '');

    const storeReplacement = (html) => {
        const token = `__TM_HOME_FEED_TOKEN_${replacements.length}__`;
        replacements.push({ token, html });
        return token;
    };

    content = content.replace(/\[link=([^\]]+)\]([\s\S]*?)\[\/link\]/g, (_, target, label) => storeReplacement(buildFeedLinkHtml(target, label)));
    content = content.replace(/\[player=(\d+)\]/g, (_, playerId) => {
        const id = clean(playerId);
        const label = playerMap.get(id) || `#${id}`;
        return storeReplacement(`<a href="/players/${escapeHtml(id)}/">${escapeHtml(label)}</a>`);
    });
    content = content.replace(/\[potential_stars=(\d+)\]/g, (_, stars) => storeReplacement(renderPotentialStarsHtml(stars)));
    content = content.replace(/\[flag=([a-z]{2})\]/ig, (_, country) => storeReplacement(renderFeedFlagHtml(country)));
    content = content.replace(/\[money=(\d+)\]/g, (_, amount) => storeReplacement(formatFeedMoney(amount)));
    content = replaceFeedClubMentions(content, clubMap, storeReplacement);

    let html = escapeHtml(content).replace(/\n/g, '<br>');
    replacements.forEach((entry) => {
        html = html.replaceAll(entry.token, entry.html);
    });
    return html;
};

const getDetailedFeedItems = (payload) => Array.isArray(payload?.feed) ? payload.feed : [];

const collectDetailedFeedNameIds = (items) => {
    const flatItems = items.flatMap((item) => [item, ...(Array.isArray(item?.sub_entries) ? item.sub_entries : [])]);
    const playerIds = [...new Set(flatItems.flatMap((item) => extractFeedPlayerIds(item?.text)))];
    const clubIds = [...new Set([
        ...flatItems.flatMap((item) => extractFeedClubIds(item)),
        ...flatItems.flatMap((item) => Array.from(String(item?.text || '').matchAll(/#(\d+)/g), (match) => clean(match[1]))),
        ...flatItems.flatMap((item) => Array.isArray(item?.comments) ? item.comments.map((comment) => clean(comment?.club_id)) : []),
    ].filter(Boolean))];
    return { playerIds, clubIds };
};

const wrapFeedHtmlBlock = (html) => /^<div[\s>]/i.test(String(html || '').trim()) ? html : `<div>${html}</div>`;

const getClubNameFromMaps = (clubId, clubMap) => {
    const id = clean(clubId);
    if (!id) return '';
    return clubMap.get(id) || `#${id}`;
};

const getClubLogoFromId = (clubId) => {
    const id = clean(clubId);
    return id ? `/pics/club_logos/${id}.png` : '';
};

const buildApiFeedComment = (comment, nameMaps) => {
    const clubId = clean(comment?.club_id);
    const timeText = normalizeFeedTime(comment?.time || '');
    const contentHtml = wrapFeedHtmlBlock(renderFeedTextHtml(comment?.text, nameMaps));
    return {
        authorName: getClubNameFromMaps(clubId, nameMaps.clubMap),
        authorHref: clubId ? `/club/${clubId}/` : '',
        authorLogoSrc: getClubLogoFromId(clubId),
        authorLogoFallbackSrc: '',
        time: timeText,
        bodyHtml: `<div class="tmvu-home-feed-comment-body">${timeText ? `<div class="tmvu-home-feed-comment-time" style="float: right;">${escapeHtml(timeText)}</div>` : ''}${contentHtml}</div>`,
    };
};

export const buildHomeFeedModel = async ({ payload, nativePostMap = new Map(), fetchFeedNames }) => {
    const items = getDetailedFeedItems(payload);
    if (!items.length) return null;

    const { playerIds, clubIds } = collectDetailedFeedNameIds(items);
    const payloadClubIds = Array.isArray(payload?.ids) ? payload.ids.map(clean).filter(Boolean) : [];
    const resolvedClubIds = [...new Set([...clubIds, ...payloadClubIds])];
    const namesPayload = playerIds.length || resolvedClubIds.length
        ? await fetchFeedNames({ playerIds, clubIds: resolvedClubIds })
        : null;
    const nameMaps = normalizeFeedNames(namesPayload);

    const buildPost = (item, { isSimilarPost = false } = {}) => {
        const postId = clean(item?.id);
        const nativePost = nativePostMap.get(postId) || null;
        const clubId = clean(item?.attributes?.club_ids?.[0]);
        const comments = Array.isArray(item?.comments)
            ? item.comments.map((comment) => buildApiFeedComment(comment, nameMaps))
            : (nativePost?.comments || []);
        const similarEntries = Array.isArray(item?.sub_entries)
            ? item.sub_entries.map((entry) => buildPost(entry, { isSimilarPost: true }))
            : [];

        return {
            id: postId,
            authorName: nativePost?.authorName || getClubNameFromMaps(clubId, nameMaps.clubMap),
            authorHref: nativePost?.authorHref || (clubId ? `/club/${clubId}/` : ''),
            authorLogoSrc: nativePost?.authorLogoSrc || getClubLogoFromId(clubId),
            authorLogoFallbackSrc: nativePost?.authorLogoFallbackSrc || '',
            time: normalizeFeedTime(item?.time || item?.full_time || nativePost?.time || ''),
            bodyHtml: renderFeedTextHtml(item?.text, nameMaps) || nativePost?.bodyHtml || '',
            likeText: nativePost?.likeText || '',
            commentText: nativePost?.commentText || '',
            totalCommentCount: Math.max(Array.isArray(item?.comments) ? item.comments.length : 0, nativePost?.totalCommentCount || 0),
            hiddenCommentsAction: nativePost?.hiddenCommentsAction || null,
            likeCount: Number(item?.likes) || nativePost?.likeCount || 0,
            likeSummaryEl: nativePost?.likeSummaryEl || null,
            comments,
            isSimilarPost,
            similarEntries,
            sourceEl: nativePost?.sourceEl || null,
        };
    };

    return {
        kind: 'api',
        topPosts: items.map((item) => buildPost(item)),
        lastPost: clean(items[items.length - 1]?.id),
        canLoadMore: items.length > 0,
    };
};