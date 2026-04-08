const STYLE_ID = 'tmu-alert-style';
const HOST_ID = 'tmu-alert-host';
const CLOSE_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

const CSS = `
#tmu-alert-host {
    position: fixed;
    bottom: var(--tmu-space-xl, 24px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 300000;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    gap: var(--tmu-space-sm, 6px);
    pointer-events: none;
}
.tmu-alert {
    display: flex;
    align-items: center;
    gap: var(--tmu-space-sm, 6px);
    padding: var(--tmu-space-sm, 6px) var(--tmu-space-md, 10px);
    border-radius: var(--tmu-space-md, 10px);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: var(--tmu-font-sm, 13px);
    font-weight: 700;
    box-shadow: 0 4px 24px rgba(0,0,0,.4);
    pointer-events: auto;
    max-width: min(440px, calc(100vw - 48px));
    border: 1px solid transparent;
    animation: tmu-alert-in 0.2s ease;
}
.tmu-alert-success { background: var(--tmu-success); color: var(--tmu-text-inverse); border-color: transparent; }
.tmu-alert-error   { background: var(--tmu-danger-fill);  color: var(--tmu-danger);           border-color: var(--tmu-border-danger); }
.tmu-alert-info    { background: var(--tmu-surface-card-soft); color: var(--tmu-text-main);   border-color: var(--tmu-border-soft); }
.tmu-alert-warning { background: var(--tmu-surface-card-soft); color: var(--tmu-warning);     border-color: var(--tmu-border-soft); }
.tmu-alert-text { flex: 1; min-width: 0; }
.tmu-alert-close {
    flex-shrink: 0;
    background: none; border: none; cursor: pointer;
    padding: 2px; color: inherit; opacity: 0.6; line-height: 1;
    border-radius: 4px;
    transition: opacity 0.15s;
}
.tmu-alert-close:hover { opacity: 1; }
@keyframes tmu-alert-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
}
`;

function ensureHost() {
    if (!document.getElementById(STYLE_ID)) {
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = CSS;
        document.head.appendChild(style);
    }
    let host = document.getElementById(HOST_ID);
    if (!host) {
        host = document.createElement('div');
        host.id = HOST_ID;
        document.body.appendChild(host);
    }
    return host;
}

export const TmAlert = {
    /**
     * Show a toast notification.
     * @param {object}  opts
     * @param {string}  opts.message
     * @param {'success'|'error'|'info'|'warning'} [opts.tone='info']
     * @param {number}  [opts.duration=4000]  ms before auto-dismiss; 0 = never
     */
    show({ message, tone = 'info', duration = 4000 } = {}) {
        const host = ensureHost();

        const el = document.createElement('div');
        el.className = `tmu-alert tmu-alert-${tone}`;
        el.setAttribute('role', 'alert');

        const textEl = document.createElement('span');
        textEl.className = 'tmu-alert-text';
        textEl.textContent = String(message || '');

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'tmu-alert-close';
        closeBtn.setAttribute('aria-label', 'Dismiss');
        closeBtn.innerHTML = CLOSE_SVG;

        const dismiss = () => el.remove();
        closeBtn.addEventListener('click', dismiss);

        el.appendChild(textEl);
        el.appendChild(closeBtn);
        host.appendChild(el);

        if (duration > 0) {
            const t = setTimeout(dismiss, duration);
            closeBtn.addEventListener('click', () => clearTimeout(t), { once: true });
        }
    },
};
