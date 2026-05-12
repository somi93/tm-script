import { mountCupStatisticsPage } from '../components/shared/tm-cup-statistics-page.js';

export function initCupStatisticsPage(main) {
    if (!main || !main.isConnected) return;
    mountCupStatisticsPage(main);
}
