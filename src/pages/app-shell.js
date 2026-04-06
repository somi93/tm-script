import { initAppShellLayout } from '../layouts/app-shell.js';
import { initPlayersPage } from './players.js';
import { initR5HistoryPage } from './r5history.js';

(function () {
    'use strict';

    if (window.top !== window.self) return;
    if (/^\/players\/?$/i.test(window.location.pathname)) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => { initPlayersPage(); initR5HistoryPage(); }, { once: true });
        } else {
            initPlayersPage();
            initR5HistoryPage();
        }
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAppShellLayout, { once: true });
    } else {
        initAppShellLayout();
    }
})();
