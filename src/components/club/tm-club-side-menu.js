import { TmSideMenu } from '../shared/tm-side-menu.js';

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

function mount(mainContainer, { id = 'tmvu-club-nav', className = 'tmvu-club-nav', items = [], currentHref = '' } = {}) {
    injectStyles();
    return TmSideMenu.mount(mainContainer, { id, className, items, currentHref });
}

export const TmClubSideMenu = { mount };