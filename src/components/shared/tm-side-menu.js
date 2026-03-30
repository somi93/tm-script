import { TmUI } from './tm-ui.js';

const STYLE_ID = 'tmvu-side-menu-style';

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-side-menu {
            flex: 0 0 184px;
            position: sticky;
            top: 16px;
            align-self: flex-start;
        }

        .tmvu-side-menu-nav {
            background: var(--tmu-surface-panel);
            border: 1px solid var(--tmu-border-soft);
            border-radius: 8px;
            box-shadow: 0 0 9px var(--tmu-shadow-ring);
            overflow: hidden;
        }

        .tmvu-side-menu-nav .tmu-list-item {
            min-height: 40px;
            padding: 0 14px;
            border-bottom: 1px solid var(--tmu-border-faint);
            color: var(--tmu-text-panel-label);
            background: var(--tmu-surface-tab-active);
            text-decoration: none !important;
        }

        .tmvu-side-menu-nav .tmu-list-item:last-of-type {
            border-bottom: none;
        }

        .tmvu-side-menu-nav .tmu-list-item:hover {
            background: var(--tmu-surface-tab-hover);
            color: var(--tmu-text-strong);
            text-decoration: none !important;
        }

        .tmvu-side-menu-nav .tmu-list-item:focus,
        .tmvu-side-menu-nav .tmu-list-item:active,
        .tmvu-side-menu-nav .tmu-list-item:visited {
            text-decoration: none !important;
        }

        .tmvu-side-menu-nav .tmu-list-item.is-active {
            color: var(--tmu-text-strong);
            background: linear-gradient(180deg, rgba(108,192,64,.18), rgba(108,192,64,.1));
            box-shadow: inset 3px 0 0 var(--tmu-accent);
        }

        .tmvu-side-menu-nav .tmu-list-icon {
            width: 18px;
            font-size: 14px;
        }

        .tmvu-side-menu-separator {
            height: 1px;
            background: var(--tmu-border-soft);
        }

        .tmvu-side-menu-subtitle {
            padding: 8px 14px 4px;
            font-size: 10px;
            font-weight: 800;
            color: var(--tmu-text-faint);
            text-transform: uppercase;
            letter-spacing: .08em;
        }
    `;

    document.head.appendChild(style);
}

function buildMenuHtml(items) {
    return `
        <div class="tmvu-side-menu-nav">
            ${items.map(item => {
                if (item.type === 'separator') return '<div class="tmvu-side-menu-separator"></div>';
                if (item.type === 'subtitle') return `<div class="tmvu-side-menu-subtitle">${item.label}</div>`;
                return `<tm-list-item data-href="${item.href}" data-icon="${item.icon || ''}" data-label="${item.label}"></tm-list-item>`;
            }).join('')}
        </div>
    `;
}

function applyActiveState(root, currentHref) {
    root.querySelectorAll('.tmu-list-item[href]').forEach(node => {
        if (node.getAttribute('href') === currentHref) node.classList.add('is-active');
    });
}

function mount(mainContainer, { id, className = '', items = [], currentHref = '' } = {}) {
    if (!mainContainer || !items.length || (id && document.getElementById(id))) return null;

    injectStyles();

    const nav = document.createElement('aside');
    if (id) nav.id = id;
    nav.className = `tmvu-side-menu ${className}`.trim();
    TmUI.render(nav, buildMenuHtml(items));
    applyActiveState(nav, currentHref);
    mainContainer.insertBefore(nav, mainContainer.firstChild);
    return nav;
}

export const TmSideMenu = { mount };