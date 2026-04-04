import { applyTheme, getSavedThemeId } from './tm-theme.js';

const DIALOG_ROOT_ID = 'tmu-theme-dialog-root';

const THEMES_META = [
    {
        id: 'green',
        name: 'Trophy Green',
        primary: '#00fea7',
        bg: '#001012',
        nav: '#0a1614',
    },
    {
        id: 'blue',
        name: 'Sports Red',
        primary: '#ff0046',
        bg: '#00141e',
        nav: '#001e28',
    },
];

function buildDialogCss() {
    return [
        '#tmu-td-overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:99999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px)}',
        '#tmu-td-overlay[hidden]{display:none!important}',
        '#tmu-td-dialog{background:radial-gradient(ellipse 80% 60% at 50% 0%,var(--tmu-success-fill-soft) 0%,transparent 70%),linear-gradient(180deg,var(--tmu-color-surface) 0%,var(--tmu-color-base) 100%);border:1px solid var(--tmu-border-soft-alpha-mid);border-radius:12px;box-shadow:0 24px 60px rgba(0,0,0,.6);width:340px;max-width:calc(100vw - 32px);overflow:hidden;font-family:"IBM Plex Sans","Segoe UI",sans-serif}',
        '.tmu-td-head{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:linear-gradient(180deg,var(--tmu-success-fill-soft),var(--tmu-success-fill-faint));border-bottom:1px solid var(--tmu-border-soft-alpha)}',
        '.tmu-td-head-title{font-size:var(--tmu-font-md);font-weight:700;color:var(--tmu-text-inverse);margin:0}',
        '.tmu-td-close{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:transparent;border:none;border-radius:4px;color:var(--tmu-text-muted);cursor:pointer;font-size:13px;padding:0;transition:background .15s,color .15s;line-height:1}',
        '.tmu-td-close:hover{background:var(--tmu-surface-item-strong);color:var(--tmu-text-inverse)}',
        '.tmu-td-body{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px}',
        '.tmu-td-card{background:var(--tmu-color-surface);border:2px solid var(--tmu-border-soft-alpha);border-radius:8px;cursor:pointer;padding:0;overflow:hidden;transition:border-color .2s,box-shadow .2s;text-align:left;display:block;width:100%}',
        '.tmu-td-card:hover{border-color:var(--tmu-border-soft-alpha-mid);box-shadow:0 4px 16px rgba(0,0,0,.3)}',
        '.tmu-td-card.is-active{border-color:var(--tmu-border-embedded);box-shadow:0 0 0 3px var(--tmu-success-fill-soft)}',
        '.tmu-td-preview{width:100%;height:64px;overflow:hidden;display:flex;flex-direction:column}',
        '.tmu-td-pnav{height:14px;flex:0 0 auto;display:flex;align-items:center;gap:3px;padding:0 6px}',
        '.tmu-td-pdot{width:18px;height:3px;border-radius:2px}',
        '.tmu-td-pbody{flex:1;padding:5px}',
        '.tmu-td-pcard{border-radius:3px;padding:4px;height:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:2px;background:var(--tmu-color-surface)}',
        '.tmu-td-prow{height:6px;border-radius:2px;background:rgba(255,255,255,.08)}',
        '.tmu-td-info{padding:8px 10px;border-top:1px solid rgba(255,255,255,.06)}',
        '.tmu-td-name{display:block;font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-strong)}',
        '.tmu-td-active-label{display:block;font-size:var(--tmu-font-2xs);color:var(--tmu-color-primary);margin-top:2px;text-transform:uppercase;letter-spacing:.06em}',
    ].join('');
}

function buildThemeCard(theme, isActive) {
    return `<button class="tmu-td-card${isActive ? ' is-active' : ''}" data-td-theme="${theme.id}" type="button">
        <div class="tmu-td-preview" style="background:${theme.bg}">
            <div class="tmu-td-pnav" style="background:${theme.nav};border-bottom:2px solid ${theme.primary}">
                <div class="tmu-td-pdot" style="background:${theme.primary};opacity:.7"></div>
                <div class="tmu-td-pdot" style="background:${theme.primary};opacity:.4"></div>
                <div class="tmu-td-pdot" style="background:${theme.primary};opacity:.2"></div>
            </div>
            <div class="tmu-td-pbody" style="background:${theme.bg}">
                <div class="tmu-td-pcard">
                    <div class="tmu-td-prow" style="background:${theme.primary};opacity:.3;width:58%"></div>
                    <div class="tmu-td-prow"></div>
                    <div class="tmu-td-prow" style="width:80%"></div>
                </div>
            </div>
        </div>
        <div class="tmu-td-info">
            <span class="tmu-td-name">${theme.name}</span>
            ${isActive ? '<span class="tmu-td-active-label">Active</span>' : ''}
        </div>
    </button>`;
}

function buildDialogHtml(activeId) {
    return `<div id="tmu-td-overlay" hidden role="dialog" aria-modal="true" aria-label="Choose Theme">
        <div id="tmu-td-dialog">
            <div class="tmu-td-head">
                <h2 class="tmu-td-head-title">Theme</h2>
                <button class="tmu-td-close" type="button" aria-label="Close">✕</button>
            </div>
            <div class="tmu-td-body">
                ${THEMES_META.map(t => buildThemeCard(t, t.id === activeId)).join('')}
            </div>
        </div>
    </div>`;
}

export const TmThemeDialog = {
    _mounted: false,

    mount() {
        if (this._mounted || document.getElementById(DIALOG_ROOT_ID)) return;
        this._mounted = true;

        const style = document.createElement('style');
        style.id = 'tmu-theme-dialog-style';
        style.textContent = buildDialogCss();
        document.head.appendChild(style);

        const wrap = document.createElement('div');
        wrap.id = DIALOG_ROOT_ID;
        wrap.innerHTML = buildDialogHtml(getSavedThemeId());
        document.body.appendChild(wrap);

        const overlay = wrap.querySelector('#tmu-td-overlay');

        overlay.addEventListener('click', e => {
            if (e.target === overlay) this.close();
        });

        wrap.querySelector('.tmu-td-close').addEventListener('click', () => this.close());

        wrap.querySelectorAll('[data-td-theme]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-td-theme');
                applyTheme(id);
                wrap.querySelectorAll('[data-td-theme]').forEach(b => {
                    const isNow = b.getAttribute('data-td-theme') === id;
                    b.classList.toggle('is-active', isNow);
                    const info = b.querySelector('.tmu-td-info');
                    if (info) {
                        const existing = info.querySelector('.tmu-td-active-label');
                        if (isNow && !existing) {
                            const lbl = document.createElement('span');
                            lbl.className = 'tmu-td-active-label';
                            lbl.textContent = 'Active';
                            info.appendChild(lbl);
                        } else if (!isNow && existing) {
                            existing.remove();
                        }
                    }
                });
                this.close();
            });
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.close();
        });
    },

    open() {
        document.getElementById('tmu-td-overlay')?.removeAttribute('hidden');
    },

    close() {
        document.getElementById('tmu-td-overlay')?.setAttribute('hidden', '');
    },
};
