import { TmUI } from './tm-ui.js';
import { TmMessagesModel } from '../../models/messages.js';
import { CountryFlag } from './country-flag.js';

const STYLE_ID = 'tmvu-pm-dialog-styles';

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

function injectDialogStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
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
            padding: var(--tmu-space-xl);
            background: var(--tmu-surface-overlay-strong);
            backdrop-filter: blur(4px);
        }

        .tmvu-pm-dialog-overlay[hidden] {
            display: none !important;
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
            gap: var(--tmu-space-lg);
            padding: var(--tmu-space-xl) var(--tmu-space-xl) var(--tmu-space-md);
            border-bottom: 1px solid var(--tmu-border-soft-alpha-strong);
        }

        .tmvu-pm-dialog-kicker {
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--tmu-text-panel-label);
        }

        .tmvu-pm-dialog-title {
            margin: var(--tmu-space-xs) 0 0;
            font-size: var(--tmu-font-xl);
            line-height: 1.15;
            color: var(--tmu-text-inverse);
        }

        .tmvu-pm-dialog-actions {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
        }

        .tmvu-pm-dialog-tabs {
            padding: 0 var(--tmu-space-xl) 0;
        }

        .tmvu-pm-dialog-tabs-bar {
            border-radius: var(--tmu-space-sm) var(--tmu-space-sm) 0 0;
        }

        .tmvu-pm-dialog-body {
            min-height: 0;
            flex: 1 1 auto;
            display: grid;
            grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
            grid-template-rows: minmax(0, 1fr);
            gap: 0;
            border-top: 1px solid var(--tmu-border-soft-alpha-strong);
        }

        .tmvu-pm-dialog-list,
        .tmvu-pm-dialog-detail {
            min-height: 0;
            overflow-y: auto;
            padding: var(--tmu-space-lg);
        }

        .tmvu-pm-dialog-list {
            border-right: 1px solid var(--tmu-border-soft-alpha-mid);
            background: var(--tmu-surface-dark-mid);
            grid-row: 1;
            grid-column: 1;
        }

        .tmvu-pm-dialog-detail,
        [data-pm-compose-panel] {
            grid-row: 1;
            grid-column: 2;
        }

        [data-pm-compose-panel] {
            overflow-y: auto;
            padding: var(--tmu-space-lg);
        }

        .tmvu-pm-dialog-row {
            width: 100%;
            display: block;
            text-align: left;
            padding: var(--tmu-space-md) var(--tmu-space-md);
            margin-bottom: var(--tmu-space-sm);
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
            padding-left: var(--tmu-space-md);
        }

        .tmvu-pm-dialog-row-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: var(--tmu-space-sm);
        }

        .tmvu-pm-dialog-row-sender {
            color: var(--tmu-text-inverse);
            font-size: var(--tmu-font-sm);
        }

        .tmvu-pm-dialog-row-time {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
            white-space: nowrap;
        }

        .tmvu-pm-dialog-row-subject {
            margin-top: var(--tmu-space-xs);
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-sm);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .tmvu-pm-thread-item {
            padding: var(--tmu-space-lg) var(--tmu-space-lg);
            background: var(--tmu-surface-item-dark);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
        }

        .tmvu-pm-thread-actions {
            display: flex;
            flex-wrap: wrap;
            gap: var(--tmu-space-sm);
            margin-bottom: var(--tmu-space-md);
        }

        .tmvu-pm-thread-action {
            flex: 0 0 auto;
        }

        .tmvu-pm-thread-list {
            display: flex;
            flex-direction: column;
        }

        .tmvu-pm-reply-box {
            margin-top: var(--tmu-space-lg);
            padding: var(--tmu-space-lg);
            background: var(--tmu-surface-item-dark);
            border: 1px solid var(--tmu-border-soft-alpha-mid);
        }

        .tmvu-pm-reply-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: var(--tmu-space-md);
            margin-bottom: var(--tmu-space-md);
        }

        .tmvu-pm-reply-head strong {
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-sm);
        }

        .tmvu-pm-reply-head span {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
        }

        .tmvu-pm-reply-textarea {
            width: 100%;
            min-height: 118px;
            resize: vertical;
            padding: var(--tmu-space-md) var(--tmu-space-md);
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
            gap: var(--tmu-space-md);
            margin-top: var(--tmu-space-md);
        }

        .tmvu-pm-reply-status {
            min-height: 18px;
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
        }

        .tmvu-pm-reply-status.is-error { color: var(--tmu-danger); }
        .tmvu-pm-reply-status.is-success { color: var(--tmu-success); }
        .tmvu-pm-reply-status.is-muted { color: var(--tmu-text-muted); }

        .tmvu-pm-thread-item + .tmvu-pm-thread-item {
            margin-top: var(--tmu-space-md);
        }

        .tmvu-pm-thread-item.is-own {
            background: var(--tmu-success-fill-faint);
            border-color: var(--tmu-border-soft-alpha-strong);
        }

        .tmvu-pm-thread-head {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: var(--tmu-space-sm);
            margin-bottom: var(--tmu-space-md);
        }

        .tmvu-pm-thread-sender {
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-sm);
        }

        .tmvu-pm-thread-time {
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-xs);
        }

        .tmvu-pm-thread-body {
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
            line-height: 1.6;
            word-break: break-word;
        }

        .tmvu-pm-thread-body a { color: var(--tmu-text-main); }
        .tmvu-pm-thread-body img { vertical-align: middle; }

        .tmvu-pm-compose-panel {
            display: none;
            flex-direction: column;
            height: 100%;
            min-height: 0;
        }

        .tmvu-pm-compose-panel.is-active {
            display: flex;
        }

        .tmvu-pm-compose-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--tmu-space-md);
            padding-bottom: var(--tmu-space-md);
            margin-bottom: var(--tmu-space-md);
            border-bottom: 1px solid var(--tmu-border-soft-alpha-mid);
        }

        .tmvu-pm-compose-title {
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            color: var(--tmu-text-strong);
        }

        .tmvu-pm-compose-body {
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-md);
            overflow-y: auto;
        }

        .tmvu-pm-compose-field {
            display: flex;
            flex-direction: column;
            gap: var(--tmu-space-xs);
            position: relative;
        }

        .tmvu-pm-compose-label {
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            color: var(--tmu-text-panel-label);
        }

        .tmvu-pm-compose-input,
        .tmvu-pm-compose-textarea {
            width: 100%;
            padding: var(--tmu-space-md);
            border: 1px solid var(--tmu-border-soft-alpha-strong);
            background: var(--tmu-surface-input-dark);
            color: var(--tmu-text-main);
            font: inherit;
            font-size: var(--tmu-font-sm);
            line-height: 1.5;
            box-sizing: border-box;
        }

        .tmvu-pm-compose-input:focus,
        .tmvu-pm-compose-textarea:focus {
            outline: none;
            border-color: var(--tmu-border-input-overlay);
            box-shadow: 0 0 0 1px var(--tmu-border-soft-alpha-mid);
        }

        .tmvu-pm-compose-textarea {
            min-height: 160px;
            resize: vertical;
            flex: 1 1 auto;
        }

        .tmvu-pm-compose-suggestions {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 10070;
            background: var(--tmu-surface-panel);
            border: 1px solid var(--tmu-border-soft-alpha-strong);
            box-shadow: 0 8px 24px var(--tmu-shadow-panel);
            max-height: 220px;
            overflow-y: auto;
        }

        .tmvu-pm-compose-suggestion {
            padding: var(--tmu-space-md) var(--tmu-space-lg);
            cursor: pointer;
            font-size: var(--tmu-font-sm);
            color: var(--tmu-text-main);
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
        }

        .tmvu-pm-compose-suggestion:hover,
        .tmvu-pm-compose-suggestion.is-active {
            background: var(--tmu-success-fill-soft);
            color: var(--tmu-text-strong);
        }

        .tmvu-pm-compose-suggestion-name {
            font-weight: 700;
            color: var(--tmu-text-strong);
        }

        .tmvu-pm-compose-suggestion-meta {
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-muted);
        }

        .tmvu-pm-compose-foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: var(--tmu-space-md);
            margin-top: var(--tmu-space-md);
            padding-top: var(--tmu-space-md);
            border-top: 1px solid var(--tmu-border-soft-alpha-mid);
        }

        .tmvu-pm-compose-status {
            min-height: 18px;
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-muted);
        }

        .tmvu-pm-compose-status.is-error { color: var(--tmu-danger); }
        .tmvu-pm-compose-status.is-success { color: var(--tmu-success); }
    `;

    document.head.appendChild(style);
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

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

// ─── Renderers ───────────────────────────────────────────────────────────────

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

// ─── State helpers ────────────────────────────────────────────────────────────

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

export function closePmDialog(pmState) {
    const overlayEl = pmState?.dialog?.overlayEl;
    if (!overlayEl) return;
    overlayEl.hidden = true;
    document.body.classList.remove('tmvu-pm-dialog-open');
}

export function invalidatePmDialogCaches(pmState, places = []) {
    const dialog = pmState?.dialog;
    if (!dialog) return;
    places.forEach(place => dialog.listCache.delete(place));
}

// ─── Thread actions ───────────────────────────────────────────────────────────

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

    const response = await TmMessagesModel.sendPmMessage({
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

// ─── Compose ──────────────────────────────────────────────────────────────────

export function openPmCompose(pmState, { recipientId = '', recipientName = '' } = {}) {
    const dialog = ensurePmDialog(pmState);
    if (!dialog) return;

    dialog.overlayEl.hidden = false;
    document.body.classList.add('tmvu-pm-dialog-open');
    pmState.closeMenu?.();

    const panel = dialog.composePanelEl;
    if (!panel) return;

    panel.classList.add('is-active');
    dialog.detailEl.style.display = 'none';
    panel.innerHTML = `
        <div class="tmvu-pm-compose-head">
            <span class="tmvu-pm-compose-title">New Message</span>
        </div>
        <div class="tmvu-pm-compose-body">
            <div class="tmvu-pm-compose-field">
                <label class="tmvu-pm-compose-label">To (club name)</label>
                <input type="text" class="tmvu-pm-compose-input" data-compose-to placeholder="Search for club…" autocomplete="off" value="${escapeHtml(recipientName)}">
                <div class="tmvu-pm-compose-suggestions" data-compose-suggest hidden></div>
                <input type="hidden" data-compose-recipient-id value="${escapeHtml(recipientId)}">
            </div>
            <div class="tmvu-pm-compose-field">
                <label class="tmvu-pm-compose-label">Subject</label>
                <input type="text" class="tmvu-pm-compose-input" data-compose-subject placeholder="Subject…">
            </div>
            <div class="tmvu-pm-compose-field" style="flex:1 1 auto">
                <label class="tmvu-pm-compose-label">Message</label>
                <textarea class="tmvu-pm-compose-textarea" data-compose-message placeholder="Write your message…"></textarea>
            </div>
        </div>
        <div class="tmvu-pm-compose-foot">
            <span class="tmvu-pm-compose-status" data-compose-status></span>
        </div>
    `;

    const head = panel.querySelector('.tmvu-pm-compose-head');
    const foot = panel.querySelector('.tmvu-pm-compose-foot');
    const cancelBtn = TmUI.button({ label: 'Cancel', color: 'secondary', size: 'sm' });
    const sendBtn = TmUI.button({ label: 'Send', color: 'primary', size: 'sm' });
    head.appendChild(cancelBtn);
    foot.appendChild(sendBtn);

    const toInput = panel.querySelector('[data-compose-to]');
    const suggestBox = panel.querySelector('[data-compose-suggest]');
    const recipientIdInput = panel.querySelector('[data-compose-recipient-id]');
    const subjectInput = panel.querySelector('[data-compose-subject]');
    const msgTextarea = panel.querySelector('[data-compose-message]');
    const statusEl = panel.querySelector('[data-compose-status]');

    let suggestTimer = null;
    let activeSuggestionIndex = -1;
    let suggestions = [];

    const setStatus = (text, tone = '') => {
        statusEl.className = `tmvu-pm-compose-status${tone ? ` is-${tone}` : ''}`;
        statusEl.textContent = text;
    };

    const clearSuggest = () => {
        suggestBox.hidden = true;
        suggestBox.innerHTML = '';
        suggestions = [];
        activeSuggestionIndex = -1;
    };

    const selectSuggestion = (club) => {
        toInput.value = (club.clubname || '') + (club.clubnick ? ` (${club.clubnick})` : '');
        recipientIdInput.value = String(club.id || '');
        clearSuggest();
    };

    const highlightSuggestion = (idx) => {
        suggestBox.querySelectorAll('.tmvu-pm-compose-suggestion').forEach((el, i) => el.classList.toggle('is-active', i === idx));
        activeSuggestionIndex = idx;
    };

    toInput.addEventListener('input', () => {
        recipientIdInput.value = '';
        clearTimeout(suggestTimer);
        const q = toInput.value.trim();
        if (!q) { clearSuggest(); return; }
        suggestTimer = setTimeout(async () => {
            const data = await TmMessagesModel.suggestClubs(q, 8);
            if (!Array.isArray(data) || !data.length) { clearSuggest(); return; }
            suggestions = data;
            activeSuggestionIndex = -1;
            suggestBox.innerHTML = data.map((club, i) => {
                const nick = club.clubnick ? ` (${escapeHtml(club.clubnick)})` : '';
                const div = club.division ? escapeHtml(String(club.division)) + (club.group ? `.${escapeHtml(String(club.group))}` : '') : '';
                const flag = CountryFlag.render(club.country);
                return `<div class="tmvu-pm-compose-suggestion" data-idx="${i}">${flag}<span class="tmvu-pm-compose-suggestion-name">${escapeHtml(club.clubname || '')}${nick}</span><span class="tmvu-pm-compose-suggestion-meta">${div}</span></div>`;
            }).join('');
            suggestBox.hidden = false;
        }, 220);
    });

    toInput.addEventListener('keydown', (e) => {
        if (suggestBox.hidden) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); highlightSuggestion(Math.min(activeSuggestionIndex + 1, suggestions.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); highlightSuggestion(Math.max(activeSuggestionIndex - 1, 0)); }
        else if (e.key === 'Enter' && activeSuggestionIndex >= 0) { e.preventDefault(); selectSuggestion(suggestions[activeSuggestionIndex]); }
        else if (e.key === 'Escape') { clearSuggest(); }
    });

    toInput.addEventListener('blur', () => setTimeout(clearSuggest, 150));
    suggestBox.addEventListener('mousedown', (e) => {
        const item = e.target.closest('[data-idx]');
        if (!item) return;
        e.preventDefault();
        selectSuggestion(suggestions[Number(item.dataset.idx)]);
    });

    cancelBtn.addEventListener('click', () => closePmCompose(pmState));

    sendBtn.addEventListener('click', async () => {
        const recipient = recipientIdInput.value.trim();
        const subject = subjectInput.value.trim();
        const message = msgTextarea.value.trim();

        setStatus('');
        if (!recipient || !subject || !message) {
            setStatus(!recipient ? 'Please select a recipient.' : !subject ? 'Subject is required.' : 'Message is required.', 'error');
            return;
        }

        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending…';

        const clubId = cleanText(window.SESSION?.id || pmState.clubId || '');
        const response = await TmMessagesModel.sendPmMessage({ recipient, subject, message, conversationId: '0', clubId });

        sendBtn.disabled = false;
        sendBtn.textContent = 'Send';

        if (!response) { setStatus('Failed to send message. Please try again.', 'error'); return; }
        if (Number(response.banned) > 0) { setStatus('You are not allowed to send messages to this club.', 'error'); return; }

        setStatus('Message sent!', 'success');
        invalidatePmDialogCaches(pmState, ['sent']);
        setTimeout(() => closePmCompose(pmState), 1200);
    });

    toInput.focus();
}

export function closePmCompose(pmState) {
    const dialog = pmState?.dialog;
    if (!dialog?.composePanelEl) return;
    dialog.composePanelEl.classList.remove('is-active');
    dialog.composePanelEl.innerHTML = '';
    dialog.detailEl.style.display = '';
}

// ─── Dialog lifecycle ─────────────────────────────────────────────────────────

export function ensurePmDialog(pmState) {
    if (!pmState) return null;
    if (pmState.dialog?.overlayEl) return pmState.dialog;

    injectDialogStyles();

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
                <section class="tmvu-pm-compose-panel" data-pm-compose-panel></section>
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
        composePanelEl: overlayEl.querySelector('[data-pm-compose-panel]'),
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
        openPmCompose(pmState);
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
            unread: button.classList.contains('is-unread'),
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

    if (item.unread) {
        item.unread = false;

        ['inbox', 'trash'].forEach(place => {
            const list = dialog.listCache.get(place) || [];
            list.forEach(entry => {
                if (entry.id === item.id) entry.unread = false;
            });
        });

        if (dialog.activePlace && dialog.listCache.has(dialog.activePlace)) {
            setPmDialogListHtml(pmState, renderPmDialogListItems(dialog.listCache.get(dialog.activePlace)));
            highlightPmDialogSelection(pmState, item);
        }

        const newCount = Math.max(0, pmState.count - 1);
        pmState.setPmCount?.(newCount);

        TmMessagesModel.setPmMessageStatus({ status: 'read', messageId: item.id }).catch(() => {});
    }

    const cacheKey = getPmThreadCacheKey(item);
    if (dialog.detailCache.has(cacheKey)) {
        const cached = dialog.detailCache.get(cacheKey);
        dialog.replyMeta = getPmReplyMeta(cached, item, pmState.clubId || '');
        syncPmMainHost(dialog, item, cached);
        setPmDialogDetailHtml(pmState, renderPmThreadPanelHtml(cached, pmState.clubId || '', dialog.replyMeta));
        return;
    }

    const response = await TmMessagesModel.fetchPmMessageText(item.id, item.conversationId || '0');
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
        const response = await TmMessagesModel.fetchPmMessages(place);
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

export async function openPmDialog(pmState, { place = 'inbox', item = null } = {}) {
    const dialog = ensurePmDialog(pmState);
    if (!dialog) return;

    dialog.overlayEl.hidden = false;
    document.body.classList.add('tmvu-pm-dialog-open');
    pmState.closeMenu?.();
    await loadPmDialogFolder(pmState, place, item);
}
