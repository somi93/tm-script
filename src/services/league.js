import { _post } from './engine.js';

export const TMLeagueService = {


    /**
     * Fetch fixtures via fixtures.ajax.php.
     * @param {string} type
     * @param {object} params
     * @returns {Promise<object|null>}
     */
    fetchLeagueFixtures(type, params = {}) {
        return _post('/ajax/fixtures.ajax.php', { type, ...params });
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