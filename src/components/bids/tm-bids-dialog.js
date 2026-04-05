import { TmUI } from '../shared/tm-ui.js';
import { TmButton } from '../shared/tm-button.js';
import { TmPosition } from '../../lib/tm-position.js';
import { TmTransferService } from '../../services/transfer.js';
import { TmPlayerPhoto } from '../player/tm-player-photo.js';
import { TmShortlistService } from '../../services/shortlist.js';
import { TmAlert } from '../shared/tm-alert.js';

'use strict';

const STYLE_ID = 'tmvu-bids-dialog-style';
const DIALOG_ID = 'tmvu-bids-dialog-overlay';
const CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

let activeBidDialog = null;

function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderFlag(countryCode) {
    return countryCode ? `<ib class="tmvu-bids-flag flag-img-${escapeHtml(countryCode)}"></ib>` : '';
}

function getOwnClubId() {
    return cleanText(window.SESSION?.main_id || window.SESSION?.club_id || window.SESSION?.id);
}

function formatBidValue(value) {
    const text = cleanText(value);
    if (!text) return '-';
    const digits = text.replace(/[^\d]/g, '');
    if (!digits) return text;
    const number = Number(digits);
    return Number.isFinite(number) ? new Intl.NumberFormat('en-US').format(number) : text;
}

