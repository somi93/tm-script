import { _getHtml } from './engine.js';

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
        const m = html.match(/var\s+players_ar\s*=\s*(\[[\s\S]*?\]);/);
        if (!m) return [];
        try { return JSON.parse(m[1]); } catch { return []; }
    },
}