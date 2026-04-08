import { mountInternationalCupStatisticsPage } from '../components/shared/tm-international-cup-statistics-page.js';

export function initInternationalCupStatisticsPage(main) {
    if (!main || !main.isConnected) return;
    mountInternationalCupStatisticsPage(main);
}
