import { initAppShellLayout } from '../layouts/app-shell.js';

(function () {
    'use strict';

    if (window.top !== window.self) return;
    if (/^\/players\/?$/i.test(window.location.pathname)) return;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAppShellLayout, { once: true });
    } else {
        initAppShellLayout();
    }
})();
