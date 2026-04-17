import { esc, clean } from './tm-forum-utils.js';

export const TmForumPager = {
    /**
     * Parse page navigation links from a container.
     * @param {Element} container
     * @param {string} sel  CSS selector for the pager element
     * @returns {Array<{ label, href, current, icon }>}
     */
    parse(container, sel) {
        const el = container.querySelector(sel);
        return Array.from(el?.querySelectorAll('.page_navigation') || []).map(node => ({
            label: clean(node.textContent) || '&rsaquo;',
            href: node.tagName === 'A' ? (node.getAttribute('href') || '') : '',
            current: node.tagName === 'DIV' || node.classList.contains('selected'),
            icon: node.classList.contains('icon'),
        }));
    },

    /**
     * Render pager links to HTML string.
     * @param {Array} links
     * @returns {string}
     */
    html(links) {
        if (!links.length) return '';
        return '<div class="tmvu-forum-pager">' + links.map(l =>
            l.href
                ? '<a class="tmvu-forum-pager-link' + (l.icon ? ' icon' : '') + '" href="' + esc(l.href) + '">'
                    + (l.icon ? '&rsaquo;' : esc(l.label)) + '</a>'
                : '<span class="tmvu-forum-pager-link is-current">' + esc(l.label) + '</span>'
        ).join('') + '</div>';
    },
};
