import { TmClubService } from '../services/club.js';

export const TmClubModel = {
    fetchBuddies() {
        return TmClubService.fetchBuddies();
    },

    addBuddy(clubId) {
        return TmClubService.addBuddy(clubId);
    },

    removeBuddy(clubId) {
        return TmClubService.removeBuddy(clubId);
    },
};