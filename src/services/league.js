import { _getHtml, _post } from './engine.js';

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

    /**
     * Fetch the raw league page HTML for a division/group.
     * @param {string} country
     * @param {string|number} division
     * @param {string|number} group
     * @returns {Promise<string|null>}
     */
    fetchLeaguePageHtml(country, division, group) {
        return _getHtml(`/league/${country}/${division}/${group}/`);
    },

    /**
     * Fetch the raw league transfer history HTML page for a given season.
     * @param {string} country
     * @param {string|number} division
     * @param {string|number} group
     * @param {string|number} season
     * @returns {Promise<string|null>}
     */
    fetchLeagueTransferHistory(country, division, group, season) {
        return _getHtml(`/history/league/${country}/${division}/${group}/transfers/${season}/`);
    },

}