import { _post } from './engine.js';

export const TmNationalTeamsService = {
    fetchFixtures(countryCode) {
        return _post('/ajax/fixtures.ajax.php', { type: 'national-teams', var1: countryCode });
    },

    fetchElectionSuggestions(query) {
        return _post('/ajax/national-teams_election.ajax.php', { type: 'suggest', q: query });
    },

    fetchElectionNomination(clubId) {
        return _post('/ajax/national-teams_election.ajax.php', { type: 'get_nomination', club_id: clubId });
    },

    addElectionNomination(clubId) {
        return _post('/ajax/national-teams_election.ajax.php', { type: 'add_nomination', club_id: clubId });
    },

    respondToElectionNomination(country, response) {
        return _post('/ajax/national-teams_election.ajax.php', { type: 'nomination_response', country, response });
    },

    fetchElectionVote(clubId) {
        return _post('/ajax/national-teams_election.ajax.php', { type: 'get_vote', club_id: clubId });
    },

    addElectionVote(clubId) {
        return _post('/ajax/national-teams_election.ajax.php', { type: 'add_vote', club_id: clubId });
    },
};