import { TmButton } from './tm-button.js';
import { TmInput } from './tm-input.js';

document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: `
/* ── Modal ── */
#tmu-modal-overlay{position:fixed;inset:0;z-index:200000;background:rgba(0,0,0,0.78);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px)}
.tmu-modal{background:linear-gradient(160deg,#1a2e14 0%,#0e1e0a 100%);border:1px solid #4a9030;border-radius:12px;padding:28px 24px 20px;max-width:440px;width:calc(100% - 40px);box-shadow:0 20px 60px rgba(0,0,0,0.9),0 0 0 1px rgba(74,144,48,0.15);color:#c8e0b4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.tmu-modal-icon{font-size:30px;margin-bottom:10px;line-height:1}
.tmu-modal-title{font-size:15px;font-weight:800;color:#e0f0cc;margin-bottom:8px}
.tmu-modal-msg{font-size:12px;color:#90b878;line-height:1.65;margin-bottom:22px}
.tmu-modal-btns{display:flex;flex-direction:column;gap:8px}
.tmu-modal-btn{padding:10px 16px;border-radius:7px;font-size:12px;font-weight:700;cursor:pointer;border:none;transition:all 0.14s;font-family:inherit;text-align:left}
.tmu-modal-btn-primary{background:#3d6828;color:#e8f5d8;border:1px solid #6cc040}
.tmu-modal-btn-primary:hover{background:#4d8030}
.tmu-modal-btn-secondary{background:rgba(61,104,40,0.15);color:#80c050;border:1px solid #3d6828}
.tmu-modal-btn-secondary:hover{background:rgba(61,104,40,0.3)}
.tmu-modal-btn-danger{background:rgba(60,15,5,0.3);color:#a05040;border:1px solid #5a2a1a}
.tmu-modal-btn-danger:hover{background:rgba(80,20,5,0.5);color:#c06050}
.tmu-modal-btn-sub{font-size:10px;font-weight:400;opacity:.7;display:block;margin-top:2px}
.tmu-prompt-field{margin-bottom:14px}
` }));

const htmlOf = (node) => node ? node.outerHTML : '';

const buttonHtml = ({ style = 'secondary', label = '', sub = '', attrs = {} } = {}) => htmlOf(TmButton.button({
    slot: `${label}${sub ? `<span class="tmu-modal-btn-sub">${sub}</span>` : ''}`,
    color: style === 'danger' ? 'danger' : style === 'primary' ? 'primary' : 'secondary',
    size: 'sm',
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
                if (e.target === overlay) { document.removeEventListener('keydown', onKey); closeWith('cancel'); }
            });
            document.addEventListener('keydown', onKey);
            overlay.querySelectorAll('.tmu-modal-btn').forEach(btn =>
                btn.addEventListener('click', () => { document.removeEventListener('keydown', onKey); closeWith(btn.dataset.val); })
            );
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
                if (e.target === overlay) { document.removeEventListener('keydown', onKey); closeWith(null); }
            });
            document.addEventListener('keydown', onKey);
            overlay.querySelector('[data-val="ok"]').addEventListener('click', () => { document.removeEventListener('keydown', onKey); closeWith(getVal() || null); });
            overlay.querySelector('[data-val="cancel"]').addEventListener('click', () => { document.removeEventListener('keydown', onKey); closeWith(null); });
            document.body.appendChild(overlay);
            setTimeout(() => overlay.querySelector('#tmu-prompt-input').focus(), 50);
        });
    },
};
