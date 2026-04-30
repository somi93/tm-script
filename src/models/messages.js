import { TmMessagesService } from '../services/messages.js';

export const TmMessagesModel = {
    fetchTopUserInfo() {
        return TmMessagesService.fetchTopUserInfo();
    },

    fetchTopUserFeed() {
        return TmMessagesService.fetchTopUserFeed();
    },

    fetchDetailedUserFeed(opts) {
        return TmMessagesService.fetchDetailedUserFeed(opts);
    },

    fetchFeedNames(opts) {
        return TmMessagesService.fetchFeedNames(opts);
    },

    fetchFeedLikes(postId) {
        return TmMessagesService.fetchFeedLikes(postId);
    },

    fetchPmMessages(place) {
        return TmMessagesService.fetchPmMessages(place);
    },

    fetchPmMessageText(id, conversationId) {
        return TmMessagesService.fetchPmMessageText(id, conversationId);
    },

    setPmMessageStatus({ status, messageId }) {
        return TmMessagesService.setPmMessageStatus({ status, messageId });
    },

    sendPmMessage(opts) {
        return TmMessagesService.sendPmMessage(opts);
    },
};
