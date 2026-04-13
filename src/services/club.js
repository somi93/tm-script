import { _post, _getHtml, _dedup } from './engine.js';
import { TmPlayerService } from './player.js';

export const TmClubService = {


    /**
     * Fetch club fixtures (all matches for a given club this season).
     * @param {string|number} clubId
     * @returns {Promise<object|null>}
     */
    fetchClubFixtures(clubId) {
        return _post('/ajax/fixtures.ajax.php', { type: 'club', var1: clubId });
    },

    /**
     * Fetch the match history HTML page for a club in a given season.
     * Returns the raw HTML string (not JSON) or null on failure.
     * @param {string|number} clubId
     * @param {string|number} seasonId
     * @returns {Promise<string|null>}
     */
    fetchClubMatchHistory(clubId, seasonId) {
        return _getHtml(`/history/club/matches/${clubId}/${seasonId}/`);
    },

    /**
     * Fetch the club transfer history HTML page for a given season.
     * @param {string|number} clubId
     * @param {string|number} seasonId
     * @returns {Promise<string|null>}
     */
    fetchClubTransferHistory(clubId, seasonId) {
        return _getHtml(`/history/club/transfers/${clubId}/${seasonId}/`);
    },

    /**
     * Fetch the club records HTML page.
     * @param {string|number} clubId
     * @returns {Promise<string|null>}
     */
    fetchClubRecords(clubId) {
        return _getHtml(`/history/club/records/${clubId}/`);
    },

    /**
     * Fetch the raw club page HTML.
     * @param {string|number} clubId
     * @returns {Promise<string|null>}
     */
    fetchClubPageHtml(clubId) {
        return _getHtml(`/club/${clubId}/`);
    },

    /**
     * Fetch the club league history HTML page for a given season.
     * @param {string|number} clubId
     * @param {string|number} seasonId
     * @returns {Promise<string|null>}
     */
    fetchClubLeagueHistory(clubId, seasonId) {
        return _getHtml(`/history/club/league/${clubId}/${seasonId}/`);
    },

    /**
     * Fetch the players_get_select post map for a club (raw, no normalization).
     * Returns a { [playerId: string]: player } map, or null on failure.
     * @param {string|number} clubId
     * @returns {Promise<object|null>}
     */
    async fetchSquadPost(clubId) {
        return _dedup(`club:squad-post:${clubId}`, async () => {
            const data = await _post('/ajax/players_get_select.ajax.php', { type: 'change', club_id: clubId });
            if (!data?.post) return null;
            const map = {};
            for (const [id, p] of Object.entries(data.post)) map[String(id)] = p;
            return map;
        });
    },

    /**
     * Fetch the squad player list for a club and return normalized players.
     * @param {string|number} clubId
     * @returns {Promise<object[]|null>}
     */
    async fetchSquadRaw(club_id) {
        const data = await _post('/ajax/players_get_select.ajax.php', { type: 'change', club_id });
        if (!data?.post) return null;
        return Object.values(data.post).map(p => TmPlayerService.normalizeSquadPlayer(p));
    },
}