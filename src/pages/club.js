import { TmClubOverview } from '../components/club/tm-club-overview.js';
import { initClubLayout, normalizeClubHref } from '../components/club/tm-club-layout.js';

export function initClubPage(main) {
    if (!main || !main.isConnected) return;
    const layout = initClubLayout({ main, currentPath: normalizeClubHref(window.location.pathname) });
    if (!layout?.mainColumn) return;
    console.log('Club layout initialized:', layout);
    TmClubOverview.mount(layout);
}