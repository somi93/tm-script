import { TmSectionCard } from '../shared/tm-section-card.js';
import { TmUI } from '../shared/tm-ui.js';
import { esc, clean } from './tm-forum-utils.js';

/**
 * Render a single topic row as HTML string.
 * @param {{ href, title, subtle, pinned, locked, isNew, likes, likesNeg, poster, date, lastPage, lastPageHref }} t
 * @returns {string}
 */
function topicHtml(t) {
    const badges = [
        t.pinned ? TmUI.badge({ label: 'Pinned', size: 'xs', shape: 'full', uppercase: true }, 'highlight') : '',
        t.isNew   ? TmUI.badge({ label: 'New',    size: 'xs', shape: 'full', uppercase: true }, 'success')   : '',
        t.locked  ? TmUI.badge({ label: 'Locked', size: 'xs', shape: 'full', uppercase: true }, 'muted')     : '',
    ].filter(Boolean).join('');
    const likeTone = t.likesNeg ? 'danger' : t.likes > 0 ? 'success' : 'muted';
    return '<article class="tmvu-forum-topic' + (t.subtle ? ' is-subtle' : '') + '">'
        + '<div class="tmvu-forum-topic-main">'
        + '<a class="tmvu-forum-topic-title" href="' + esc(t.href) + '">' + esc(t.title) + '</a>'
        + (badges ? '<div class="tmvu-forum-topic-badges">' + badges + '</div>' : '')
        + (t.poster || t.date
            ? '<div class="tmvu-forum-topic-meta">'
                + (t.poster ? '<span>' + esc(t.poster) + '</span>' : '')
                + (t.date   ? '<span>' + esc(t.date)   + '</span>' : '')
                + '</div>'
            : '')
        + '</div>'
        + '<div class="tmvu-forum-topic-side">'
        + TmUI.badge({ label: '&#9829;', value: String(t.likes), size: 'sm', shape: 'full' }, likeTone)
        + (t.lastPageHref ? '<a class="tmvu-forum-topic-jump" href="' + esc(t.lastPageHref) + '">' + esc(t.lastPage || 'last') + ' &rarr;</a>' : '')
        + '</div>'
        + '</article>';
}

export const TmForumTopicList = {
    /**
     * Parse topic rows from TM forum element.
     * @param {Element} forumEl
     * @returns {Array}
     */
    parse(forumEl) {
        return Array.from(forumEl.querySelectorAll('.forum_topics')).map(row => {
            const a = row.querySelector('.topic_name a');
            if (!a) return null;
            const lastDivs = Array.from(row.querySelectorAll('.topic_last_post > div')).map(d => clean(d.textContent));
            const lastPageA = row.querySelector('.topic_last_page a');
            return {
                href: a.getAttribute('href') || '#',
                title: clean(a.textContent),
                subtle: a.classList.contains('subtle'),
                pinned: !!row.querySelector('.topic_icon img'),
                locked: !!row.querySelector('[alt="Locked"]'),
                isNew: !!row.querySelector('.topic_new img'),
                likes: parseInt(row.querySelector('.topic_likes span')?.textContent || '0', 10) || 0,
                likesNeg: !!row.querySelector('.likes .negative'),
                poster: lastDivs[0] || '',
                date: lastDivs[1] || '',
                lastPage: clean(lastPageA?.textContent || ''),
                lastPageHref: lastPageA?.getAttribute('href') || '',
            };
        }).filter(t => t?.title);
    },

    /**
     * Mount the topics card into host.
     * @param {Element} host
     * @param {{ topics, pagerSummary, pagerLinks, pagerHtml }} props
     * @returns {Element}
     */
    mount(host, { topics, pagerSummary, pagerLinks, pagerHtml }) {
        TmSectionCard.mount(host, {
            title: 'Topics',
            icon: '\uD83E\uDDF5',
            subtitle: pagerSummary,
            bodyHtml: topics.length
                ? '<div class="tmvu-forum-topic-list">' + topics.map(topicHtml).join('') + '</div>'
                    + '<div class="tmvu-forum-pager-footer">' + pagerHtml(pagerLinks) + '</div>'
                : TmUI.empty('No topics found.'),
        });
        return host.firstElementChild || host;
    },
};
