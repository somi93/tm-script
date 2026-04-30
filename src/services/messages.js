import { _post } from './engine.js';

export const TmMessagesService = {
    async fetchTopUserInfo() {
        return _post('/ajax/top_user_info.ajax.php', { type: 'get' });
    },

    async fetchTopUserFeed() {
        return _post('/ajax/top_user_info.ajax.php', { type: 'feed' });
    },

    async fetchDetailedUserFeed({
        feedId = '0',
        buddies = true,
        personal = true,
        leagueCountry = '',
        leagueDivision = '',
        leagueGroup = '',
        onlySystemPosts = false,
        lastPost = '',
    } = {}) {
        const payload = {
            type: 'get_feed',
            feed_id: feedId,
            'filters[buddies]': buddies,
            'filters[league][country]': leagueCountry,
            'filters[league][division]': leagueDivision,
            'filters[league][group]': leagueGroup,
            'filters[personal]': personal,
            only_system_posts: onlySystemPosts,
        };
        if (lastPost) payload.last_post = lastPost;
        return _post('/ajax/feed_get.ajax.php', payload);
    },

    async fetchFeedNames({ playerIds = [], clubIds = [] } = {}) {
        return _post('/ajax/feed_get.ajax.php', {
            type: 'club_names',
            'player_ids[]': playerIds,
            'ids[]': clubIds,
            'club_ids[]': clubIds,
        });
    },

    async fetchFeedLikes(postId) {
        return _post('/ajax/feed_get.ajax.php', {
            type: 'likes',
            post_id: postId,
        });
    },

    async fetchPmMessages(place = 'inbox') {
        return _post('/ajax/pm_get_messages.ajax.php', { place });
    },

    async fetchPmMessageText(id, conversationId = '0') {
        return _post('/ajax/pm_get_message_text.ajax.php', {
            id,
            conversation_id: conversationId,
        });
    },

    async setPmMessageStatus({ status, messageId } = {}) {
        return _post('/ajax/pm_set_message_status.ajax.php', {
            status,
            message_id: messageId,
        });
    },

    async sendPmMessage({ recipient, subject, message, conversationId = '0', clubId = '' } = {}) {
        return _post('/ajax/pm_send_message.ajax.php', {
            recipient,
            subject,
            message,
            conversation_id: conversationId,
            club_id: clubId,
        });
    },
};