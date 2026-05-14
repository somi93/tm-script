export const TmSponsorsModel = {
    /**
     * Normalize the response.data payload from check_sponsor.
     * @param {object|null} data
     * @returns {{ hasSponsor: boolean, offers: Array<{type:number, days:number, payout:number, imageSrc:string}> }|null}
     */
    normalize(data) {
        if (!data) return null;
        const hasSponsor = !!data.sponsor;
        const fees = data.fees || {};
        const days = fees.days || [];
        const payouts = fees.payouts || [];

        const offers = [1, 2, 3]
            .map(i => ({
                type: i,
                days: Number(days[i]) || 0,
                payout: Math.round(Number(payouts[i]) || 0),
                imageSrc: `/pics/spoon/${9 + i}.png`,
            }))
            .filter(o => o.days > 0);

        return { hasSponsor, offers };
    },
};
