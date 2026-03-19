import { _post } from './engine.js';

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

    sendChallenge(clubId, clubName) {
        return _post('/ajax/quickmatch_challenge.ajax.php', {
            type: 'challenge',
            club_id: clubId,
            club_name: clubName,
        });
    },

    acceptChallenge(id) {
        return _post('/ajax/quickmatch_challenge.ajax.php', { type: 'accept', id });
    },

    cancelChallenge(id) {
        return _post('/ajax/quickmatch_challenge.ajax.php', { type: 'cancel', id });
    },

    rejectChallenge(id) {
        return _post('/ajax/quickmatch_challenge.ajax.php', { type: 'reject', id });
    },
};