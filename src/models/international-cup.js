import { TmInternationalCupService, parseSections, classifyStage } from '../services/international-cup.js';

export { parseSections, classifyStage };

export const TmInternationalCupModel = {
    fetchOverviewDocument(tournamentId) {
        return TmInternationalCupService.fetchOverviewDocument(tournamentId);
    },

    normalizeCountryKey(code) {
        return TmInternationalCupService.normalizeCountryKey(code);
    },

    calculateCurrentSeasonCountryPoints(opts) {
        return TmInternationalCupService.calculateCurrentSeasonCountryPoints(opts);
    },
};
