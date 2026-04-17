import { TmPageHero } from '../components/shared/tm-page-hero.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { injectForumStyles } from '../components/forum/tm-forum-styles.js';
import { TmForumSidebar } from '../components/forum/tm-forum-sidebar.js';
import { TmForumPager } from '../components/forum/tm-forum-pager.js';
import { TmForumComposer } from '../components/forum/tm-forum-composer.js';
import { TmForumTopicList } from '../components/forum/tm-forum-topic-list.js';
import { TmForumPosts } from '../components/forum/tm-forum-posts.js';
import { esc, clean } from '../components/forum/tm-forum-utils.js';

const btn = (opts) => (TmUI.button(opts) || document.createElement('span')).outerHTML;

export function initForumPage(main) {
    if (!main || !main.isConnected) return;

    function setupPage() {
        injectForumStyles();
        main.classList.add('tmvu-forum-page', 'tmu-page-layout-2col', 'tmu-page-density-compact', 'tmu-page-stack-early');
        main.innerHTML = '';
    }

    // ── listing ───────────────────────────────────────────────────────────────

    function renderListing(src) {
        const sidebarProps = TmForumSidebar.parse(src);
        const forumEl = src.querySelector('#forum') || src;

        const firstPager = forumEl.querySelector('.forum_pages');
        const pagerSummary = clean(firstPager?.querySelector('.subtle')?.textContent || '');
        const pagerLinks = TmForumPager.parse(forumEl, '.forum_pages');
        const forumTitle = clean(
            (n => n?.childNodes?.[0]?.textContent || n?.textContent || 'Forum')(forumEl.querySelector('.topic_header'))
        );
        const topics = TmForumTopicList.parse(forumEl);

        setupPage();

        const sidebar = document.createElement('div');
        TmForumSidebar.mount(sidebar, sidebarProps);
        main.appendChild(sidebar.firstElementChild || sidebar);

        const col = document.createElement('div');
        col.className = 'tmvu-forum-main tmu-page-section-stack';

        const heroHost = document.createElement('div');
        TmPageHero.mount(heroHost, {
            slots: {
                kicker: 'Forum',
                title: forumTitle,
                subtitle: sidebarProps.currentCountry,
                footer: TmForumPager.html(pagerLinks),
            },
        });
        col.appendChild(heroHost.firstElementChild || heroHost);

        const topicsHost = document.createElement('div');
        const topicsEl = TmForumTopicList.mount(topicsHost, {
            topics,
            pagerSummary,
            pagerLinks,
            pagerHtml: TmForumPager.html.bind(TmForumPager),
        });
        col.appendChild(topicsEl);

        main.appendChild(col);

        TmForumComposer.mountWhenReady(col, 'Post New Topic');
    }

    // ── thread ────────────────────────────────────────────────────────────────

    function renderThread(src) {
        const sidebarProps = TmForumSidebar.parse(src);
        const forumEl = src.querySelector('#forum') || src;
        const topicPagesEl = forumEl.querySelector('.topic_pages');
        const backHref = topicPagesEl?.querySelector('.arrow_left')?.getAttribute('href') || '';
        const pagerSummary = clean(topicPagesEl?.querySelector('.subtle')?.textContent || '');
        const pagerLinks = TmForumPager.parse(forumEl, '.topic_pages');
        const topicTitle = clean(forumEl.querySelector('h1.mega_headline')?.textContent || 'Thread');
        const posts = TmForumPosts.parse(forumEl);

        setupPage();

        const sidebar = document.createElement('div');
        TmForumSidebar.mount(sidebar, sidebarProps);
        main.appendChild(sidebar.firstElementChild || sidebar);

        const col = document.createElement('div');
        col.className = 'tmvu-forum-main tmu-page-section-stack';

        const heroHost = document.createElement('div');
        TmPageHero.mount(heroHost, {
            slots: {
                kicker: 'Thread',
                title: topicTitle,
                subtitle: sidebarProps.currentCountry,
                side: '<div class="tmvu-forum-thread-hero-actions">'
                    + (backHref ? btn({ label: '\u2190 Back', href: esc(backHref), color: 'secondary', size: 'sm' }) : '')
                    + btn({ label: '\u270F Reply', color: 'primary', size: 'sm', attrs: { onclick: 'reply()' } })
                    + '</div>',
                footer: TmForumPager.html(pagerLinks),
            },
        });
        col.appendChild(heroHost.firstElementChild || heroHost);

        TmForumPosts.mount(col, {
            posts,
            pagerSummary,
            pagerLinks,
            pagerHtml: TmForumPager.html.bind(TmForumPager),
        });

        main.appendChild(col);

        TmForumComposer.mountWhenReady(col, 'Reply');
    }

    // ── new topic ─────────────────────────────────────────────────────────────

    function renderNewTopic(src) {
        const sidebarProps = TmForumSidebar.parse(src);

        setupPage();

        const sidebar = document.createElement('div');
        TmForumSidebar.mount(sidebar, sidebarProps);
        main.appendChild(sidebar.firstElementChild || sidebar);

        const col = document.createElement('div');
        col.className = 'tmvu-forum-main tmu-page-section-stack';

        const backHref = document.referrer && document.referrer.includes('/forum/')
            ? document.referrer
            : '/forum/' + (window.location.pathname.match(/^\/forum\/([^/]+)\//)?.[1] || '') + '/general/';

        const heroHost = document.createElement('div');
        TmPageHero.mount(heroHost, {
            slots: {
                kicker: 'Forum',
                title: 'New Topic',
                subtitle: sidebarProps.currentCountry,
                side: btn({ label: '\u2190 Back', href: esc(backHref), color: 'secondary', size: 'sm' }),
            },
        });
        col.appendChild(heroHost.firstElementChild || heroHost);

        main.appendChild(col);

        TmForumComposer.mountWhenReady(col, 'New Topic');
    }

    // ── entry ─────────────────────────────────────────────────────────────────

    function waitForContent(cb) {
        const check = () => document.querySelector('.forum_topics, .topic_post, #forum_post_form');
        if (check()) { cb(); return; }
        const obs = new MutationObserver(() => {
            if (check()) { obs.disconnect(); cb(); }
        });
        obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    waitForContent(() => {
        const src = document.querySelector('.main_center:not(.top_user_info)') || main;
        if (src.querySelector('.forum_topics')) {
            renderListing(src);
        } else if (src.querySelector('.topic_post')) {
            renderThread(src);
        } else if (src.querySelector('#forum_post_form')) {
            renderNewTopic(src);
        }
    });
}
