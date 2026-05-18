import { TmAppShellHeader } from './tm-app-shell-header.js';
import { TmUI } from './tm-ui.js';
import { TmMessagesModel } from '../../models/messages.js';
import { openPmDialog, openPmCompose } from './tm-pm-dialog.js';
import { bindFeedMenu } from './tm-feed-menu.js';

const STYLE_ID = 'tmvu-shell-pm-menu-styles';

function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
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
            gap: var(--tmu-space-md);
            padding: var(--tmu-space-md) var(--tmu-space-md) var(--tmu-space-md);
            border-bottom: 1px solid var(--tmu-border-soft-alpha-strong);
        }

        .tmvu-pm-menu-head strong {
            display: block;
            font-size: var(--tmu-font-sm);
            color: var(--tmu-text-inverse);
        }

        .tmvu-pm-menu-head span {
            display: block;
            margin-top: var(--tmu-space-xs);
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-muted);
        }

        .tmvu-pm-compose {
            white-space: nowrap;
        }

        .tmvu-pm-list {
            overflow-y: auto;
            padding: var(--tmu-space-sm);
        }

        .tmvu-pm-menu-foot {
            display: grid;
            gap: var(--tmu-space-md);
            padding: 0 var(--tmu-space-md) var(--tmu-space-md);
            border-top: 1px solid var(--tmu-border-soft-alpha);
        }

        .tmvu-pm-view-all {
            width: 100%;
            justify-content: center;
        }

        .tmvu-pm-placeholder {
            padding: var(--tmu-space-lg) var(--tmu-space-md);
            color: var(--tmu-text-muted);
            font-size: var(--tmu-font-sm);
        }

        .tmvu-pm-item {
            width: 100%;
            display: block;
            text-align: left;
            padding: var(--tmu-space-md);
            border: 1px solid transparent;
            border-bottom-color: var(--tmu-border-soft-alpha);
            background: var(--tmu-surface-item-dark);
            cursor: pointer;
        }

        .tmvu-pm-item + .tmvu-pm-item {
            margin-top: var(--tmu-space-sm);
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
            gap: var(--tmu-space-sm);
        }

        .tmvu-pm-item-sender {
            font-size: var(--tmu-font-sm);
            color: var(--tmu-text-inverse);
        }

        .tmvu-pm-item-time {
            font-size: var(--tmu-font-xs);
            color: var(--tmu-text-muted);
            white-space: nowrap;
        }

        .tmvu-pm-item-subject {
            margin-top: var(--tmu-space-xs);
            font-size: var(--tmu-font-sm);
            color: var(--tmu-text-strong);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;

    document.head.appendChild(style);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function setPmListPlaceholder(pmState, copy) {
    if (!pmState?.pmListEl) return;
    pmState.pmListEl.innerHTML = TmAppShellHeader.renderPmPlaceholder(copy);
}

// ─── PM menu open/close ───────────────────────────────────────────────────────

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

async function loadPmConversations(pmState) {
    if (!pmState || pmState.isLoading) return;

    pmState.isLoading = true;
    pmState.pmRootEl?.classList.add('is-loading');
    setPmListPlaceholder(pmState, 'Loading latest conversations...');

    try {
        const pmResponse = await TmMessagesModel.fetchPmMessages('inbox');
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
        closePmMenu(pmState);
        openPmCompose(pmState);
        openPmDialog(pmState, { place: 'inbox' }); // populate list in background
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

// ─── Controller ───────────────────────────────────────────────────────────────

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
        if (pmState.pmCountEl) pmState.pmCountEl.textContent = safeCount > 8 ? '9+' : String(safeCount);
        if (pmState.pmSummaryEl) pmState.pmSummaryEl.textContent = `${safeCount} new`;
        if (pmState.pmRootEl) pmState.pmRootEl.classList.toggle('new', safeCount > 0);

        const tabNotification = document.querySelector('#tabprivate_messages_main div .tab_notification');
        if (tabNotification) {
            tabNotification.textContent = String(safeCount);
            tabNotification.style.display = safeCount > 0 ? '' : 'none';
        }

        if (window.SESSION) window.SESSION.new_pm = safeCount;
    };
    pmState.setPmCount = setPmCount;

    const setFeedCount = (count) => {
        const safeCount = Math.max(0, Number(count) || 0);
        feedState.count = safeCount;
        if (feedState.countEl) feedState.countEl.textContent = String(safeCount);
        if (feedState.summaryEl) feedState.summaryEl.textContent = `${safeCount} new`;
    };

    // Expose close-menu so the dialog module can call it without a circular import
    pmState.closeMenu = () => closePmMenu(pmState);

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

        openDialog({ place = 'inbox', item = null } = {}) {
            openPmDialog(pmState, { place, item });
        },

        async refreshCount() {
            const [topUserInfo, topUserFeed] = await Promise.all([
                TmMessagesModel.fetchTopUserInfo(),
                TmMessagesModel.fetchTopUserFeed(),
            ]);
            setPmCount(getTopUserInfoPmCount(topUserInfo, pmState.count));
            setFeedCount(getTopUserInfoFeedCount(topUserInfo, feedState.count));
            return { topUserInfo, topUserFeed };
        },
    };
}
