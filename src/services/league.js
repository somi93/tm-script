import { _post } from './engine.js';

export const TMLeagueService = {


    /**
     * Fetch league fixtures for a given country/division/group.
     * @param {string|number} country
     * @param {string|number} division
     * @param {string|number} group
     * @returns {Promise<object|null>}
     */
    fetchLeagueFixtures(country, division, group) {
        return _post('/ajax/fixtures.ajax.php', { type: 'league', var1: country, var2: division, var3: group });
    },
    /**
     * Fetch available league divisions for a given country.
     * @param {string} country — country suffix (e.g. 'cs', 'de')
     * @returns {Promise<object|null>}
     */
    fetchLeagueDivisions(country) {
        return _post('https://trophymanager.com/ajax/league_get_divisions.ajax.php', { get: 'new', country });
    },

}