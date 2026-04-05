import { TmButton } from './tm-button.js';

'use strict';

const STYLE_ID = 'tmu-overlay-dialog-style';
const CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmu-overlay-dialog-overlay {
            position: fixed;
            inset: 0;
            z-index: 200100;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background: color-mix(in srgb, var(--tmu-surface-overlay-strong) 86%, #02070a 14%);
            backdrop-filter: blur(8px);
        }

        .tmu-overlay-dialog {
            width: min(var(--tmu-overlay-dialog-width, 980px), calc(100vw - 48px));
            max-height: calc(100vh - 48px);
            overflow: auto;
            border: 1px solid var(--tmu-border-soft-alpha-strong);
            border-radius: calc(var(--tmu-space-lg) + var(--tmu-space-xs));
            background:
                radial-gradient(circle at top right, color-mix(in srgb, var(--tmu-accent) 16%, transparent) 0%, transparent 32%),
                radial-gradient(circle at top left, color-mix(in srgb, var(--tmu-info) 12%, transparent) 0%, transparent 30%),
                linear-gradient(180deg, color-mix(in srgb, var(--tmu-surface-panel) 92%, #09131a 8%) 0%, color-mix(in srgb, var(--tmu-surface-card) 94%, #071116 6%) 100%);
            box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42);
        }

        .tmu-overlay-dialog-body {
            padding: var(--tmu-space-xl);
        }

        .tmu-overlay-dialog-head {
            position: sticky;
            top: 0;
            z-index: 4;
            display: flex;
            justify-content: flex-end;
            padding: var(--tmu-space-lg) var(--tmu-space-lg) 0;
            pointer-events: none;
        }

        .tmu-overlay-dialog-head--titled {
            justify-content: space-between;
            align-items: center;
            padding: 0 var(--tmu-space-lg);
            min-height: 52px;
            border-bottom: 1px solid var(--tmu-border-soft-alpha);
            pointer-events: auto;
        }

        .tmu-overlay-dialog-title {
            font-size: var(--tmu-font-md);
            font-weight: 800;
            color: var(--tmu-text-strong);
            letter-spacing: .02em;
        }

        .tmu-overlay-dialog-close {
            pointer-events: auto;
            color: var(--tmu-text-faint);
        }

        .tmu-overlay-dialog-close:hover {
            color: var(--tmu-text-strong);
        }
    `;

    document.head.appendChild(style);
}

function create({ width = '980px', dialogClass = '', bodyClass = '', closeLabel = 'Close', title = '' } = {}) {
    injectStyles();

    const overlay = document.createElement('div');
    overlay.className = 'tmu-overlay-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = `tmu-overlay-dialog${dialogClass ? ` ${dialogClass}` : ''}`;
    dialog.style.setProperty('--tmu-overlay-dialog-width', width);
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');

    const head = document.createElement('div');
    head.className = `tmu-overlay-dialog-head${title ? ' tmu-overlay-dialog-head--titled' : ''}`;

    if (title) {
        const titleEl = document.createElement('span');
        titleEl.className = 'tmu-overlay-dialog-title';
        titleEl.textContent = title;
        head.appendChild(titleEl);
    }

    const closeBtn = TmButton.button({
        variant: 'icon',
        icon: CLOSE_ICON,
        color: 'secondary',
        size: 'sm',
        shape: 'full',
        cls: 'tmu-overlay-dialog-close',
        title: closeLabel,
        attrs: { 'aria-label': closeLabel },
    });
    head.appendChild(closeBtn);

    const body = document.createElement('div');
    body.className = `tmu-overlay-dialog-body${bodyClass ? ` ${bodyClass}` : ''}`;

    dialog.appendChild(head);
    dialog.appendChild(body);
    overlay.appendChild(dialog);

    return { overlay, dialog, body, closeBtn };
}

export const TmOverlayDialog = { create };