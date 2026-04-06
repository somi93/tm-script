import { mountInternationalCupCoefficientsPage } from '../components/shared/tm-international-cup-coefficients-page.js';

export function initInternationalCupCoefficientsPage(main) {
    if (!main || !main.isConnected) return;
    mountInternationalCupCoefficientsPage(main);
}