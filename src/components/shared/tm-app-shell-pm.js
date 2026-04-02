import { TmAppShellHeader } from './tm-app-shell-header.js';
import { TmUI } from './tm-ui.js';
import { TmApi } from '../../services/index.js';

const STYLE_ID = 'tmvu-shell-pm-styles';

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

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-pm-wrap,
        .tmvu-feed-wrap {
            position: relative;
        }

        .tmvu-metric-button {
            cursor: pointer;
            position: relative;
        }

        .tmvu-metric-button:hover,
        .tmvu-pm-wrap.is-open .tmvu-metric-button,
        .tmvu-feed-wrap.is-open .tmvu-metric-button {
            background: var(--tmu-success-fill-soft);
            border-color: var(--tmu-border-embedded);
        }

        .tmvu-pm-menu[hidden] {
            display: none !important;
        }

        .tmvu-pm-menu {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            width: min(360px, calc(100vw - 24px));
            max-height: 420px;
            display: flex;
            flex-direction: column;
            border: 1px solid var(--tmu-border-input);
            background: linear-gradient(180deg, var(--tmu-surface-panel), var(--tmu-surface-dark-muted));
            box-shadow: 0 16px 32px var(--tmu-shadow-elev);
            z-index: 10020;
        }

        .tmvu-pm-menu-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            padding: 12px 12px 10px;
            border-bottom: 1px solid var(--tmu-border-soft-alpha-strong);
        }

        .tmvu-pm-menu-head strong {
            display: block;
            font-size: 13px;
            color: var(--tmu-text-inverse);
        }

        .tmvu-pm-menu-head span {
            display: block;
            margin-top: 3px;
            font-size: 11px;
            color: var(--tmu-text-muted);
        }

        .tmvu-pm-compose {
            white-space: nowrap;
        }

        .tmvu-pm-list {
            overflow-y: auto;
            padding: 6px;
        }

        .tmvu-pm-menu-foot {
            display: grid;
            gap: 10px;
            padding: 0 12px 12px;
            border-top: 1px solid var(--tmu-border-soft-alpha);
        }

        .tmvu-pm-view-all {
            width: 100%;
            justify-content: center;
        }

        .tmvu-pm-placeholder {
            padding: 14px 10px;
            color: var(--tmu-text-muted);
            font-size: 12px;
        }

        .tmvu-pm-item {
            width: 100%;
            display: block;
            text-align: left;
            padding: 10px;
            border: 1px solid transparent;
            border-bottom-color: var(--tmu-border-soft-alpha);
            background: var(--tmu-surface-item-dark);
            cursor: pointer;
        }

        .tmvu-pm-item + .tmvu-pm-item {
            margin-top: 6px;
        }

        .tmvu-pm-item:hover {
            border-color: var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-success-fill-faint);
        }

        .tmvu-pm-item.is-unread {
            border-color: var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-success-fill-faint);
        }

        .tmvu-pm-item-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 8px;
        }

        .tmvu-pm-item-sender {
            font-size: 12px;
            color: var(--tmu-text-inverse);
        }

        .tmvu-pm-item-time {
            font-size: 10px;
            color: var(--tmu-text-muted);
            white-space: nowrap;
        }

        .tmvu-pm-item-subject {
            margin-top: 4px;
            font-size: 12px;
            color: var(--tmu-text-strong);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmvu-feed-item {
            width: 100%;
            display: block;
            text-align: left;
            padding: 10px;
            border: 1px solid transparent;
            border-bottom-color: var(--tmu-border-soft-alpha);
            background: var(--tmu-surface-item-dark);
            cursor: pointer;
        }

        .tmvu-feed-item + .tmvu-feed-item {
            margin-top: 6px;
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
            font-size: 12px;
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
            margin-right: 4px;
            padding: 0 4px;
            border-radius: 999px;
            background: var(--tmu-border-contrast);
            color: var(--tmu-text-main);
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            vertical-align: baseline;
        }

        .tmvu-feed-item-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-top: 7px;
            color: var(--tmu-text-muted);
            font-size: 10px;
        }

        .tmvu-feed-item-comments {
            color: var(--tmu-text-muted);
        }

        body.tmvu-pm-dialog-open {
            overflow: hidden;
        }

        .tmvu-pm-dialog-overlay {
            position: fixed;
            inset: 0;
            z-index: 10060;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: var(--tmu-surface-overlay-strong);
            backdrop-filter: blur(4px);
        }

        .tmvu-pm-dialog {
            width: min(1120px, calc(100vw - 24px));
            max-height: calc(100vh - 24px);
            display: flex;
            flex-direction: column;
            background: linear-gradient(180deg, var(--tmu-surface-panel), var(--tmu-surface-dark-muted) 70%);
            border: 1px solid var(--tmu-border-success);
            box-shadow: 0 28px 80px var(--tmu-shadow-panel);
            color: var(--tmu-text-main);
            overflow: hidden;
        }

        .tmvu-pm-dialog-head {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            padding: 18px 18px 12px;
            border-bottom: 1px solid var(--tmu-border-soft-alpha-strong);
        }

        .tmvu-pm-dialog-kicker {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--tmu-text-panel-label);
        }

        .tmvu-pm-dialog-title {
            margin: 4px 0 0;
            font-size: 20px;
            line-height: 1.15;
            color: var(--tmu-text-inverse);
        }

        .tmvu-pm-dialog-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .tmvu-pm-dialog-tabs {
            padding: 0 18px 0;
        }

        .tmvu-pm-dialog-tabs-bar {
            border-radius: 8px 8px 0 0;
        }

        .tmvu-pm-dialog-body {
            min-height: 0;
            flex: 1 1 auto;
            display: grid;
            grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
            gap: 0;
            border-top: 1px solid var(--tmu-border-soft-alpha-strong);
        }

        .tmvu-pm-dialog-list,
        .tmvu-pm-dialog-detail {
            min-height: 0;
            overflow-y: auto;
            padding: 14px;
        }

        .tmvu-pm-dialog-list {
            border-right: 1px solid var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-surface-dark-mid);
        }

        .tmvu-pm-dialog-row {
            width: 100%;
            display: block;
            text-align: left;
            padding: 11px 12px;
            margin-bottom: 8px;
            background: var(--tmu-surface-item-dark);
            border: 1px solid var(--tmu-border-soft-alpha);
            color: inherit;
            cursor: pointer;
        }

        .tmvu-pm-dialog-row:hover,
        .tmvu-pm-dialog-row.is-active {
            border-color: var(--tmu-border-soft-alpha-strong);
            background: var(--tmu-success-fill-soft);
        }

        .tmvu-pm-dialog-row.is-unread {
            border-left: 3px solid var(--tmu-text-panel-label);
            padding-left: 10px;
        }

        .tmvu-pm-dialog-row-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 8px;
        }

        .tmvu-pm-dialog-row-sender {
            color: var(--tmu-text-inverse);
            font-size: 12px;
        }

        .tmvu-pm-dialog-row-time {
            color: var(--tmu-text-muted);
            font-size: 10px;
            white-space: nowrap;
        }

        .tmvu-pm-dialog-row-subject {
            margin-top: 5px;
            color: var(--tmu-text-strong);
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmvu-pm-thread-item {
            padding: 14px 16px;
            background: var(--tmu-surface-item-dark);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
        }

        .tmvu-pm-thread-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 12px;
        }

        .tmvu-pm-thread-action {
            flex: 0 0 auto;
        }

        .tmvu-pm-thread-list {
            display: flex;
            flex-direction: column;
        }

        .tmvu-pm-reply-box {
            margin-top: 14px;
            padding: 14px;
            background: var(--tmu-surface-item-dark);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
        }

        .tmvu-pm-reply-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 10px;
        }

        .tmvu-pm-reply-head strong {
            color: var(--tmu-text-strong);
            font-size: 12px;
        }

        .tmvu-pm-reply-head span {
            color: var(--tmu-text-muted);
            font-size: 11px;
        }

        .tmvu-pm-reply-textarea {
            width: 100%;
            min-height: 118px;
            resize: vertical;
            padding: 10px 12px;
            border: 1px solid var(--tmu-border-soft-alpha-strong);
            background: var(--tmu-surface-input-dark);
            color: var(--tmu-text-main);
            font: inherit;
            line-height: 1.55;
        }

        .tmvu-pm-reply-textarea:focus {
            outline: none;
            border-color: var(--tmu-border-input-overlay);
            box-shadow: 0 0 0 1px var(--tmu-border-soft-alpha-mid);
        }

        .tmvu-pm-reply-foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            margin-top: 10px;
        }

        .tmvu-pm-reply-status {
            min-height: 18px;
            color: var(--tmu-text-muted);
            font-size: 11px;
        }

        .tmvu-pm-reply-status.is-error {
            color: var(--tmu-danger);
        }

        .tmvu-pm-reply-status.is-success {
            color: var(--tmu-success);
        }

        .tmvu-pm-reply-status.is-muted {
            color: var(--tmu-text-muted);
        }

        .tmvu-pm-thread-item + .tmvu-pm-thread-item {
            margin-top: 12px;
        }

        .tmvu-pm-thread-item.is-own {
            background: var(--tmu-success-fill-faint);
            border-color: var(--tmu-border-soft-alpha-strong);
        }

        .tmvu-pm-thread-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 10px;
        }

        .tmvu-pm-thread-sender {
            color: var(--tmu-text-strong);
            font-size: 13px;
        }

        .tmvu-pm-thread-time {
            color: var(--tmu-text-muted);
            font-size: 11px;
        }

        .tmvu-pm-thread-body {
            color: var(--tmu-text-main);
            font-size: 13px;
            line-height: 1.6;
            word-break: break-word;
        }

        .tmvu-pm-thread-body a {
            color: var(--tmu-text-main);
        }

        .tmvu-pm-thread-body img {
            vertical-align: middle;
        }

        @media (max-width: 760px) {
            .tmvu-pm-menu {
                right: -6px;
                width: min(320px, calc(100vw - 16px));
            }

            .tmvu-pm-dialog-overlay {
                padding: 10px;
            }

            .tmvu-pm-dialog {
                width: calc(100vw - 12px);
                max-height: calc(100vh - 12px);
            }

            .tmvu-pm-dialog-head {
                flex-direction: column;
                align-items: stretch;
            }

            .tmvu-pm-dialog-actions {
                justify-content: flex-end;
            }

            .tmvu-pm-dialog-body {
                grid-template-columns: 1fr;
            }

            .tmvu-pm-dialog-list {
                max-height: 38vh;
                border-right: none;
                border-bottom: 1px solid var(--tmu-border-soft-alpha-mid);
            }

            .tmvu-pm-reply-head,
            .tmvu-pm-reply-foot {
                flex-direction: column;
                align-items: stretch;
            }
        }
    `;

    document.head.appendChild(style);
}

function getTopUserInfoPmCount(topUserInfo, fallback = 0) {
    const count = Number(topUserInfo?.new_pms);
    return Number.isFinite(count) && count >= 0 ? count : fallback;
}

function getTopUserInfoFeedCount(topUserInfo, fallback = 0) {
    const count = Number(topUserInfo?.new_feed);
    if (Number.isFinite(count) && count >= 0) return count;
    return fallback;
}

function getConversationKey(message) {
    const conversationId = cleanText(message?.conversation_id);
    if (conversationId && conversationId !== '0') return conversationId;
    return cleanText(message?.id);
}

function isUnreadMessage(message) {
    const status = cleanText(message?.status).toLowerCase();
    const messageStatus = cleanText(message?.m_status);
    if (status) return status !== 'read';
    return messageStatus === '0';
}

function normalizePmConversationItems(payload) {
    const messages = Array.isArray(payload?.messages) ? payload.messages : [];
    const seen = new Set();
    const items = [];

    for (const message of messages) {
        const key = getConversationKey(message);
        if (!key || seen.has(key)) continue;
        seen.add(key);
        items.push({
            id: cleanText(message?.id),
            conversationId: key,
            senderName: cleanText(message?.sender_name) || 'Unknown sender',
            subject: cleanText(message?.subject) || '(No subject)',
            time: cleanText(message?.time),
            longTime: cleanText(message?.long_time || message?.time),
            unread: isUnreadMessage(message),
        });
        if (items.length >= 5) break;
    }

    return items;
}

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
        ? await TmApi.fetchFeedNames({ playerIds, clubIds })
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

function normalizePmFolderItems(payload, place = 'inbox') {
    const messages = Array.isArray(payload?.messages) ? payload.messages : [];

    return messages.map(message => ({
        id: cleanText(message?.id),
        conversationId: getConversationKey(message) || '0',
        senderName: cleanText(message?.sender_name) || 'Unknown sender',
        recipientName: cleanText(message?.recipient_name) || '',
        subject: cleanText(message?.subject) || '(No subject)',
        time: cleanText(message?.time),
        longTime: cleanText(message?.long_time || message?.time),
        unread: isUnreadMessage(message),
        place: cleanText(message?.place) || place,
    }));
}

function normalizePmThreadItems(payload) {
    const conversation = Array.isArray(payload?.conversation) ? payload.conversation : [];
    return [...conversation].reverse().map(message => ({
        id: cleanText(message?.id),
        conversationId: cleanText(message?.conversation_id) || '0',
        senderName: cleanText(message?.sender_name) || 'Unknown sender',
        senderId: cleanText(message?.sender_id),
        recipientName: cleanText(message?.recipient_name),
        recipientId: cleanText(message?.recipient_id),
        subject: cleanText(message?.subject_text || message?.subject) || '(No subject)',
        time: cleanText(message?.time),
        longTime: cleanText(message?.long_time || message?.time),
        messageHtml: String(message?.message || '').trim(),
        messageText: cleanText(message?.message_text),
    }));
}

function getPmThreadCacheKey(item) {
    const id = cleanText(item?.id);
    const conversationId = cleanText(item?.conversationId) || '0';
    return `${id}:${conversationId}`;
}

function renderPmDialogListItems(items = []) {
    if (!items.length) return TmUI.empty('No messages in this folder.');

    return items.map(item => {
        const sender = escapeHtml(item.senderName || 'Unknown sender');
        const subject = escapeHtml(item.subject || '(No subject)');
        const time = escapeHtml(item.time || '');
        const longTime = escapeHtml(item.longTime || item.time || '');
        const unreadClass = item.unread ? ' is-unread' : '';
        return buttonHtml({
            slot: `
                <div class="tmvu-pm-dialog-row-head">
                    <strong class="tmvu-pm-dialog-row-sender">${sender}</strong>
                    <span class="tmvu-pm-dialog-row-time" title="${longTime}">${time}</span>
                </div>
                <div class="tmvu-pm-dialog-row-subject" title="${subject}">${subject}</div>
            `,
            color: 'secondary',
            size: 'sm',
            cls: `tmvu-pm-dialog-row${unreadClass}`,
            attrs: {
                'data-pm-dialog-item': true,
                'data-pm-id': escapeHtml(item.id || ''),
                'data-pm-conversation-id': escapeHtml(item.conversationId || '0'),
            },
        });
    }).join('');
}

function renderPmThreadHtml(items = [], currentClubId = '') {
    if (!items.length) return TmUI.empty('No conversation loaded.');

    return items.map(item => {
        const isOwn = currentClubId && cleanText(item.senderId) === currentClubId;
        const bodyHtml = item.messageHtml || `<div>${escapeHtml(item.messageText || '')}</div>`;
        const displayTime = escapeHtml(item.longTime || item.time || '');
        return `
            <article class="tmvu-pm-thread-item${isOwn ? ' is-own' : ''}">
                <header class="tmvu-pm-thread-head">
                    <strong class="tmvu-pm-thread-sender">${escapeHtml(item.senderName || 'Unknown sender')}</strong>
                    <span class="tmvu-pm-thread-time" title="${displayTime}">${displayTime}</span>
                </header>
                <div class="tmvu-pm-thread-body">${bodyHtml}</div>
            </article>
        `;
    }).join('');
}

function renderPmThreadActionsHtml() {
    return `
        <div class="tmvu-pm-thread-actions">
            ${buttonHtml({ label: 'Forward', color: 'secondary', size: 'sm', cls: 'tmvu-pm-thread-action', attrs: { 'data-pm-thread-action': 'forward' } })}
            ${buttonHtml({ label: 'Trash', color: 'secondary', size: 'sm', cls: 'tmvu-pm-thread-action', attrs: { 'data-pm-thread-action': 'trash' } })}
            ${buttonHtml({ label: 'Mark as unread', color: 'secondary', size: 'sm', cls: 'tmvu-pm-thread-action', attrs: { 'data-pm-thread-action': 'unread' } })}
            ${buttonHtml({ label: 'Close', color: 'secondary', size: 'sm', cls: 'tmvu-pm-thread-action', attrs: { 'data-pm-thread-action': 'close' } })}
        </div>
    `;
}

function renderPmReplyComposerHtml(replyMeta = null) {
    if (!replyMeta) return '';

    return `
        <div class="tmvu-pm-reply-box" data-pm-reply-box>
            <div class="tmvu-pm-reply-head">
                <strong>Reply to ${escapeHtml(replyMeta.recipientName || 'manager')}</strong>
                <span>${escapeHtml(replyMeta.subject || '')}</span>
            </div>
            <textarea
                class="tmvu-pm-reply-textarea"
                data-pm-reply-text
                placeholder="Write your reply..."
                rows="5"
            ></textarea>
            <div class="tmvu-pm-reply-foot">
                <div class="tmvu-pm-reply-status" data-pm-reply-status></div>
                ${buttonHtml({ label: 'Send Reply', color: 'primary', size: 'sm', cls: 'tmvu-pm-reply-send', attrs: { 'data-pm-reply-send': '1' } })}
            </div>
        </div>
    `;
}

function renderPmThreadPanelHtml(items = [], currentClubId = '', replyMeta = null) {
    return `
        ${renderPmThreadActionsHtml()}
        <div class="tmvu-pm-thread-list">
            ${renderPmThreadHtml(items, currentClubId)}
        </div>
        ${renderPmReplyComposerHtml(replyMeta)}
    `;
}

function getPmReplyMeta(thread = [], selectedItem = null, currentClubId = '') {
    if (!Array.isArray(thread) || !thread.length) return null;

    const counterpart = thread.find(item => cleanText(item.senderId) !== currentClubId)
        || thread.find(item => cleanText(item.recipientId) !== currentClubId)
        || thread[thread.length - 1];

    const recipientName = cleanText(counterpart?.senderId) === currentClubId
        ? cleanText(counterpart?.recipientName)
        : cleanText(counterpart?.senderName);
    const recipientId = cleanText(counterpart?.senderId) === currentClubId
        ? cleanText(counterpart?.recipientId)
        : cleanText(counterpart?.senderId);
    const subjectBase = cleanText(selectedItem?.subject || thread[thread.length - 1]?.subject || '');
    const subject = /^re:/i.test(subjectBase) ? subjectBase : `re: ${subjectBase}`;
    const conversationId = cleanText(selectedItem?.conversationId) && cleanText(selectedItem?.conversationId) !== '0'
        ? cleanText(selectedItem?.conversationId)
        : cleanText(selectedItem?.id || thread[thread.length - 1]?.id);

    if (!recipientName || !recipientId || !subject) return null;

    return {
        recipientName,
        recipientId,
        subject,
        conversationId: conversationId || '0',
    };
}

function syncPmMainHost(dialog, selectedItem, thread = []) {
    if (!dialog?.pmMainEl) return;
    const safeSelected = selectedItem || {};
    dialog.pmMainEl.innerHTML = `
        <input type="hidden" name="id" value="${escapeHtml(safeSelected.id || '')}">
        <input type="hidden" name="conversation_id" value="${escapeHtml(safeSelected.conversationId || '0')}">
        <input type="hidden" name="subject" value="${escapeHtml(safeSelected.subject || '')}">
        ${thread.map(item => `
            <article
                class="tmvu-pm-native-item"
                data-message-id="${escapeHtml(item.id || '')}"
                data-conversation-id="${escapeHtml(item.conversationId || '0')}"
                data-sender-id="${escapeHtml(item.senderId || '')}"
                data-recipient-id="${escapeHtml(item.recipientId || '')}"
            >
                <div class="tmvu-pm-native-subject">${escapeHtml(item.subject || '')}</div>
                <div class="tmvu-pm-native-message">${item.messageHtml || escapeHtml(item.messageText || '')}</div>
            </article>
        `).join('')}
    `;
}

function setPmListPlaceholder(pmState, copy) {
    if (!pmState?.pmListEl) return;
    pmState.pmListEl.innerHTML = TmAppShellHeader.renderPmPlaceholder(copy);
}

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

function setPmDialogListHtml(pmState, html) {
    if (!pmState?.dialog?.listEl) return;
    pmState.dialog.listEl.innerHTML = html;
}

function setPmDialogDetailHtml(pmState, html) {
    if (!pmState?.dialog?.detailEl) return;
    pmState.dialog.detailEl.innerHTML = html;
}

function setPmReplyStatus(pmState, copy = '', tone = '') {
    const statusEl = pmState?.dialog?.detailEl?.querySelector('[data-pm-reply-status]');
    if (!statusEl) return;
    statusEl.textContent = copy;
    statusEl.className = `tmvu-pm-reply-status${tone ? ` is-${tone}` : ''}`;
}

function setPmDialogTitle(pmState, title) {
    if (!pmState?.dialog?.titleEl) return;
    pmState.dialog.titleEl.textContent = title || 'Messages';
}

function highlightPmDialogSelection(pmState, item) {
    if (!pmState?.dialog?.listEl) return;
    const selectedKey = getPmThreadCacheKey(item);
    pmState.dialog.listEl.querySelectorAll('[data-pm-dialog-item]').forEach(button => {
        const buttonKey = `${button.getAttribute('data-pm-id') || ''}:${button.getAttribute('data-pm-conversation-id') || '0'}`;
        button.classList.toggle('is-active', buttonKey === selectedKey);
    });
}

function closePmDialog(pmState) {
    const overlayEl = pmState?.dialog?.overlayEl;
    if (!overlayEl) return;
    overlayEl.hidden = true;
    document.body.classList.remove('tmvu-pm-dialog-open');
}

function invalidatePmDialogCaches(pmState, places = []) {
    const dialog = pmState?.dialog;
    if (!dialog) return;
    places.forEach(place => dialog.listCache.delete(place));
}

function openPmMenu(pmState) {
    if (!pmState?.pmMenuEl || !pmState?.pmTriggerEl) return;
    pmState.isPmOpen = true;
    pmState.pmRootEl?.classList.add('is-open');
    pmState.pmMenuEl.hidden = false;
    pmState.pmTriggerEl.setAttribute('aria-expanded', 'true');
}

function closePmMenu(pmState) {
    if (!pmState?.pmMenuEl || !pmState?.pmTriggerEl) return;
    pmState.isPmOpen = false;
    pmState.pmRootEl?.classList.remove('is-open');
    pmState.pmMenuEl.hidden = true;
    pmState.pmTriggerEl.setAttribute('aria-expanded', 'false');
}

function executePmThreadAction(pmState, action) {
    const dialog = pmState?.dialog;
    if (!dialog) return;

    if (action === 'close') {
        closePmDialog(pmState);
        return;
    }

    if (action === 'forward') {
        if (typeof window.pm_new === 'function') {
            window.pm_new('#pm_main', action);
            return;
        }
        window.location.assign('/pm/');
        return;
    }

    if ((action === 'trash' || action === 'unread') && typeof window.pm_set_status === 'function') {
        window.pm_set_status('#pm_main', 0, action);
        if (window.modal?.hide) window.modal.hide();
        invalidatePmDialogCaches(pmState, ['inbox', 'trash']);
        closePmDialog(pmState);
    }
}

async function submitPmReply(pmState) {
    const dialog = pmState?.dialog;
    const replyMeta = dialog?.replyMeta;
    const textarea = dialog?.detailEl?.querySelector('[data-pm-reply-text]');
    if (!dialog || !replyMeta || !textarea) return;

    const message = textarea.value.trim();
    if (!message) {
        setPmReplyStatus(pmState, 'Message is required.', 'error');
        textarea.focus();
        return;
    }

    const sendButton = dialog.detailEl.querySelector('[data-pm-reply-send]');
    if (sendButton) sendButton.disabled = true;
    textarea.disabled = true;
    setPmReplyStatus(pmState, 'Sending reply...', 'muted');

    const response = await TmApi.sendPmMessage({
        recipient: replyMeta.recipientName,
        subject: replyMeta.subject,
        message,
        conversationId: replyMeta.conversationId,
        clubId: cleanText(window.SESSION?.id || pmState.clubId || ''),
    });

    if (sendButton) sendButton.disabled = false;
    textarea.disabled = false;

    if (!response) {
        setPmReplyStatus(pmState, 'An error occurred while sending the message.', 'error');
        return;
    }

    if (response.refresh) {
        if (typeof window.page_refresh === 'function') {
            window.page_refresh();
            return;
        }
        window.location.reload();
        return;
    }

    if (Number(response.banned) > 0) {
        setPmReplyStatus(pmState, 'You are not allowed to send PMs.', 'error');
        return;
    }

    setPmReplyStatus(pmState, 'Message sent.', 'success');
    textarea.value = '';
    invalidatePmDialogCaches(pmState, ['inbox', 'sent', 'trash']);

    const selectedItem = dialog.selectedItem
        ? {
            ...dialog.selectedItem,
            conversationId: dialog.selectedItem.conversationId && dialog.selectedItem.conversationId !== '0'
                ? dialog.selectedItem.conversationId
                : (replyMeta.conversationId || dialog.selectedItem.id || '0'),
        }
        : null;

    if (selectedItem) {
        dialog.selectedItem = selectedItem;
        dialog.detailCache.delete(getPmThreadCacheKey(selectedItem));
        await loadPmDialogFolder(pmState, dialog.activePlace, selectedItem);
        setPmReplyStatus(pmState, 'Message sent.', 'success');
    }
}

function ensurePmDialog(pmState) {
    if (!pmState) return null;
    if (pmState.dialog?.overlayEl) return pmState.dialog;

    const overlayEl = document.createElement('div');
    overlayEl.className = 'tmvu-pm-dialog-overlay';
    overlayEl.hidden = true;
    overlayEl.innerHTML = `
        <div class="tmvu-pm-dialog" role="dialog" aria-modal="true" aria-labelledby="tmvu-pm-dialog-title">
            <div class="tmvu-pm-dialog-head">
                <div>
                    <div class="tmvu-pm-dialog-kicker">Messages</div>
                    <h2 class="tmvu-pm-dialog-title" id="tmvu-pm-dialog-title">Messages</h2>
                </div>
                <div class="tmvu-pm-dialog-actions" data-pm-dialog-actions></div>
            </div>
            <div class="tmvu-pm-dialog-tabs" data-pm-dialog-tabs></div>
            <div class="tmvu-pm-dialog-body">
                <aside class="tmvu-pm-dialog-list" data-pm-dialog-list>${TmUI.loading('Loading messages...')}</aside>
                <section class="tmvu-pm-dialog-detail" data-pm-dialog-detail>${TmUI.empty('Select a conversation to read.')}</section>
            </div>
            <div id="pm_main" class="tmvu-pm-native-host" hidden></div>
        </div>
    `;
    document.body.appendChild(overlayEl);

    const actionsEl = overlayEl.querySelector('[data-pm-dialog-actions]');
    const composeBtn = TmUI.button({ label: 'New Message', color: 'secondary', size: 'sm', cls: 'tmvu-pm-dialog-compose' });
    const closeBtn = TmUI.button({ label: 'Close', color: 'secondary', size: 'sm', cls: 'tmvu-pm-dialog-close' });
    actionsEl.appendChild(composeBtn);
    actionsEl.appendChild(closeBtn);

    const dialog = {
        overlayEl,
        titleEl: overlayEl.querySelector('#tmvu-pm-dialog-title'),
        tabsHostEl: overlayEl.querySelector('[data-pm-dialog-tabs]'),
        listEl: overlayEl.querySelector('[data-pm-dialog-list]'),
        detailEl: overlayEl.querySelector('[data-pm-dialog-detail]'),
        pmMainEl: overlayEl.querySelector('#pm_main'),
        composeBtn,
        closeBtn,
        activePlace: 'inbox',
        listCache: new Map(),
        detailCache: new Map(),
        selectedItem: null,
        replyMeta: null,
    };

    const tabsEl = TmUI.tabs({
        items: [
            { key: 'inbox', label: 'Inbox' },
            { key: 'sent', label: 'Sent' },
            { key: 'trash', label: 'Trash' },
        ],
        active: dialog.activePlace,
        color: 'secondary',
        cls: 'tmvu-pm-dialog-tabs-bar',
        onChange: place => {
            openPmDialog(pmState, { place });
        },
    });
    dialog.tabsHostEl.appendChild(tabsEl);

    composeBtn.addEventListener('click', () => {
        if (typeof window.pm_new === 'function') {
            window.pm_new('', 'new');
            return;
        }
        window.location.assign('/pm/');
    });

    const closeDialog = () => {
        closePmDialog(pmState);
    };

    closeBtn.addEventListener('click', closeDialog);
    overlayEl.addEventListener('click', event => {
        if (event.target === overlayEl) closeDialog();
    });

    document.addEventListener('keydown', event => {
        if (event.key !== 'Escape' || overlayEl.hidden) return;
        closeDialog();
    });

    dialog.listEl.addEventListener('click', event => {
        const button = event.target.closest('[data-pm-dialog-item]');
        if (!button) return;
        const item = {
            id: cleanText(button.getAttribute('data-pm-id')),
            conversationId: cleanText(button.getAttribute('data-pm-conversation-id')) || '0',
            subject: button.querySelector('.tmvu-pm-dialog-row-subject')?.textContent || '',
        };
        loadPmDialogDetail(pmState, item);
    });

    dialog.detailEl.addEventListener('click', event => {
        const replyButton = event.target.closest('[data-pm-reply-send]');
        if (replyButton) {
            submitPmReply(pmState);
            return;
        }
        const actionButton = event.target.closest('[data-pm-thread-action]');
        if (!actionButton) return;
        executePmThreadAction(pmState, cleanText(actionButton.getAttribute('data-pm-thread-action')));
    });

    pmState.dialog = dialog;
    return dialog;
}

async function loadPmDialogDetail(pmState, item) {
    const dialog = ensurePmDialog(pmState);
    if (!dialog || !item?.id) return;

    dialog.selectedItem = item;
    highlightPmDialogSelection(pmState, item);
    setPmDialogTitle(pmState, item.subject || 'Conversation');
    setPmDialogDetailHtml(pmState, TmUI.loading('Loading conversation...'));

    const cacheKey = getPmThreadCacheKey(item);
    if (dialog.detailCache.has(cacheKey)) {
        const cached = dialog.detailCache.get(cacheKey);
        dialog.replyMeta = getPmReplyMeta(cached, item, pmState.clubId || '');
        syncPmMainHost(dialog, item, cached);
        setPmDialogDetailHtml(pmState, renderPmThreadPanelHtml(cached, pmState.clubId || '', dialog.replyMeta));
        return;
    }

    const response = await TmApi.fetchPmMessageText(item.id, item.conversationId || '0');
    const thread = normalizePmThreadItems(response);
    if (!thread.length) {
        dialog.replyMeta = null;
        syncPmMainHost(dialog, item, []);
        setPmDialogDetailHtml(pmState, TmUI.error('Failed to load conversation.'));
        return;
    }

    dialog.detailCache.set(cacheKey, thread);
    dialog.replyMeta = getPmReplyMeta(thread, item, pmState.clubId || '');
    syncPmMainHost(dialog, item, thread);
    setPmDialogTitle(pmState, thread[0]?.subject || item.subject || 'Conversation');
    setPmDialogDetailHtml(pmState, renderPmThreadPanelHtml(thread, pmState.clubId || '', dialog.replyMeta));
}

async function loadPmDialogFolder(pmState, place = 'inbox', selected = null) {
    const dialog = ensurePmDialog(pmState);
    if (!dialog) return;

    dialog.activePlace = place;
    setPmDialogTitle(pmState, place.charAt(0).toUpperCase() + place.slice(1));
    TmUI.setActive(dialog.tabsHostEl.querySelector('.tmu-tabs'), place);
    setPmDialogListHtml(pmState, TmUI.loading(`Loading ${place}...`));
    setPmDialogDetailHtml(pmState, TmUI.empty('Select a conversation to read.'));

    let items = dialog.listCache.get(place);
    if (!items) {
        const response = await TmApi.fetchPmMessages(place);
        items = normalizePmFolderItems(response, place);
        dialog.listCache.set(place, items);
    }

    setPmDialogListHtml(pmState, renderPmDialogListItems(items));
    if (!items.length) {
        setPmDialogDetailHtml(pmState, TmUI.empty(`No ${place} messages.`));
        return;
    }

    const nextItem = selected
        ? items.find(entry => getPmThreadCacheKey(entry) === getPmThreadCacheKey(selected)) || items[0]
        : items[0];
    await loadPmDialogDetail(pmState, nextItem);
}

async function openPmDialog(pmState, { place = 'inbox', item = null } = {}) {
    const dialog = ensurePmDialog(pmState);
    if (!dialog) return;

    dialog.overlayEl.hidden = false;
    document.body.classList.add('tmvu-pm-dialog-open');
    closePmMenu(pmState);
    await loadPmDialogFolder(pmState, place, item);
}

async function loadPmConversations(pmState) {
    if (!pmState || pmState.isLoading) return;

    pmState.isLoading = true;
    pmState.pmRootEl?.classList.add('is-loading');
    setPmListPlaceholder(pmState, 'Loading latest conversations...');

    try {
        const pmResponse = await TmApi.fetchPmMessages('inbox');
        const pmItems = normalizePmConversationItems(pmResponse);

        if (pmItems.length) {
            pmState.pmListEl.innerHTML = TmAppShellHeader.renderPmItems(pmItems);
        } else if (pmResponse) {
            setPmListPlaceholder(pmState, 'No recent conversations found.');
        } else {
            setPmListPlaceholder(pmState, 'Unable to load messages right now.');
        }
    } finally {
        pmState.isLoading = false;
        pmState.pmRootEl?.classList.remove('is-loading');
    }
}

async function loadFeedNotifications(feedState) {
    if (!feedState || feedState.isLoading) return;

    feedState.isLoading = true;
    feedState.rootEl?.classList.add('is-loading');
    setFeedListPlaceholder(feedState, 'Loading notifications...');

    try {
        const response = await TmApi.fetchTopUserFeed();
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

function bindPmMenu(pmState) {
    const rootEl = document.querySelector('[data-pm-root]');
    if (!rootEl) return null;

    Object.assign(pmState, {
        pmRootEl: rootEl,
        pmTriggerEl: rootEl.querySelector('[data-pm-trigger]'),
        pmMenuEl: rootEl.querySelector('[data-pm-menu]'),
        pmListEl: rootEl.querySelector('[data-pm-list]'),
        pmCountEl: rootEl.querySelector('[data-pm-count]'),
        pmSummaryEl: rootEl.querySelector('[data-pm-summary]'),
        composeEl: rootEl.querySelector('[data-pm-compose]'),
        viewAllEl: rootEl.querySelector('[data-pm-view-all]'),
        isPmOpen: false,
    });

    if (rootEl.dataset.tmvuPmMenuBound === '1') {
        return pmState;
    }
    rootEl.dataset.tmvuPmMenuBound = '1';

    pmState.composeEl?.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof window.pm_new === 'function') {
            window.pm_new('', 'new');
            return;
        }
        window.location.assign('/pm/');
    });

    pmState.viewAllEl?.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openPmDialog(pmState, { place: 'inbox' });
    });

    pmState.pmTriggerEl?.addEventListener('click', async event => {
        event.preventDefault();
        event.stopPropagation();
        if (pmState.isPmOpen) {
            closePmMenu(pmState);
            return;
        }
        openPmMenu(pmState);
        await loadPmConversations(pmState);
    });

    if (!pmState.__documentBindingsAttached) {
        document.addEventListener('click', event => {
            if (!pmState.isPmOpen || !pmState.pmRootEl) return;
            if (pmState.pmRootEl.contains(event.target)) return;
            closePmMenu(pmState);
        });

        document.addEventListener('keydown', event => {
            if (event.key !== 'Escape' || !pmState.isPmOpen) return;
            closePmMenu(pmState);
        });
        pmState.__documentBindingsAttached = true;
    }

    pmState.pmListEl?.addEventListener('click', event => {
        const itemButton = event.target.closest('[data-pm-item]');
        if (!itemButton) return;
        event.preventDefault();
        event.stopPropagation();
        const item = {
            id: cleanText(itemButton.getAttribute('data-pm-id')),
            conversationId: cleanText(itemButton.getAttribute('data-pm-conversation-id')) || '0',
            subject: itemButton.querySelector('.tmvu-pm-item-subject')?.textContent || '',
        };
        openPmDialog(pmState, { place: 'inbox', item });
    });

    return pmState;
}

function bindFeedMenu(feedState) {
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

export function createAppShellPmController({ clubId = '', initialCount = 0, initialFeedCount = 0 } = {}) {
    const pmState = {
        isLoading: false,
        count: 0,
        isPmOpen: false,
        clubId: cleanText(clubId || window.SESSION?.main_id || window.SESSION?.club_id || window.SESSION?.id),
        dialog: null,
        pmRootEl: null,
        pmTriggerEl: null,
        pmMenuEl: null,
        pmListEl: null,
        pmCountEl: null,
        pmSummaryEl: null,
        composeEl: null,
        viewAllEl: null,
    };

    const feedState = {
        isLoading: false,
        count: 0,
        rootEl: null,
        triggerEl: null,
        menuEl: null,
        listEl: null,
        countEl: null,
        summaryEl: null,
        items: [],
    };

    const setPmCount = (count) => {
        const safeCount = Math.max(0, Number(count) || 0);
        pmState.count = safeCount;
        if (pmState.pmCountEl) pmState.pmCountEl.textContent = String(safeCount);
        if (pmState.pmSummaryEl) pmState.pmSummaryEl.textContent = `${safeCount} new`;
    };

    const setFeedCount = (count) => {
        const safeCount = Math.max(0, Number(count) || 0);
        feedState.count = safeCount;
        if (feedState.countEl) feedState.countEl.textContent = String(safeCount);
        if (feedState.summaryEl) feedState.summaryEl.textContent = `${safeCount} new`;
    };

    return {
        bind() {
            injectStyles();
            bindPmMenu(pmState);
            bindFeedMenu(feedState);
            setPmCount(initialCount);
            setFeedCount(initialFeedCount);
            return { pmState, feedState };
        },

        setCount: setPmCount,
        setFeedCount,

        async refreshCount() {
            const [topUserInfo, topUserFeed] = await Promise.all([
                TmApi.fetchTopUserInfo(),
                TmApi.fetchTopUserFeed(),
            ]);
            setPmCount(getTopUserInfoPmCount(topUserInfo, pmState.count));
            setFeedCount(getTopUserInfoFeedCount(topUserInfo, feedState.count));
            return { topUserInfo, topUserFeed };
        },
    };
}