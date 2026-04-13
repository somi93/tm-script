'use strict';

import { TmScoutReportCards } from '../../shared/tm-scout-report-cards.js';

export const mountScoutReport = (el, reports) => {
    el.innerHTML = TmScoutReportCards.listHtml({
        reports: reports || [],
        emptyText: 'No scout reports available',
    });
};
