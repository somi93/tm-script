import { TmClubService } from '../services/club.js';
import { normalizeSquadPlayer } from '../utils/normalize/player.js';

// Fetches raw normalized players for a club — no sync, no DB reads.
export const fetchRawPlayers = async (clubId) => {
    if (!clubId) return [];
    const post = await TmClubService.fetchSquadPost(clubId);
    if (!post) return [];
    return Object.values(post).map(normalizeSquadPlayer);
};