function formatCountdown(totalSeconds) {
    const value = Math.max(0, Number(totalSeconds) || 0);
    const days = Math.floor(value / 86400);
    const hours = Math.floor((value % 86400) / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        body.tmvu-bids-dialog-open { overflow: hidden; }
        .tmvu-bids-overlay { position: fixed; inset: 0; z-index: 200100; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(2,7,10,.82); backdrop-filter: blur(4px); }
        .tmvu-bids-card { width: min(580px, calc(100vw - 48px)); max-height: calc(100vh - 48px); display: flex; flex-direction: column; margin: 0; overflow: hidden; background: var(--tmu-color-base); }
        .tmvu-bids-card > .tmu-card-head { flex-shrink: 0; background: var(--tmu-surface-card-soft); }
        .tmvu-bids-card > .tmu-card-body { overflow-y: auto; flex: 1 1 auto; }
        .tmvu-bids-dialog-top { display: grid; grid-template-columns: minmax(0, 1fr) 160px; gap: var(--tmu-space-xl); align-items: start; }
        .tmvu-bids-dialog-deadline { text-align: center; }
        .tmvu-bids-dialog-player-body { display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: var(--tmu-space-md); align-items: start; }
        .tmvu-bids-dialog-player-main { min-width: 0; display: flex; flex-direction: column; gap: var(--tmu-space-sm); }
        .tmvu-bids-dialog-name-row { display: flex; align-items: center; gap: var(--tmu-space-xs); flex-wrap: wrap; }
        .tmvu-bids-dialog-form { display: flex; flex-direction: column; gap: var(--tmu-space-md); }
        .tmvu-bids-dialog-bid-input { width: 100%; }
        .tmvu-bids-dialog-actions { padding-top: var(--tmu-space-sm); }
        .tmvu-bids-dialog-countdown { font-size: var(--tmu-font-xl); font-weight: 900; font-variant-numeric: tabular-nums; color: var(--tmu-text-strong); letter-spacing: -.02em; line-height: 1.1; margin: var(--tmu-space-xs) 0; }
        .tmvu-bids-dialog-history { list-style: none; padding: 0; margin: 0; }
        .tmvu-bids-dialog-error { color: var(--tmu-danger); }
    `;

    document.head.appendChild(style);
}

function renderBidHistory(history = []) {
    const real = (history || []).filter(e => {
        const n = cleanText(e.club_name || '').toUpperCase();
        return n && n !== 'NO BIDS' && n !== 'NO BID';
    });
    if (!real.length) return '<p class="tmu-note" style="margin:0;">No bids placed yet.</p>';
    return `<ul class="tmvu-bids-dialog-history" id="tlpop_history">
        ${real.map(e => `<li><tm-stat data-label="${escapeHtml(cleanText(e.club_name))}" data-value="${escapeHtml(formatBidValue(e.bid))}"></tm-stat></li>`).join('')}
    </ul>`;
}

function createBidDialogMarkup(detail, row) {
    const player = detail?.p || {};
    const transfer = detail?.transfer || {};
    const status = detail?.current_status || {};
    const playerId = cleanText(player.player_id || player.id || row.id);
    const playerName = cleanText(transfer.player_name || row.name);
    const countryCode = cleanText(player.player_country || player.nationalitet || row.countryCode).toLowerCase();
    const timeLeft = Number.isFinite(Number(detail?.deadline)) ? formatCountdown(Number(detail.deadline)) : cleanText(row.timeLeft);
    const minimumBid = formatBidValue(transfer.next_bid || row.bid);
    const currentBid = formatBidValue(row.bid);
    const age = cleanText(player.ageMonthsString || player.age || row.age);
    // TM bids API sends short-form fp like "M", "F", "DM" — expand to POSITION_MAP keys
    const FP_EXPAND = { d: 'dc', dm: 'dmc', m: 'mc', om: 'omc', f: 'fc' };
    const normFp = (raw) => (raw || '').split(',')
        .map(p => { const k = p.trim().replace(/\s+/g, '').toLowerCase(); return FP_EXPAND[k] || k; })
        .filter(Boolean);
    // Only use player.positions if it contains rich objects (with color/id from playerdb)
    const hasRichPositions = Array.isArray(player.positions) && player.positions.length && typeof player.positions[0] === 'object';
    const rawPositions = hasRichPositions ? player.positions : (player.fp ? normFp(player.fp) : null);
    const posChips = rawPositions ? TmPosition.chip(rawPositions) : '';
    const showBidForm = row.sectionTitle !== 'My Players';
    const shortlistAction = detail?.shortlist?.id ? 'unshortlist' : 'shortlist';
    const shortlistLabel = detail?.shortlist?.id ? 'Remove From Shortlist' : 'Add To Shortlist';
    const photoHtml = TmPlayerPhoto.html({ imageHtml: detail?.player_image, alt: playerName, size: 88 });

    return `
        <div class="tmvu-bids-dialog-top">
            <div class="tmvu-bids-dialog-player-body">
                ${photoHtml}
                <div class="tmvu-bids-dialog-player-main">
                    <div class="tmvu-bids-dialog-name-row">
                        <a href="${escapeHtml(row.href)}" target="_blank" rel="noopener noreferrer" class="tmu-text-strong" style="font-size:var(--tmu-font-lg);font-weight:800;color:inherit;text-decoration:none;">${escapeHtml(playerName)}</a>
                        ${renderFlag(countryCode)}
                    </div>
                    <div style="display:flex;align-items:baseline;gap:var(--tmu-space-sm);flex-wrap:wrap;">
                        ${posChips}
                        ${age ? `<span class="tmu-note" style="margin:0;">${escapeHtml(age)} years</span>` : ''}
                    </div>
                    <div>
                        <tm-button data-action="${shortlistAction}" data-variant="secondary" data-size="sm">${escapeHtml(shortlistLabel)}</tm-button>
                    </div>
                </div>
            </div>
            <div class="tmvu-bids-dialog-deadline">
                <p class="tmu-kicker" style="margin:0 0 var(--tmu-space-xs);">Deadline</p>
                <div id="tl_pop_countdown" class="tmvu-bids-dialog-countdown">${escapeHtml(timeLeft || '-')}</div>
                <p class="tmu-note" style="margin:0;">Time remaining</p>
            </div>
        </div>

        <tm-divider></tm-divider>

        <div>
            <p class="tmu-kicker" style="margin:0 0 var(--tmu-space-md);">${showBidForm ? 'Place Bid' : 'Listing Snapshot'}</p>
            <div id="tlpop_form">
                ${showBidForm ? `
                    <form id="transfer_bid_form" class="tmvu-bids-dialog-form" onsubmit="return false;">
                        <input type="hidden" value="${escapeHtml(minimumBid)}" name="min_bid" id="min_bid">
                        <input type="hidden" value="${escapeHtml(playerName)}" id="bid_player_name">
                        <div data-ref="bidInputMount"></div>
                        <p id="min_bid_text" class="tmu-note" style="margin:var(--tmu-space-xs) 0 0;">Minimum bid is <strong id="minbid">${escapeHtml(minimumBid)}</strong></p>
                        <div data-ref="agentMount"></div>
                        <div class="tmvu-bids-dialog-actions">
                            <div data-ref="primaryActionMount"></div>
                            <div data-ref="proActionMount"></div>
                        </div>
                    </form>
                ` : `
                    <tm-stat data-label="Current Bid" data-value="${escapeHtml(currentBid)}"></tm-stat>
                    <tm-stat data-label="Next Bid" data-value="${escapeHtml(minimumBid)}"></tm-stat>
                    <tm-stat data-label="Expires" data-value="${escapeHtml(cleanText(row.timeLeft))}"></tm-stat>
                `}
            </div>
        </div>
        <div id="tlpop_status" style="display:none;"></div>

        <tm-divider></tm-divider>

        <div>
            <p class="tmu-kicker" style="margin:0 0 var(--tmu-space-sm);">Bid History</p>
            <div id="tlpop_hischat">${renderBidHistory(detail?.bid_history || [])}</div>
        </div>

        <div id="transfer_channel" style="display:none;">transfer_player_${escapeHtml(playerId)}</div>
        <div id="this_player_id" style="display:none;">${escapeHtml(playerId)}</div>
    `;
}

function mountFormControls(dialogBody, detail, row, playerId) {
    const transfer = detail?.transfer || {};
    const minimumBid = formatBidValue(transfer.next_bid || row.bid);
    const playerName = cleanText(transfer.player_name || row.name);

    const bidInputMount = dialogBody.querySelector('[data-ref="bidInputMount"]');
    if (bidInputMount) {
        const bidInput = TmUI.input({
            id: 'transfer_bid',
            name: 'transfer_bid',
            size: 'full',
            tone: 'overlay',
            density: 'comfy',
            grow: true,
            cls: 'tmvu-bids-dialog-bid-input',
            value: minimumBid,
            autocomplete: 'off',
        });
        const syncNativeValidation = () => {
            window.update_transfer_radio?.(bidInput);
            window.check_bid_size?.();
        };
        bidInput.addEventListener('input', syncNativeValidation);
        bidInput.addEventListener('change', syncNativeValidation);
        bidInputMount.appendChild(bidInput);
    }

    const agentMount = dialogBody.querySelector('[data-ref="agentMount"]');
    if (agentMount) {
        agentMount.appendChild(TmUI.checkboxField({
            id: 'transfer_agent',
            value: 1,
            checked: false,
            disabled: !detail?.is_pro,
            label: `Put transfer agent on ${playerName}`,
        }));
        if (!detail?.is_pro) {
            const note = document.createElement('p');
            note.className = 'tmu-note';
            note.style.margin = 'var(--tmu-space-xs) 0 0';
            note.textContent = 'Transfer agent is a PRO feature.';
            agentMount.appendChild(note);
        }
    }

    const primaryActionMount = dialogBody.querySelector('[data-ref="primaryActionMount"]');
    if (primaryActionMount) {
        primaryActionMount.appendChild(TmUI.button({
            id: 'tlpop_bid_button',
            label: 'Make Bid',
            color: 'primary',
            size: 'md',
            block: true,
            onClick: () => {
                if (typeof window.tlpop_post_transfer_bid === 'function') {
                    window.tlpop_post_transfer_bid(playerId);
                    return;
                }
                if (typeof window.post_transfer_bid === 'function') window.post_transfer_bid(playerId);
            },
        }));
    }

    const proActionMount = dialogBody.querySelector('[data-ref="proActionMount"]');
    if (proActionMount) {
        const proButton = TmUI.button({
            id: 'tlpop_bid_button_pro',
            label: 'Make Bid',
            color: 'secondary',
            size: 'md',
            block: true,
            onClick: () => window.post_transfer_bid?.(playerId),
        });
        proButton.style.display = 'none';
        proActionMount.appendChild(proButton);
    }
}

function closeBidDialog() {
    if (!activeBidDialog) return;
    activeBidDialog.cleanup?.();
    activeBidDialog = null;
}

function openBidDialog(row, opts = {}) {
    const sessionId = getOwnClubId();
    if (!row?.id || !sessionId) return;

    injectStyles();
    closeBidDialog();

    // Backdrop
    const overlay = document.createElement('div');
    overlay.className = 'tmvu-bids-overlay';
    overlay.id = DIALOG_ID;

    // The dialog IS one card — backdrop → card (head: title+close, body: sections)
    const card = document.createElement('div');
    card.className = 'tmu-card tmvu-bids-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-label', `Transfer bid — ${cleanText(row.name)}`);

    const head = document.createElement('div');
    head.className = 'tmu-card-head';
    const titleEl = document.createElement('span');
    titleEl.textContent = cleanText(row.name);
    head.appendChild(titleEl);
    const closeBtn = TmButton.button({
        variant: 'icon', icon: CLOSE_ICON, color: 'secondary', size: 'sm', shape: 'full',
        attrs: { 'aria-label': 'Close' },
    });
    head.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = 'tmu-card-body';
    body.innerHTML = TmUI.loading(`Loading ${escapeHtml(row.name)}...`, true);

    card.appendChild(head);
    card.appendChild(body);
    overlay.appendChild(card);

    const close = () => closeBidDialog();
    const onKey = (e) => { if (e.key === 'Escape') close(); };

    document.body.classList.add('tmvu-bids-dialog-open');
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey);
    closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    activeBidDialog = {
        overlay,
        cleanup: () => {
            document.removeEventListener('keydown', onKey);
            document.body.classList.remove('tmvu-bids-dialog-open');
            overlay.remove();
        },
    };

    TmTransferService.fetchTransferBidDialog(row.id, sessionId).then(detail => {
        if (activeBidDialog?.overlay !== overlay) return;

        if (!detail?.p) {
            body.innerHTML = '<p class="tmvu-bids-dialog-error">Failed to load transfer bid details.</p>';
            return;
        }

        const playerId = cleanText(detail?.p?.player_id || detail?.p?.id || row.id);

        async function handleShortlistToggle(btn, removing) {
            const savedHtml = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="tmu-spinner tmu-spinner-sm"></span>';
            const result = removing
                ? await TmShortlistService.removeFromShortlist(playerId)
                : await TmShortlistService.addToShortlist(playerId);
            btn.disabled = false;
            if (result !== null) {
                if (removing) {
                    TmAlert.show({ message: 'Player removed from shortlist', tone: 'success' });
                    opts.onRemoved?.(playerId);
                    close();
                    return;
                } else {
                    btn.dataset.action = 'unshortlist';
                    btn.textContent = 'Remove From Shortlist';
                    TmAlert.show({ message: 'Player added to shortlist', tone: 'success' });
                }
            } else {
                btn.innerHTML = savedHtml;
                TmAlert.show({ message: 'Action failed. Please try again.', tone: 'error' });
            }
        }

        TmUI.render(body, createBidDialogMarkup(detail, row), {
            shortlist: function() { handleShortlistToggle(this, false); },
            unshortlist: function() { handleShortlistToggle(this, true); },
        });

        if (row.sectionTitle !== 'My Players') {
            mountFormControls(body, detail, row, playerId);
        }

        const countdownEl = body.querySelector('#tl_pop_countdown');
        let remaining = Number(detail?.deadline) || 0;
        let countdownTimer = null;

        if (countdownEl && remaining > 0) {
            countdownTimer = window.setInterval(() => {
                remaining = Math.max(0, remaining - 1);
                countdownEl.textContent = formatCountdown(remaining);
                if (remaining <= 0) { window.clearInterval(countdownTimer); countdownTimer = null; }
            }, 1000);
        }

        const previousCleanup = activeBidDialog.cleanup;
        activeBidDialog.cleanup = () => {
            if (countdownTimer) window.clearInterval(countdownTimer);
            previousCleanup?.();
        };
    });
}

export const TmBidsDialog = {
    open: openBidDialog,
    close: closeBidDialog,
};
