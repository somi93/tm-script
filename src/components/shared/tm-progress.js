document.head.appendChild(Object.assign(document.createElement('style'), { textContent: `
/* ── Progress bar ── */
.tmu-prog-overlay{position:fixed;top:0;left:0;right:0;z-index:99999;
  background:rgba(20,30,15,0.95);border-bottom:2px solid #6cc040;
  padding:10px 20px;font-family:Arial,sans-serif;color:#e8f5d8;transition:opacity 0.5s}
.tmu-prog-inner{display:flex;align-items:center;gap:12px;max-width:900px;margin:0 auto}
.tmu-prog-title{font-size:14px;font-weight:700;color:#6cc040;white-space:nowrap}
.tmu-prog-track{flex:1;background:rgba(108,192,64,0.15);border-radius:8px;height:18px;
  overflow:hidden;border:1px solid rgba(108,192,64,0.3)}
.tmu-prog-bar{height:100%;width:0%;background:linear-gradient(90deg,#3d6828,#6cc040);
  border-radius:8px;transition:width 0.3s}
.tmu-prog-text{font-size:12px;min-width:180px;text-align:right}
.tmu-prog-inline{width:100%;height:5px;background:#274a18;border-radius:3px;
  margin:8px 0;overflow:hidden}
.tmu-prog-inline .tmu-prog-bar{border-radius:3px;transition:width .4s}
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
                if (t) { t.style.color = '#6cc040'; t.textContent = msg != null ? msg : '✓ Done'; }
                if (!inline) setTimeout(() => {
                    wrap.style.opacity = '0';
                    setTimeout(() => wrap.remove(), 600);
                }, fadeDelay);
            },
            error(msg) {
                const t = txtEl();
                if (t) { t.style.color = '#f87171'; t.textContent = msg; }
                if (!inline) setTimeout(() => wrap.remove(), 4000);
            },
            remove() { wrap.remove(); },
        };
    },
};
