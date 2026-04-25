import { _dedup, _getHtml, _post } from './engine.js';
import { normalizeTransferPlayer } from '../utils/normalize/player.js';

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

function parseTimeleft(str) {
    const m = String(str || '').trim().match(/^(\d+)\s*(d|h|m)$/i);
    if (!m) return 0;
    const v = parseInt(m[1]);
    if (/d/i.test(m[2])) return v * 86400;
    if (/h/i.test(m[2])) return v * 3600;
    return v * 60;
}

function parseBidText(str) {
    const s = String(str || '').replace(/,/g, '').trim();
    if (!s || s === '0') return 0;
    const m = s.match(/^([\d.]+)(M|K)?$/i);
    if (!m) return 0;
    const v = parseFloat(m[1]);
    if (/M/i.test(m[2] || '')) return Math.round(v * 1_000_000);
    if (/K/i.test(m[2] || '')) return Math.round(v * 1_000);
    return Math.round(v);
}

function parseHomeBidRows(doc, selector, direction) {
    const containers = doc.querySelectorAll(selector);
    console.log(`[TM Bids] parseHomeBidRows selector="${selector}" containers=${containers.length}`);
    const rows = Array.from(doc.querySelectorAll(`${selector} .player-row`));
    console.log(`[TM Bids] parseHomeBidRows direction=${direction} player-rows=${rows.length}`);
    return rows.map(li => {
        const id = String(li.id || '').replace('pid', '').trim();
        if (!id) return null;
        const bidSpan = li.querySelector('.cell-bid span');
        const bidText = bidSpan ? (bidSpan.childNodes[0]?.textContent?.trim() || '') : '';
        const clubA = li.querySelector('.cell-club a[club_link]');
        const tlSpan = li.querySelector('.cell-timeleft span');
        const timeleft_string = tlSpan ? (tlSpan.childNodes[0]?.textContent?.trim() || '') : '';
        const row = {
            id,
            direction,
            curbid: bidText || '0',
            bid: parseBidText(bidText),
            club_id: clubA ? Number(clubA.getAttribute('club_link')) || 0 : 0,
            club_name: clubA?.textContent?.trim() || '',
            timeleft: parseTimeleft(timeleft_string),
            timeleft_string,
        };
        console.log(`[TM Bids] parsed ${direction} id=${id} bid="${bidText}" timeleft="${timeleft_string}"`);
        return row;
    }).filter(Boolean);
}

function waitForBidRows(timeoutMs = 8000) {
    return new Promise(resolve => {
        const check = () => document.querySelector('.transfers-in-box .player-row, .transfers-out-box .player-row');
        if (check()) { resolve(); return; }
        const obs = new MutationObserver(() => { if (check()) { obs.disconnect(); resolve(); } });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { obs.disconnect(); resolve(); }, timeoutMs);
    });
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

    addToShortlist(playerId) {
        return _post('/ajax/players_shortlist.ajax.php', { player_id: playerId });
    },

    removeFromShortlist(playerId) {
        return _post('/ajax/players_shortlist.ajax.php', { type: 'remove', player_id: playerId });
    },

    async fetchHomeBids() {
        return _dedup('bids:home', async () => {
            console.log('[TM Bids] fetchHomeBids: waiting for bid rows in DOM');
            await waitForBidRows();
            console.log('[TM Bids] fetchHomeBids: parsing live DOM');
            const ins = parseHomeBidRows(document, '.transfers-in-box', 'in');
            const outs = parseHomeBidRows(document, '.transfers-out-box', 'out');
            const result = [...ins, ...outs];
            console.log('[TM Bids] fetchHomeBids: total rows=', result.length, result);
            return result;
        });
    },
}