import { mountCupPage } from '../components/shared/tm-cup-page.js';

export function initCupPage(main) {
    mountCupPage(main, { mode: 'overview' });
}