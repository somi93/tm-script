import { TmAppShellHeader } from './tm-app-shell-header.js';
import { TmUI } from './tm-ui.js';
import { TmMessagesModel } from '../../models/messages.js';

const STYLE_ID = 'tmvu-feed-menu-styles';

function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const buttonHtml = (opts) => TmUI.button(opts).outerHTML;

function injectFeedStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-feed-item {
            width: 100%;
            display: block;
            text-align: left;
            padding: var(--tmu-space-md);
            border: 1px solid transparent;
            border-bottom-color: var(--tmu-border-soft-alpha);
            background: var(--tmu-surface-item-dark);
            cursor: pointer;
        }

        .tmvu-feed-item + .tmvu-feed-item {
            margin-top: var(--tmu-space-sm);
        }

        .tmvu-feed-item:hover {
            border-color: var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-success-fill-faint);
        }

        .tmvu-feed-item.is-unread {
            border-color: var(--tmu-border-soft-alpha-strong);
            background: var(--tmu-success-fill-faint);
        }

        .tmvu-feed-item-text {
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
            line-height: 1.45;
            word-break: break-word;
        }

        .tmvu-feed-item-text a {
            color: var(--tmu-text-inverse);
            text-decoration: none;
        }

        .tmvu-feed-item-text a:hover {
            text-decoration: underline;
        }

        .tmvu-feed-flag {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 20px;
            height: 16px;
            margin-right: var(--tmu-space-xs);
            padding: 0 var(--tmu-space-xs);
            border-radius: 999px;
            background: var(--tmu-border-contrast);
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-2xs);
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            vertical-align: baseline;
        }

        .tmvu-feed-item-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--tmu-space-sm);
            margin-top: var(--tmu-space-sm);
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
        }

        .tmvu-feed-item-comments {
            color: var(--tmu-text-muted);
        }
    `;

    document.head.appendChild(style);
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

function extractFeedPlayerIds(text) {
    return Array.from(String(text || '').matchAll(/\[player=(\d+)\]/g), match => cleanText(match[1])).filter(Boolean);
}

function extractFeedClubIds(item) {
    const textIds = Array.from(String(item?.text || '').matchAll(/@(\d+)/g), match => cleanText(match[1]));
    const attributeIds = Array.isArray(item?.attributes?.club_ids) ? item.attributes.club_ids.map(cleanText) : [];
    return [...textIds, ...attributeIds].filter(Boolean);
}

function normalizeFeedNames(payload) {
    const players = Array.isArray(payload?.players) ? payload.players : [];
    const clubs = Array.isArray(payload?.clubs) ? payload.clubs : [];
    const playerMap = new Map();
    const clubMap = new Map();

    players.forEach(player => {
        const id = cleanText(player?.id);
        if (!id) return;
        playerMap.set(id, cleanText(player?.name) || `#${id}`);
    });

    clubs.forEach(club => {
        const id = cleanText(club?.id || club?.club_id);
        const name = cleanText(club?.name || club?.club_name);
        if (!id || !name) return;
        clubMap.set(id, name);
    });

    return { playerMap, clubMap };
}

function resolveFeedLinkTarget(target) {
    const raw = cleanText(target);
    if (!raw) return '';
    if (raw.startsWith('/')) return raw;
    if (/^league;/i.test(raw)) return '/league/';
    return '';
}

function buildFeedLinkHtml(target, label) {
    const safeLabel = escapeHtml(cleanText(label) || target);
    const href = resolveFeedLinkTarget(target);
    if (!href) return safeLabel;
    return `<a href="${escapeHtml(href)}">${safeLabel}</a>`;
}

function formatFeedMoney(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return escapeHtml(String(value || ''));
    return escapeHtml(amount.toLocaleString('en-US'));
}

