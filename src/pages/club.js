import { TmClubOverview } from '../components/club/tm-club-overview.js';
import { initClubLayout, isClubWorkspaceRoute, normalizeClubHref, resolveClubCurrentPath } from '../components/club/tm-club-layout.js';

(function () {
    'use strict';

    const currentPath = resolveClubCurrentPath(normalizeClubHref(window.location.pathname));
    if (!isClubWorkspaceRoute(currentPath) || /^\/club\/\d+\/squad\/$/.test(currentPath)) return;

    const isOverviewRoute = /^\/club\/\d+\/$/.test(currentPath);

    function init() {
        const layout = initClubLayout({ currentPath });
        if (!layout || !isOverviewRoute) return;
        if (!layout.mainColumn || !layout.secondaryColumn) return;
        TmClubOverview.mount(layout);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();