import { mountInternationalCupOverviewPage } from '../components/shared/tm-international-cup-overview-page.js';

(function () {
    'use strict';

    if (!/^\/international-cup(?:\/\d+)?\/?$/i.test(window.location.pathname)) return;
    mountInternationalCupOverviewPage();
})();