import { TmAppShell } from '../components/shared/tm-app-shell.js';

(function () {
    'use strict';

    const init = () => TmAppShell.mount();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();