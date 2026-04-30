import { TmCupService } from '../services/cup.js';

export const TmCupModel = {

    /**
     * Fetch cup fixtures for a given country and cup ID.
     * @param {string} country — country code (e.g. 'cs')
     * @param {string|number} cupId — cup/round identifier (var2)
     * @returns {Promise<object|null>}
     */
    fetchCupFixtures(country, cupId = '') {
        return TmCupService.fetchCupFixtures(country, cupId);
    },

};