function renderFeedTextHtml(text, { playerMap = new Map(), clubMap = new Map() } = {}) {
    const replacements = [];
    let content = String(text || '');

    const storeReplacement = (html) => {
        const token = `__TM_FEED_TOKEN_${replacements.length}__`;
        replacements.push({ token, html });
        return token;
    };

    content = content.replace(/\[link=([^\]]+)\]([\s\S]*?)\[\/link\]/g, (_, target, label) => storeReplacement(buildFeedLinkHtml(target, label)));
    content = content.replace(/\[player=(\d+)\]/g, (_, playerId) => {
        const id = cleanText(playerId);
        const label = playerMap.get(id) || `#${id}`;
        return storeReplacement(`<a href="/players/${escapeHtml(id)}/">${escapeHtml(label)}</a>`);
    });
    content = content.replace(/\[flag=([a-z]{2})\]/ig, (_, country) => storeReplacement(`<span class="tmvu-feed-flag">${escapeHtml(country.toUpperCase())}</span>`));
    content = content.replace(/\[money=(\d+)\]/g, (_, amount) => storeReplacement(formatFeedMoney(amount)));
    content = content.replace(/@(\d+)/g, (_, clubId) => {
        const id = cleanText(clubId);
        const label = clubMap.get(id) || `#${id}`;
        return storeReplacement(`<a href="/club/${escapeHtml(id)}/">${escapeHtml(label)}</a>`);
    });

    let html = escapeHtml(content).replace(/\n/g, '<br>');
    replacements.forEach(entry => {
        html = html.replaceAll(entry.token, entry.html);
    });

    return html;
}

function getFeedPrimaryHref(item) {
    const feedId = cleanText(item?.id);
    if (feedId) return `/home/#/feed/${feedId}/`;
    return '/home/';
}

function navigateToFeedHref(href) {
    const target = cleanText(href) || '/home/';

    try {
        const url = new URL(target, window.location.origin);
        const nextHref = `${url.pathname}${url.hash}`;
        const currentPath = cleanText(window.location.pathname).toLowerCase();
        const targetPath = cleanText(url.pathname).toLowerCase();

        if (currentPath === targetPath) {
            window.location.href = nextHref;
            window.setTimeout(() => window.location.reload(), 0);
            return;
        }

        window.location.assign(nextHref);
    } catch {
        window.location.assign(target);
    }
}

async function normalizeFeedItems(payload) {
    const items = Array.isArray(payload?.buddy_feed) ? payload.buddy_feed.slice(0, 5) : [];
    if (!items.length) return [];

    const playerIds = [...new Set(items.flatMap(item => extractFeedPlayerIds(item?.text)))];
    const clubIds = [...new Set(items.flatMap(item => extractFeedClubIds(item)))];
    const namesPayload = playerIds.length || clubIds.length
        ? await TmMessagesModel.fetchFeedNames({ playerIds, clubIds })
        : null;
    const nameMaps = normalizeFeedNames(namesPayload);

    return items.map(item => {
        const comments = Array.isArray(item?.comments) ? item.comments : [];
        return {
            id: cleanText(item?.id),
            href: getFeedPrimaryHref(item),
            html: renderFeedTextHtml(item?.text, nameMaps),
            time: cleanText(item?.time),
            longTime: cleanText(item?.full_time || item?.time),
            commentCount: comments.length,
            unread: item?.is_read === false || item?.is_read === 'false' || item?.is_read === 0,
        };
    });
}

// ─── Renderers ────────────────────────────────────────────────────────────────

function setFeedListPlaceholder(feedState, copy) {
    if (!feedState?.listEl) return;
    feedState.listEl.innerHTML = TmAppShellHeader.renderPmPlaceholder(copy);
}

