document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Progress bar ── */
.tmu-prog-overlay{position:fixed;top:0;left:0;right:0;z-index:99999;
    background:var(--tmu-surface-input-dark-focus);border-bottom:2px solid var(--tmu-success);
    padding:var(--tmu-space-md) var(--tmu-space-xl);font-family:Arial,sans-serif;color:var(--tmu-text-strong);transition:opacity 0.5s}
.tmu-prog-inner{display:flex;align-items:center;gap:var(--tmu-space-md);max-width:900px;margin:0 auto}
.tmu-prog-title{font-size:14px;font-weight:700;color:var(--tmu-success);white-space:nowrap}
.tmu-prog-track{flex:1;background:var(--tmu-success-fill-soft);border-radius:var(--tmu-space-sm);height:18px;
    overflow:hidden;border:1px solid var(--tmu-border-success)}
.tmu-prog-bar{height:100%;width:0%;background:linear-gradient(90deg,var(--tmu-border-embedded),var(--tmu-success));
    border-radius:var(--tmu-space-sm);transition:width 0.3s}
.tmu-prog-text{font-size:12px;min-width:180px;text-align:right}
.tmu-prog-inline{width:100%;height:5px;background:var(--tmu-surface-tab-active);border-radius:var(--tmu-space-xs);
    margin:var(--tmu-space-sm) 0;overflow:hidden}
.tmu-prog-inline .tmu-prog-bar{border-radius:var(--tmu-space-xs);transition:width .4s}
` }));

/**
 * Create a progress bar.
 *
 * @param {object}         [opts]
 * @param {string}         [opts.title]     — label shown at the left (default: '⚡ Processing')
 * @param {boolean}        [opts.inline]    — true: slim inline bar (append to container); false: fixed top overlay
 * @param {HTMLElement}    [opts.container] — required when inline:true; bar is appended here
 * @param {number}         [opts.fadeDelay] — ms before overlay auto-hides after done() (default: 2500)
 * @returns {{ update(current, total, label?): void, done(msg?): void, error(msg): void, remove(): void }}
 */
export const TmProgress = {
    progressBar({ title = '⚡ Processing', inline = false, container = null, fadeDelay = 2500 } = {}) {
        const wrap = document.createElement('div');

        if (inline) {
            wrap.className = 'tmu-prog-inline';
            wrap.innerHTML = '<div class="tmu-prog-bar"></div>';
            if (container) container.appendChild(wrap);
        } else {
            wrap.className = 'tmu-prog-overlay';
            wrap.innerHTML =
                `<div class="tmu-prog-inner">` +
                `<div class="tmu-prog-title">${title}</div>` +
                `<div class="tmu-prog-track"><div class="tmu-prog-bar"></div></div>` +
                `<div class="tmu-prog-text">Initializing...</div>` +
                `</div>`;
            document.body.appendChild(wrap);
        }

        const barEl = () => wrap.querySelector('.tmu-prog-bar');
        const txtEl = () => wrap.querySelector('.tmu-prog-text');

        return {
            update(current, total, label) {
                const pct = total > 0 ? Math.round((current / total) * 100) : 0;
                const b = barEl();
                if (b) b.style.width = pct + '%';
                const t = txtEl();
                if (t) t.textContent = label != null ? label : `${current}/${total}`;
            },
            done(msg) {
                const b = barEl(), t = txtEl();
                if (b) b.style.width = '100%';
                if (t) { t.style.color = 'var(--tmu-success)'; t.textContent = msg != null ? msg : '✓ Done'; }
                if (!inline) setTimeout(() => {
                    wrap.style.opacity = '0';
                    setTimeout(() => wrap.remove(), 600);
                }, fadeDelay);
            },
            error(msg) {
                const t = txtEl();
                if (t) { t.style.color = 'var(--tmu-danger)'; t.textContent = msg; }
                if (!inline) setTimeout(() => wrap.remove(), 4000);
            },
            remove() { wrap.remove(); },
        };
    },
};
