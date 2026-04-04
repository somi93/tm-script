import { _post, _getHtml } from './engine.js';

export const TmQuickmatchService = {
    fetchRankings(show = 'national') {
        return _post('/ajax/quickmatch_get_content.ajax.php', { show });
    },

    queue(type, opponent = null) {
        const payload = { type };
        if (opponent !== null && opponent !== undefined && opponent !== '') payload.opponent = opponent;
        return _post('/ajax/quickmatch_queue.ajax.php', payload);
    },

    waitForMatch() {
        return _post('/ajax/quickmatch_queue.ajax.php', { type: 'wait' });
    },

    fetchLatestMatches() {
        return _getHtml('/quickmatch/latest-matches/');
    },
};