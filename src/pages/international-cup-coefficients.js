import { mountInternationalCupCoefficientsPage } from '../components/shared/tm-international-cup-coefficients-page.js';

(function () {
    'use strict';

    if (!/^\/international-cup\/coefficients(?:\/[^/]+)?\/?$/i.test(window.location.pathname)) return;
    mountInternationalCupCoefficientsPage();
})();