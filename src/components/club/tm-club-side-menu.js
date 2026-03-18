import { TmUI } from '../shared/tm-ui.js';

const STYLE_ID = 'tmvu-club-side-menu-style';

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-main.tmvu-club-layout {
            display: flex !important;
            gap: 16px;
            align-items: flex-start;
        }

        .tmvu-club-nav {
            flex: 0 0 184px;
            position: sticky;
            top: 16px;
            align-self: flex-start;
        }

        .tmsm-nav {
            background: #1c3410;
            border: 1px solid #28451d;
            border-radius: 8px;
            box-shadow: 0 0 9px #192a19;
            overflow: hidden;
        }

        .tmsm-nav .tmu-list-item {
            min-height: 40px;
            padding: 0 14px;
            border-bottom: 1px solid rgba(42,74,28,.5);
            color: #90b878;
            background: rgba(108, 192, 64, 0.04);
            text-decoration: none !important;
        }

        .tmsm-nav .tmu-list-item:last-of-type {
            border-bottom: none;
        }

        .tmsm-nav .tmu-list-item:hover {
            background: rgba(42,74,28,.4);
            color: #e8f5d8;
            text-decoration: none !important;
        }

        .tmsm-nav .tmu-list-item:focus,
        .tmsm-nav .tmu-list-item:active,
        .tmsm-nav .tmu-list-item:visited {
            text-decoration: none !important;
        }

        .tmsm-nav .tmu-list-item.is-active {
            color: #eff8e8;
            background: linear-gradient(180deg, rgba(108,192,64,.18), rgba(108,192,64,.1));
            box-shadow: inset 3px 0 0 #80e048;
        }

        .tmsm-nav .tmu-list-icon {
            width: 18px;
            font-size: 14px;
        }

        .tmsm-separator {
            height: 1px;
            background: rgba(40, 69, 29, 0.88);
        }

        .tmvu-club-main {
            flex: 1 1 auto;
            min-width: 0;
            width: auto !important;
            margin: 0 !important;
            float: none !important;
        }

        .tmvu-main.tmvu-club-layout.tmvu-club-single .tmvu-club-main {
            flex: 1 1 100%;
            max-width: none !important;
        }

        .tmvu-club-secondary {
            flex: 0 0 300px;
            min-width: 0;
            width: auto !important;
            margin: 0 !important;
            float: none !important;
            display: flex;
            flex-direction: column;
            gap: 16px;
            align-self: flex-start;
        }
    `;

    document.head.appendChild(style);
}

function buildMenuHtml(items) {
    return `
        <div class="tmsm-nav">
            ${items.map(item => {
                if (item.type === 'separator') return '<div class="tmsm-separator"></div>';
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

function mount(mainContainer, { id = 'tmvu-club-nav', className = 'tmvu-club-nav', items = [], currentHref = '' } = {}) {
    if (!mainContainer || !items.length || document.getElementById(id)) return null;

    injectStyles();

    const nav = document.createElement('aside');
    nav.id = id;
    nav.className = className;
    TmUI.render(nav, buildMenuHtml(items));
    applyActiveState(nav, currentHref);
    mainContainer.insertBefore(nav, mainContainer.firstChild);
    return nav;
}

export const TmClubSideMenu = { mount };