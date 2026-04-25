import { TmQuickmatchService } from '../services/quickmatch.js';

export const TmQuickmatchModel = {
    waitForMatch() {
        return TmQuickmatchService.waitForMatch();
    },

    fetchRankings(mode) {
        return TmQuickmatchService.fetchRankings(mode);
    },

    queue(type, opponent) {
        return TmQuickmatchService.queue(type, opponent);
    },

    fetchLatestMatches() {
        return TmQuickmatchService.fetchLatestMatches();
    },
};
