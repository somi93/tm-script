import { mountInternationalCupOverviewPage } from '../components/shared/tm-international-cup-overview-page.js';

export function initInternationalCupPage(main) {
    if (!main || !main.isConnected) return;
    mountInternationalCupOverviewPage(main);
}