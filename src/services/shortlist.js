import { _dedup, _getHtml, _post } from './engine.js';
import { TmClubService } from './club.js';
import { normalizeTransferPlayer, normalizeSquadPlayer } from '../utils/normalize/player.js';

function cleanText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function getOwnClubId() {
    return cleanText(window.SESSION?.main_id || window.SESSION?.club_id || window.SESSION?.id);
}

function normalizeCountryCode(value) {
    return cleanText(value).replace(/[\[\]]/g, '').toLowerCase();
}

function extractArrayLiteral(html, varName) {
    const marker = `var ${varName}`;
    const startIndex = html.indexOf(marker);
    if (startIndex === -1) return '';

    const arrayStart = html.indexOf('[', startIndex);
    if (arrayStart === -1) return '';

    let depth = 0;
    let inString = false;
    let escaped = false;

    for (let index = arrayStart; index < html.length; index += 1) {
        const char = html[index];

        if (inString) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === '\\') {
                escaped = true;
                continue;
            }
            if (char === '"') inString = false;
            continue;
        }

        if (char === '"') {
            inString = true;
            continue;
        }

        if (char === '[') depth += 1;
        if (char === ']') {
            depth -= 1;
            if (depth === 0) return html.slice(arrayStart, index + 1);
        }
    }

    return '';
}

function buildPlayerHref(player) {
    if (!player?.id) return '#';
    if (player.name_js) return `/players/${player.id}/${player.name_js}/`;
    return `/players/${player.id}/`;
}

function normalizeBidValue(value) {
    if (value == null || value === '') return '';
    if (typeof value === 'string') return cleanText(value);
    return new Intl.NumberFormat('en-US').format(Number(value) || 0);
}

function isActiveBid(player) {
    return Boolean(player && (player.timeleft_string || player.curbid));
}

function buildBidSections(rawPlayers) {
    const players = Array.isArray(rawPlayers) ? rawPlayers.map(normalizeTransferPlayer) : [];
    const activePlayers = players.filter(isActiveBid);
    const outfield = activePlayers.filter(p => !p.isGK);
    const goalkeepers = activePlayers.filter(p => p.isGK);
    const rows = [...outfield, ...goalkeepers].map(p => ({ ...p, href: buildPlayerHref(p) }));
    return rows.length ? [{ title: 'Shortlist', rows }] : [];
}

function isActiveOwnSale(player) {
    if (!player) return false;
    const expiry = cleanText(player.expiry).toLowerCase();
    const transferBid = cleanText(player.transfer_bid);
    const nextBid = Number(player.next_bid) || 0;
    return Boolean(
        (expiry && expiry !== 'expired')
        || (transferBid && transferBid !== '-')
        || nextBid > 0
    );
}

function toOwnSaleRow(player) {
    return {
        ...player,
        href: `/players/${player.id}/`,
        timeleft: 1,
        timeleft_string: cleanText(player.expiry) || '',
        curbid: normalizeBidValue(player.transfer_bid) || normalizeBidValue(player.next_bid) || '',
    };
}

export const TmShortlistService = {
    /**
     * Fetch a shortlist page and return the parsed players_ar array.
     * @param {number} [start] — page offset (omit for first/random page)
     * @returns {Promise<Array>}
     */
    async fetchShortlistPage(start) {
        const url = start != null ? `/shortlist/?start=${start}` : '/shortlist/';
        const html = await _getHtml(url);
        if (!html) return [];
        const arrayLiteral = extractArrayLiteral(html, 'players_ar');
        if (!arrayLiteral) return [];
        try { return JSON.parse(arrayLiteral); } catch { return []; }
    },

    async fetchShortlistBidSections() {
        return _dedup('shortlist:bid-sections', async () => {
            const players = await this.fetchShortlistPage();
            return buildBidSections(players);
        });
    },

    async fetchOwnSaleBidSections() {
        return _dedup('bids:own-sale-sections', async () => {
            const clubId = getOwnClubId();
            if (!clubId) return [];

            const squadPost = await TmClubService.fetchSquadPost(clubId);
            const players = Object.values(squadPost || {}).map(raw => ({
                ...normalizeSquadPlayer(raw),
                expiry: raw.expiry,
                transfer_bid: raw.transfer_bid,
                next_bid: raw.next_bid,
            }));
            if (!players.length) return [];

            const saleRows = players
                .filter(isActiveOwnSale)
                .map(toOwnSaleRow);

            if (!saleRows.length) return [];
            return [{ title: 'My Players', rows: saleRows }];
        });
    },

    async fetchBidSections() {
        return _dedup('bids:sections', async () => {
            const [saleSections, shortlistSections] = await Promise.all([
                this.fetchOwnSaleBidSections(),
                this.fetchShortlistBidSections(),
            ]);
            return [...saleSections, ...shortlistSections];
        });
    },

    addToShortlist(playerId) {
        return _post('/ajax/players_shortlist.ajax.php', { player_id: playerId });
    },

    removeFromShortlist(playerId) {
        return _post('/ajax/players_shortlist.ajax.php', { type: 'remove', player_id: playerId });
    },
}