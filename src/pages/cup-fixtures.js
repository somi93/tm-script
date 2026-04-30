import { mountCupPage } from '../components/shared/tm-cup-page.js';

export function initCupFixturesPage(main) {
    mountCupPage(main, { mode: 'fixtures' });
}