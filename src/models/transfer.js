import { TmTransferService } from '../services/transfer.js';

export const TmTransferModel = {
    fetchTransferBidDialog(playerId, sessionId) {
        return TmTransferService.fetchTransferBidDialog(playerId, sessionId);
    },

    fetchTransfer(playerId) {
        return TmTransferService.fetchTransfer(playerId);
    },

    normalizeTransferPlayer(p) {
        return TmTransferService.normalizeTransferPlayer(p);
    },

    enrichTransferFromTooltip(player, data) {
        return TmTransferService.enrichTransferFromTooltip(player, data);
    },

    fetchTransferSearch(hash, clubId) {
        return TmTransferService.fetchTransferSearch(hash, clubId);
    },
};