function renderFeedItems(items = []) {
    if (!Array.isArray(items) || !items.length) {
        return TmAppShellHeader.renderPmPlaceholder('No recent feed items found.');
    }

    return items.map(item => buttonHtml({
        slot: `
            <div class="tmvu-feed-item-text">${item.html || ''}</div>
            <div class="tmvu-feed-item-meta">
                <span class="tmvu-feed-item-time" title="${escapeHtml(item.longTime || item.time || '')}">${escapeHtml(item.time || '')}</span>
                <span class="tmvu-feed-item-comments">${item.commentCount ? `${item.commentCount} comments` : 'No comments'}</span>
            </div>
        `,
        color: 'secondary',
        size: 'sm',
        cls: `tmvu-feed-item${item.unread ? ' is-unread' : ''}`,
        attrs: {
            'data-feed-item': true,
            'data-feed-href': escapeHtml(item.href || '/home/'),
        },
    })).join('');
}

// ─── Menu open/close ──────────────────────────────────────────────────────────

function openFeedMenu(feedState) {
    if (!feedState?.menuEl || !feedState?.triggerEl) return;
    feedState.isOpen = true;
    feedState.rootEl?.classList.add('is-open');
    feedState.menuEl.hidden = false;
    feedState.triggerEl.setAttribute('aria-expanded', 'true');
}

function closeFeedMenu(feedState) {
    if (!feedState?.menuEl || !feedState?.triggerEl) return;
    feedState.isOpen = false;
    feedState.rootEl?.classList.remove('is-open');
    feedState.menuEl.hidden = true;
    feedState.triggerEl.setAttribute('aria-expanded', 'false');
}

async function loadFeedNotifications(feedState) {
    if (!feedState || feedState.isLoading) return;

    feedState.isLoading = true;
    feedState.rootEl?.classList.add('is-loading');
    setFeedListPlaceholder(feedState, 'Loading notifications...');

    try {
        const response = await TmMessagesModel.fetchTopUserFeed();
        const items = await normalizeFeedItems(response);
        feedState.items = items;

        if (items.length) {
            feedState.listEl.innerHTML = renderFeedItems(items);
        } else if (response) {
            setFeedListPlaceholder(feedState, 'No recent notifications found.');
        } else {
            setFeedListPlaceholder(feedState, 'Unable to load notifications right now.');
        }
    } finally {
        feedState.isLoading = false;
        feedState.rootEl?.classList.remove('is-loading');
    }
}

// ─── Bind ─────────────────────────────────────────────────────────────────────

export function bindFeedMenu(feedState) {
    injectFeedStyles();

    const rootEl = document.querySelector('[data-feed-root]');
    if (!rootEl) return null;

    Object.assign(feedState, {
        rootEl,
        triggerEl: rootEl.querySelector('[data-feed-trigger]'),
        menuEl: rootEl.querySelector('[data-feed-menu]'),
        listEl: rootEl.querySelector('[data-feed-list]'),
        countEl: rootEl.querySelector('[data-feed-count]'),
        summaryEl: rootEl.querySelector('[data-feed-summary]'),
        isOpen: false,
    });

    if (rootEl.dataset.tmvuFeedMenuBound === '1') {
        return feedState;
    }
    rootEl.dataset.tmvuFeedMenuBound = '1';

    feedState.triggerEl?.addEventListener('click', async event => {
        event.preventDefault();
        event.stopPropagation();
        if (feedState.isOpen) {
            closeFeedMenu(feedState);
            return;
        }
        openFeedMenu(feedState);
        await loadFeedNotifications(feedState);
    });

    if (!feedState.__documentBindingsAttached) {
        document.addEventListener('click', event => {
            if (!feedState.isOpen || !feedState.rootEl) return;
            if (feedState.rootEl.contains(event.target)) return;
            closeFeedMenu(feedState);
        });

        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || !feedState.isOpen) return;
            closeFeedMenu(feedState);
        });
        feedState.__documentBindingsAttached = true;
    }

    feedState.listEl?.addEventListener('click', event => {
        const feedButton = event.target.closest('[data-feed-item]');
        if (!feedButton) return;
        event.preventDefault();
        event.stopPropagation();
        closeFeedMenu(feedState);
        navigateToFeedHref(feedButton.getAttribute('data-feed-href') || '/home/');
    });

    return feedState;
}
