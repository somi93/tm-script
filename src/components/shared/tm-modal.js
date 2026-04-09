import { TmButton } from './tm-button.js';
import { TmInput } from './tm-input.js';

document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: `
/* ── Modal ── */
#tmu-modal-overlay{position:fixed;inset:0;z-index:200000;background:var(--tmu-surface-overlay-strong);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)}
.tmu-modal{background:var(--tmu-color-accent);border:1px solid var(--tmu-border-success);border-radius:var(--tmu-space-md);padding:var(--tmu-space-xxl) var(--tmu-space-xxl) var(--tmu-space-xl);max-width:440px;width:calc(100% - 40px);box-shadow:0 20px 60px var(--tmu-shadow-panel),0 0 0 1px var(--tmu-success-fill-soft);color:var(--tmu-text-main);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.tmu-modal-icon{font-size:var(--tmu-font-3xl);margin-bottom:var(--tmu-space-md);line-height:1}
.tmu-modal-title{font-size:var(--tmu-font-md);font-weight:800;color:var(--tmu-text-strong);margin-bottom:var(--tmu-space-sm)}
.tmu-modal-msg{font-size:var(--tmu-font-sm);color:var(--tmu-text-muted);line-height:1.65;margin-bottom:var(--tmu-space-xl)}
.tmu-modal-btns{display:flex;flex-direction:column;gap:var(--tmu-space-sm)}
.tmu-modal-btn-sub{font-size:var(--tmu-font-xs);font-weight:400;opacity:.7;display:block;margin-top:var(--tmu-space-xs)}
.tmu-prompt-field{margin-bottom:var(--tmu-space-lg)}
` }));

const htmlOf = (node) => node ? node.outerHTML : '';

const buttonHtml = ({ style = 'secondary', size = 'sm', selected = false, label = '', sub = '', attrs = {} } = {}) => htmlOf(TmButton.button({
    slot: `${label}${sub ? `<span class="tmu-modal-btn-sub">${sub}</span>` : ''}`,
    color: style === 'danger' ? 'danger' : style === 'primary' ? 'primary' : 'secondary',
    size,
    active: selected,
    cls: `tmu-modal-btn tmu-modal-btn-${style}`,
    attrs,
}));

const inputHtml = (opts = {}) => htmlOf(TmInput.input({
    size: 'full',
    density: 'comfy',
    tone: 'overlay',
    grow: true,
    ...opts,
}));

export const TmModal = {
    modal({ icon, title, message, buttons }) {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.id = 'tmu-modal-overlay';
            overlay.innerHTML =
                `<div class="tmu-modal">` +
                `<div class="tmu-modal-icon">${icon || ''}</div>` +
                `<div class="tmu-modal-title">${title}</div>` +
                `<div class="tmu-modal-msg">${message}</div>` +
                `<div class="tmu-modal-btns">${buttons.map(b =>
                    buttonHtml({
                        style: b.style || 'secondary',
                        size: b.size || 'sm',
                        selected: Boolean(b.selected),
                        label: b.label,
                        sub: b.sub,
                        attrs: { 'data-val': b.value },
                    })
                ).join('')}</div></div>`;
            const closeWith = val => { overlay.remove(); resolve(val); };
            const onKey = e => {
                if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeWith('cancel'); }
            };
            overlay.addEventListener('click', e => {
                if (e.target === overlay) {
                    document.removeEventListener('keydown', onKey);
                    closeWith('cancel');
                    return;
                }

                const button = e.target.closest('.tmu-modal-btn');
                if (!button || !overlay.contains(button)) return;
                document.removeEventListener('keydown', onKey);
                closeWith(button.dataset.val);
            });
            document.addEventListener('keydown', onKey);
            document.body.appendChild(overlay);
        });
    },

    prompt({ icon, title, placeholder, defaultValue }) {
        return new Promise(resolve => {
            const overlay = document.createElement('div');
            overlay.id = 'tmu-modal-overlay';
            const esc = s => (s || '').replace(/"/g, '&quot;');
            overlay.innerHTML =
                `<div class="tmu-modal">` +
                `<div class="tmu-modal-icon">${icon || ''}</div>` +
                `<div class="tmu-modal-title">${title}</div>` +
                `<div class="tmu-prompt-field">${inputHtml({ id: 'tmu-prompt-input', type: 'text', placeholder: esc(placeholder), value: esc(defaultValue) })}</div>` +
                `<div class="tmu-modal-btns">` +
                buttonHtml({ style: 'primary', label: '💾 Save', attrs: { 'data-val': 'ok' } }) +
                buttonHtml({ style: 'danger', label: 'Cancel', attrs: { 'data-val': 'cancel' } }) +
                `</div></div>`;
            const getVal = () => overlay.querySelector('#tmu-prompt-input').value.trim();
            const closeWith = val => { overlay.remove(); resolve(val); };
            const onKey = e => {
                if (e.key === 'Escape') { document.removeEventListener('keydown', onKey); closeWith(null); }
                if (e.key === 'Enter') { document.removeEventListener('keydown', onKey); closeWith(getVal() || null); }
            };
            overlay.addEventListener('click', e => {
                if (e.target === overlay) {
                    document.removeEventListener('keydown', onKey);
                    closeWith(null);
                    return;
                }

                const button = e.target.closest('.tmu-modal-btn');
                if (!button || !overlay.contains(button)) return;
                document.removeEventListener('keydown', onKey);
                closeWith(button.dataset.val === 'ok' ? (getVal() || null) : null);
            });
            document.addEventListener('keydown', onKey);
            document.body.appendChild(overlay);
            setTimeout(() => overlay.querySelector('#tmu-prompt-input').focus(), 50);
        });
    },

    open({ title, contentEl, maxWidth = '440px' } = {}) {
        const overlay = document.createElement('div');
        overlay.id = 'tmu-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'tmu-modal';
        modal.style.padding = '0';
        modal.style.maxWidth = maxWidth;

        if (title) {
            const titleEl = document.createElement('div');
            titleEl.className = 'tmu-modal-title';
            titleEl.style.padding = 'var(--tmu-space-md) var(--tmu-space-lg)';
            titleEl.textContent = title;
            modal.appendChild(titleEl);
        }

        modal.appendChild(contentEl);
        overlay.appendChild(modal);

        const destroy = () => {
            document.removeEventListener('keydown', onKey);
            overlay.remove();
        };
        const onKey = e => { if (e.key === 'Escape') destroy(); };
        overlay.addEventListener('click', e => { if (e.target === overlay) destroy(); });
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);

        return { destroy };
    },
};
