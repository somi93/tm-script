
import { _post } from './engine.js';
import { normalizeTransferPlayer as _normalizeTransferPlayer } from '../utils/normalize/player.js';

export const TmTransferService = {

    /**
     * Fetch transfer bid dialog data for a player.
     * @param {string|number} playerId
     * @param {string|number} sessionId
     * @returns {Promise<object|null>}
     */
    fetchTransferBidDialog(playerId, sessionId) {
        return _post('/ajax/transfer_bids.ajax.php', {
            type: 'get_transfer_bid',
            player_id: playerId,
            session_id: sessionId,
        });
    },

    /**
     * Fetch the current transfer status for a listed player.
     * @param {string|number} playerId
     * @returns {Promise<object|null>}
     */
    fetchTransfer(playerId) {
        return _post('/ajax/transfer_get.ajax.php', { type: 'transfer_reload', player_id: playerId });
    },

    /**
     * Search the transfer market by a pre-built hash string.
     * Returns the raw API response { list: [], refresh: bool } or null on error.
     * The `list` array contains raw TM transfer player objects — call
     * normalizeTransferPlayer() on each entry before use.
     * @param {string} hash   — path-style hash built by buildHash() / buildHashRaw()
     * @param {string|number} clubId — SESSION.id (used by TM to exclude own players)
     * @returns {Promise<{list: object[], refresh: boolean}|null>}
     */
    fetchTransferSearch(hash, clubId) {
        return _post('/ajax/transfer.ajax.php', { search: hash, club_id: clubId });
    },

    /**
     * Normalise a raw transfer-list player object into a standard Player model.
     * Delegates to normalizeTransferPlayer in utils/normalize/player.js.
     * @param {object} p — raw player from transfer list
     * @returns {object} normalized Player model with r5Lo/r5Hi/rec pre-estimated
     */
    normalizeTransferPlayer(p) {
        return _normalizeTransferPlayer(p);
    },

    /**
     * Merge normalized tooltip player data into a transfer player — mutates in place.
     * Tooltip is already fully normalized (skills, r5, rec, ti, wage, routine) by
     * normalizeTooltipPlayer + applyPlayerPositionRatings. We just spread it over
     * the transfer player, preserving transfer-specific fields that tooltip lacks
     * (timeleft, next_bid, r5Lo, r5Hi, note, tooltipFetched, etc.).
     * @param {object} player       — normalized transfer player
     * @param {object} tooltipPlayer — normalized player from TmPlayerModel.fetchTooltipCached
     * @returns {object|null} player on success, null if tooltipPlayer is invalid
     */
    enrichTransferFromTooltip(player, tooltipPlayer) {
        if (!tooltipPlayer) return null;
        const { note } = player;
        Object.assign(player, tooltipPlayer);
        if (note) player.note = note;
        player.tooltipFetched = true;
        return player;
    },


}