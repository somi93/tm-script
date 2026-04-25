import { TmShortlistService } from '../services/shortlist.js';

export const TmShortlistModel = {
    fetchHomeBids() {
        return TmShortlistService.fetchHomeBids();
    },

    fetchShortlistPage() {
        return TmShortlistService.fetchShortlistPage();
    },

    addToShortlist(playerId) {
        return TmShortlistService.addToShortlist(playerId);
    },

    removeFromShortlist(playerId) {
        return TmShortlistService.removeFromShortlist(playerId);
    },
};
