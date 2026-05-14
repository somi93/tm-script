import { _post } from './engine.js';

export const TmSponsorsService = {
    /**
     * Check current sponsor state.
     * Returns raw data.data payload: { sponsor, fees: { days, payouts } }
     * @returns {Promise<object|null>}
     */
    checkSponsor() {
        return _post('/ajax/sponsor.ajax.php', { action: 'check_sponsor' })
            .then(res => res?.data ?? null);
    },

    /**
     * Sign a sponsor deal and reload.
     * @param {1|2|3} type - 1=10day, 2=20day, 3=30day
     * @returns {Promise<void>}
     */
    signSponsor(type) {
        return _post('/ajax/sponsor.ajax.php', { action: 'sign_sponsor', type })
            .then(() => { location.reload(); });
    },
};
