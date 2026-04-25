import { TMLeagueService } from '../services/league.js';

export const TmLeagueModel = {
    fetchLeagueFixtures(type, params = {}) {
        return TMLeagueService.fetchLeagueFixtures(type, params);
    },

    fetchLeagueDivisions(country) {
        return TMLeagueService.fetchLeagueDivisions(country);
    },

    fetchLeaguePageHtml(country, division, group) {
        return TMLeagueService.fetchLeaguePageHtml(country, division, group);
    },

    fetchLeagueTransferHistory(country, division, group, season) {
        return TMLeagueService.fetchLeagueTransferHistory(country, division, group, season);
    },

    fetchFriendlyLeaguePageHtml(leagueId) {
        return TMLeagueService.fetchFriendlyLeaguePageHtml(leagueId);
    },

    fetchFriendlyLeagueStatisticsHtml(leagueId, stat = 'goals') {
        return TMLeagueService.fetchFriendlyLeagueStatisticsHtml(leagueId, stat);
    },

    fetchFriendlyLeagueHistoryHtml(type = 'standings', seasonValue = '') {
        return TMLeagueService.fetchFriendlyLeagueHistoryHtml(type, seasonValue);
    },
};
