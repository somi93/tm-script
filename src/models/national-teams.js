import { TmNationalTeamsService } from '../services/national-teams.js';

export const TmNationalTeamsModel = {
    fetchFixtures(countryCode) {
        return TmNationalTeamsService.fetchFixtures(countryCode);
    },

    fetchElectionNomination(clubId) {
        return TmNationalTeamsService.fetchElectionNomination(clubId);
    },

    addElectionNomination(clubId) {
        return TmNationalTeamsService.addElectionNomination(clubId);
    },

    respondToElectionNomination(country, response) {
        return TmNationalTeamsService.respondToElectionNomination(country, response);
    },

    fetchElectionVote(clubId) {
        return TmNationalTeamsService.fetchElectionVote(clubId);
    },

    addElectionVote(clubId) {
        return TmNationalTeamsService.addElectionVote(clubId);
    },

    fetchElectionSuggestions(query) {
        return TmNationalTeamsService.fetchElectionSuggestions(query);
    },
};
