import { _post } from './engine.js';

export const TmMessagesService = {
    async fetchTopUserInfo() {
        return _post('/ajax/top_user_info.ajax.php', { type: 'get' });
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