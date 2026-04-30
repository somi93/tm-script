import { _post } from './engine.js';

export const TmCupService = {

    /**
     * Fetch cup fixtures for a given country and cup ID.
     * @param {string} country — country code (e.g. 'cs')
     * @param {string|number} cupId — cup/round identifier (var2)
     * @returns {Promise<object|null>}
     */
    fetchCupFixtures(country, cupId = '') {
        return _post('/ajax/fixtures.ajax.php', { type: 'cup', var1: country, var2: cupId, var3: '' });
    },

};
