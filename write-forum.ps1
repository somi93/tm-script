$content = @'
import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmUI } from '../components/shared/tm-ui.js';

(function () {
    'use strict';

    if (!/^\/forum\//i.test(window.location.pathname)) return;

    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
    const esc = (v) => String(v || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    // ── sidebar ───────────────────────────────────────────────────────────────

    function parseSidebar(src) {
        const countryOptions = Array.from(src.querySelectorAll('#menu_country_select_hidden option')).map(o => ({
            val: o.value,
            label: clean(o.textContent),
            sel: o.getAttribute('selected') !== null || o.selected,
        }));
        const currentCountry = clean(
            src.querySelector('.dark .white')?.firstChild?.textContent
            || src.querySelector('.dark .white')?.textContent || ''
        );
        const menuGroups = (() => {
            const result = [];
            let group = { title: '', items: [] };
            result.push(group);
            src.querySelectorAll('.content_menu > *').forEach(node => {
                if (node.tagName === 'H3') {
                    group = { title: clean(node.textContent), items: [] };
                    result.push(group);
                } else if (node.tagName === 'A') {
                    group.items.push({ href: node.getAttribute('href') || '#', label: clean(node.textContent), active: node.classList.contains('selected') });
                }
            });
            return result.filter(g => g.items.length);
        })();
        return { countryOptions, currentCountry, menuGroups };
    }

    function buildSidebar({ countryOptions, currentCountry, menuGroups }) {
        const sidebar = document.createElement('aside');
        sidebar.className = 'tmvu-forum-sidebar';

        const scopeHost = document.createElement('div');
        TmSectionCard.mount(scopeHost, {
            title: clean(countryOptions.find(o => o.sel)?.label?.replace(/\s*\[.*$/, '') || currentCountry || 'Scope'),
            icon: '\uD83C\uDF0D',
            bodyHtml: '<div class="tmvu-forum-country-wrap">'
                + (currentCountry ? '<div class="tmvu-forum-country-current">' + esc(currentCountry) + '</div>' : '')
                + '<select class="tmvu-forum-country-select" data-forum-country>'
                + countryOptions.map(o => '<option value="' + esc(o.val) + '"' + (o.sel ? ' selected' : '') + '>' + esc(o.label) + '</option>').join('')
                + '</select></div>',
        });
        sidebar.appendChild(scopeHost.firstElementChild || scopeHost);

        const navHost = document.createElement('div');
        TmSectionCard.mount(navHost, {
            title: 'Channels',
            icon: '\uD83D\uDCAC',
            bodyHtml: menuGroups.map(g =>
                '<div class="tmvu-forum-nav-group">'
                + (g.title ? '<div class="tmvu-forum-nav-title">' + esc(g.title) + '</div>' : '')
                + g.items.map(item =>
                    '<tm-list-item data-href="' + esc(item.href) + '" data-label="' + esc(item.label) + '"'
                    + (item.active ? ' data-variant="is-active"' : '') + '></tm-list-item>'
                ).join('')
                + '</div>'
            ).join(''),
        });
        sidebar.appendChild(navHost.firstElementChild || navHost);

        sidebar.querySelector('[data-forum-country]')?.addEventListener('change', (e) => {
            const m = window.location.pathname.match(/^\/forum\/([^/]+)\/([^/]+)\//i);
            if (m) window.location.assign('/forum/' + e.target.value + '/' + m[2] + '/');
        });

        return sidebar;
    }

    // ── pager ─────────────────────────────────────────────────────────────────

    function parsePager(container, sel) {
        const el = container.querySelector(sel);
        return Array.from(el?.querySelectorAll('.page_navigation') || []).map(node => ({
            label: clean(node.textContent) || '&rsaquo;',
            href: node.tagName === 'A' ? (node.getAttribute('href') || '') : '',
            current: node.tagName === 'DIV' || node.classList.contains('selected'),
            icon: node.classList.contains('icon'),
        }));
    }

    function pagerHtml(links) {
        if (!links.length) return '';
        return '<div class="tmvu-forum-pager">' + links.map(l =>
            l.href
                ? '<a class="tmvu-forum-pager-link' + (l.icon ? ' icon' : '') + '" href="' + esc(l.href) + '">' + (l.icon ? '&rsaquo;' : esc(l.label)) + '</a>'
                : '<span class="tmvu-forum-pager-link is-current">' + esc(l.label) + '</span>'
        ).join('') + '</div>';
    }

    // ── styles ────────────────────────────────────────────────────────────────

    function injectStyles() {
        if (document.getElementById('tmvu-forum-style')) return;
        const s = document.createElement('style');
        s.id = 'tmvu-forum-style';
        s.textContent = [
            // layout
            '.tmvu-main.tmvu-forum-page{display:grid!important;grid-template-columns:240px minmax(0,1fr);gap:16px;align-items:start}',
            '.tmvu-forum-sidebar,.tmvu-forum-main{display:flex;flex-direction:column;gap:14px;min-width:0}',
            // sidebar nav
            '.tmvu-forum-nav-group{display:flex;flex-direction:column;gap:2px}',
            '.tmvu-forum-nav-group+.tmvu-forum-nav-group{margin-top:10px;padding-top:10px;border-top:1px solid rgba(61,104,40,.18)}',
            '.tmvu-forum-nav-title{padding:4px 12px 5px;color:#7aaa5e;font-size:9px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}',
            '.tmvu-forum-nav-group .tmu-list-item{padding:9px 12px;border-radius:8px;font-size:12px}',
            '.tmvu-forum-nav-group .tmu-list-item.is-active{background:rgba(108,192,64,.14);box-shadow:inset 3px 0 0 #80e048;color:#e8f5d8}',
            // country selector
            '.tmvu-forum-country-wrap{display:flex;flex-direction:column;gap:8px}',
            '.tmvu-forum-country-current{font-size:13px;font-weight:700;color:#e8f5d8}',
            '.tmvu-forum-country-select{width:100%;padding:7px 10px;border-radius:8px;border:1px solid rgba(61,104,40,.3);background:rgba(12,24,9,.8);color:#e8f5d8;font:inherit;font-size:12px}',
            // pager
            '.tmvu-forum-pager{display:flex;gap:5px;flex-wrap:wrap;align-items:center}',
            '.tmvu-forum-pager-link{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:28px;padding:0 8px;border-radius:999px;border:1px solid rgba(61,104,40,.22);background:rgba(42,74,28,.22);color:#c8e0b4;font-size:11px;font-weight:700;text-decoration:none}',
            '.tmvu-forum-pager-link:hover{background:rgba(108,192,64,.12);color:#fff}',
            '.tmvu-forum-pager-link.is-current{background:rgba(108,192,64,.18);border-color:rgba(108,192,64,.3);color:#eff8e8}',
            '.tmvu-forum-pager-link.icon{min-width:28px;font-size:14px}',
            // listing topics
            '.tmvu-forum-topic-list{display:flex;flex-direction:column;gap:8px}',
            '.tmvu-forum-pager-footer{margin-top:12px}',
            '.tmvu-forum-topic{display:flex;justify-content:space-between;gap:14px;padding:12px 14px;border-radius:12px;border:1px solid rgba(90,126,42,.16);background:rgba(12,24,9,.22);transition:background .15s}',
            '.tmvu-forum-topic:hover{background:rgba(28,52,16,.5)}',
            '.tmvu-forum-topic.is-subtle{opacity:.84}',
            '.tmvu-forum-topic-main{flex:1 1 auto;min-width:0}',
            '.tmvu-forum-topic-head{display:flex;align-items:flex-start;gap:10px}',
            '.tmvu-forum-topic-title{color:#eef8e8;font-size:14px;font-weight:700;line-height:1.35;text-decoration:none}',
            '.tmvu-forum-topic-title:hover{color:#fff;text-decoration:underline}',
            '.tmvu-forum-topic-badges{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:4px}',
            '.tmvu-forum-topic-meta{margin-top:6px;display:flex;gap:8px;color:#8aac72;font-size:11px}',
            '.tmvu-forum-topic-side{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;width:76px}',
            '.tmvu-forum-topic-jump{color:#a8cb95;font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap}',
            '.tmvu-forum-topic-jump:hover{color:#fff;text-decoration:underline}',
            // thread posts
            '.tmvu-forum-posts{display:flex;flex-direction:column;gap:10px}',
            '.tmvu-forum-post{display:flex;gap:14px;padding:14px;border-radius:12px;border:1px solid rgba(90,126,42,.15);background:rgba(12,24,9,.22)}',
            '.tmvu-forum-post-user{flex-shrink:0;width:96px;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}',
            '.tmvu-forum-post-logo{width:56px;height:56px;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.2)}',
            '.tmvu-forum-post-logo img{width:56px;height:56px;object-fit:contain}',
            '.tmvu-forum-post-club{font-size:11px;font-weight:700;color:#c8e4a4;text-decoration:none;line-height:1.3;word-break:break-word}',
            '.tmvu-forum-post-club:hover{color:#fff}',
            '.tmvu-forum-post-rank{font-size:10px;color:#7a9e5e;font-style:italic;text-align:center}',
            '.tmvu-forum-post-flag img{height:14px;border-radius:2px}',
            '.tmvu-forum-post-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:8px}',
            '.tmvu-forum-post-meta{display:flex;align-items:center;gap:10px;padding-bottom:8px;border-bottom:1px solid rgba(61,104,40,.14)}',
            '.tmvu-forum-post-num{font-size:11px;font-weight:800;color:#5a824a;text-decoration:none}',
            '.tmvu-forum-post-num:hover{color:#a4d476}',
            '.tmvu-forum-post-date{font-size:11px;color:#6a8e52;margin-left:auto}',
            '.tmvu-forum-post-likes{display:flex;gap:5px;align-items:center}',
            '.tmvu-forum-post-like-pos{color:#7fc65a;font-size:11px;font-weight:700}',
            '.tmvu-forum-post-like-neg{color:#c47a5a;font-size:11px;font-weight:700}',
            '.tmvu-forum-post-content{font-size:13px;color:#d4e8c0;line-height:1.65;word-break:break-word}',
            '.tmvu-forum-post-content a{color:#8ecc60;text-decoration:none}',
            '.tmvu-forum-post-content a:hover{text-decoration:underline}',
            '.tmvu-forum-post-content img{max-width:100%;border-radius:6px;margin:4px 0}',
            '.tmvu-forum-post-content .quote{margin:8px 0;padding:8px 12px;border-left:3px solid rgba(108,192,64,.35);background:rgba(42,74,28,.3);border-radius:0 8px 8px 0;font-size:12px;color:#b4cc98}',
            '.tmvu-forum-post-content .quote_text{display:block}',
            '.tmvu-forum-post-content .mega_quotes{display:none!important}',
            '.tmvu-forum-post-content .subtle.align_right{font-size:10px;color:#6a8e52;text-align:right;margin-top:4px}',
            '.tmvu-forum-post-content .text_red{color:#e07060}',
            '.tmvu-forum-post-content .text_blue{color:#6090e0}',
            '.tmvu-forum-post-content .text_orange{color:#e0a050}',
            '.tmvu-forum-post-actions{display:flex;gap:8px;align-items:center;padding-top:8px;border-top:1px solid rgba(61,104,40,.12)}',
            '.tmvu-post-btn{padding:4px 10px;border-radius:6px;border:1px solid rgba(61,104,40,.25);background:rgba(42,74,28,.3);color:#a4cc88;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;line-height:1;text-decoration:none;display:inline-flex;align-items:center}',
            '.tmvu-post-btn:hover{background:rgba(108,192,64,.15);color:#e0f0c0;border-color:rgba(108,192,64,.3)}',
            '.tmvu-post-hidden{display:none!important}',
            '@media(max-width:960px){.tmvu-main.tmvu-forum-page{grid-template-columns:1fr}.tmvu-forum-post-user{width:70px}}',
        ].join('');
        document.head.appendChild(s);
    }

    // ── topic item HTML (listing) ─────────────────────────────────────────────

    function topicHtml(t) {
        const badges = [
            t.pinned ? TmUI.badge({ label: 'Pinned', size: 'xs', shape: 'full', uppercase: true }, 'highlight') : '',
            t.isNew  ? TmUI.badge({ label: 'New',    size: 'xs', shape: 'full', uppercase: true }, 'success')   : '',
            t.locked ? TmUI.badge({ label: 'Locked', size: 'xs', shape: 'full', uppercase: true }, 'muted')     : '',
        ].filter(Boolean).join('');
        const likeTone = t.likesNeg ? 'danger' : t.likes > 0 ? 'success' : 'muted';
        return '<article class="tmvu-forum-topic' + (t.subtle ? ' is-subtle' : '') + '">'
            + '<div class="tmvu-forum-topic-main">'
            +   '<a class="tmvu-forum-topic-title" href="' + esc(t.href) + '">' + esc(t.title) + '</a>'
            +   (badges ? '<div class="tmvu-forum-topic-badges">' + badges + '</div>' : '')
            +   (t.poster || t.date
                    ? '<div class="tmvu-forum-topic-meta">'
                      + (t.poster ? '<span>' + esc(t.poster) + '</span>' : '')
                      + (t.date   ? '<span>' + esc(t.date)   + '</span>' : '')
                      + '</div>'
                    : '')
            + '</div>'
            + '<div class="tmvu-forum-topic-side">'
            +   TmUI.badge({ label: '&#9829;', value: String(t.likes), size: 'sm', shape: 'full' }, likeTone)
            +   (t.lastPageHref ? '<a class="tmvu-forum-topic-jump" href="' + esc(t.lastPageHref) + '">' + esc(t.lastPage || 'last') + ' &rarr;</a>' : '')
            + '</div>'
            + '</article>';
    }

    // ── render listing ────────────────────────────────────────────────────────

    function renderListing(main, src) {
        const sidebarData = parseSidebar(src);
        const forumEl = src.querySelector('#forum') || src;

        const firstPager   = forumEl.querySelector('.forum_pages');
        const pagerSummary = clean(firstPager?.querySelector('.subtle')?.textContent || '');
        const pagerLinks   = parsePager(forumEl, '.forum_pages');

        const titleNode  = forumEl.querySelector('.topic_header');
        const forumTitle = clean(titleNode?.childNodes?.[0]?.textContent || titleNode?.textContent || 'Forum');

        const topics = Array.from(forumEl.querySelectorAll('.forum_topics')).map(row => {
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

        const formHtml = forumEl.querySelector('.forum_form')?.outerHTML || '';

        injectStyles();
        main.classList.add('tmvu-forum-page');
        main.innerHTML = '';

        const sidebar = buildSidebar(sidebarData);
        main.appendChild(sidebar);

        const col = document.createElement('div');
        col.className = 'tmvu-forum-main';

        const heroHost = document.createElement('div');
        TmHeroCard.mount(heroHost, {
            slots: {
                kicker:   'Forum',
                title:    forumTitle,
                subtitle: sidebarData.currentCountry,
                main:     pagerSummary ? TmUI.notice({ text: pagerSummary, tone: 'muted' }) : '',
                actions:  TmUI.button({ label: '+ New Topic', color: 'primary', size: 'sm', attrs: { 'data-forum-new-topic': '1' } }).outerHTML,
                footer:   pagerHtml(pagerLinks),
            },
        });
        col.appendChild(heroHost.firstElementChild || heroHost);

        const topicsHost = document.createElement('div');
        TmSectionCard.mount(topicsHost, {
            title: 'Topics',
            icon: '\uD83E\uDDF5',
            subtitle: pagerSummary,
            bodyHtml: topics.length
                ? '<div class="tmvu-forum-topic-list">' + topics.map(topicHtml).join('') + '</div>'
                  + '<div class="tmvu-forum-pager-footer">' + pagerHtml(pagerLinks) + '</div>'
                : TmUI.empty('No topics found.'),
        });
        col.appendChild(topicsHost.firstElementChild || topicsHost);

        if (formHtml) {
            const formHost = document.createElement('div');
            TmSectionCard.mount(formHost, {
                hostClass: 'tmvu-forum-compose-card',
                title: 'Post New Topic',
                icon: '\u270D',
                bodyHtml: formHtml,
            });
            col.appendChild(formHost.firstElementChild || formHost);
        }

        main.appendChild(col);

        col.querySelector('[data-forum-new-topic]')?.addEventListener('click', () => {
            if (typeof window.new_topic === 'function') {
                window.new_topic();
            } else {
                const card = col.querySelector('.tmvu-forum-compose-card');
                card?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                card?.querySelector('input,textarea')?.focus();
            }
        });
    }

    // ── render thread ─────────────────────────────────────────────────────────

    function renderThread(main, src) {
        const sidebarData  = parseSidebar(src);
        const forumEl      = src.querySelector('#forum') || src;
        const topicPagesEl = forumEl.querySelector('.topic_pages');
        const backHref     = topicPagesEl?.querySelector('.arrow_left')?.getAttribute('href') || '';
        const pagerSummary = clean(topicPagesEl?.querySelector('.subtle')?.textContent || '');
        const pagerLinks   = parsePager(forumEl, '.topic_pages');
        const topicTitle   = clean(forumEl.querySelector('h1.mega_headline')?.textContent || 'Thread');
        const formHtml     = forumEl.querySelector('.forum_form')?.outerHTML || '';

        const posts = Array.from(forumEl.querySelectorAll('.topic_post')).map(postEl => {
            const clubA    = postEl.querySelector('.user a[href*="/club/"]');
            const logoImg  = postEl.querySelector('.user .club_logo');
            const flagImg  = postEl.querySelector('.user .valign_all a[href*="/national-teams/"] img');
            const actionsEl = postEl.querySelector('.actions');
            const postNumA  = actionsEl?.querySelector('.post_number a');

            // Strip signatures and decorative overlays from content
            const textEl = postEl.querySelector('.content .text');
            if (textEl) {
                textEl.querySelectorAll('.signature, .text_fade_overlay').forEach(el => el.remove());
            }

            const likesDiv = actionsEl?.querySelector('.likes');
            const likesPos = parseInt(likesDiv?.querySelector('.positive')?.getAttribute('current_value') || '0', 10);
            const likesNeg = parseInt(likesDiv?.querySelector('.negative')?.getAttribute('current_value') || '0', 10);

            // Keep TM hook elements in hidden div so like/quote JS still works
            const likesDivHtml  = likesDiv?.outerHTML || '';
            const quoteSpanHtml = actionsEl?.querySelector('[id^="quote_post"]')?.outerHTML || '';

            // Sequential number for quote(N)
            const iAttr  = postEl.getAttribute('i');
            const seqNum = iAttr != null ? String(parseInt(iAttr, 10) + 1) : '';

            return {
                postDbId:    postEl.getAttribute('id')?.replace('post', '') || '',
                postNum:     clean(postNumA?.textContent || ''),
                postAnchorId: postNumA?.getAttribute('id') || '',
                postDate:    clean(actionsEl?.querySelector('.post_time')?.textContent || ''),
                clubHref:    clubA?.getAttribute('href') || '',
                clubName:    clean(clubA?.textContent || ''),
                logoSrc:     logoImg?.getAttribute('src') || '',
                flagSrc:     flagImg?.getAttribute('src') || '',
                rank:        clean(postEl.querySelector('.user_rank')?.textContent || ''),
                contentHtml: (textEl?.querySelector('span') || textEl)?.innerHTML || '',
                likesDivHtml,
                quoteSpanHtml,
                likesPos,
                likesNeg,
                seqNum,
            };
        });

        injectStyles();
        main.classList.add('tmvu-forum-page');
        main.innerHTML = '';

        const sidebar = buildSidebar(sidebarData);
        main.appendChild(sidebar);

        const col = document.createElement('div');
        col.className = 'tmvu-forum-main';

        const heroHost = document.createElement('div');
        TmHeroCard.mount(heroHost, {
            slots: {
                kicker:   'Thread',
                title:    topicTitle,
                subtitle: sidebarData.currentCountry,
                main:     pagerSummary ? TmUI.notice({ text: pagerSummary, tone: 'muted' }) : '',
                actions:  (backHref ? '<a class="tmvu-post-btn" href="' + esc(backHref) + '">\u2190 Back</a> ' : '')
                          + '<button class="tmvu-post-btn" onclick="reply()">\u270F Reply</button>',
                footer:   pagerHtml(pagerLinks),
            },
        });
        col.appendChild(heroHost.firstElementChild || heroHost);

        const postsHtml = posts.map(p => {
            const posNum   = p.postNum.replace('#', '');
            const likesHtml = (p.likesPos > 0 ? '<span class="tmvu-forum-post-like-pos">+' + p.likesPos + '</span>' : '')
                            + (p.likesNeg > 0 ? ' <span class="tmvu-forum-post-like-neg">-' + p.likesNeg + '</span>' : '');
            return '<div class="tmvu-forum-post">'
                // user card
                + '<div class="tmvu-forum-post-user">'
                +   '<div class="tmvu-forum-post-logo">'
                +     (p.logoSrc ? '<img src="' + esc(p.logoSrc) + '" alt="">' : '<span style="font-size:22px;opacity:.35">\u26BD</span>')
                +   '</div>'
                +   (p.clubHref
                    ? '<a class="tmvu-forum-post-club" href="' + esc(p.clubHref) + '">' + esc(p.clubName) + '</a>'
                    : (p.clubName ? '<span class="tmvu-forum-post-club">' + esc(p.clubName) + '</span>' : ''))
                +   (p.flagSrc ? '<div class="tmvu-forum-post-flag"><img src="' + esc(p.flagSrc) + '" alt=""></div>' : '')
                +   (p.rank ? '<div class="tmvu-forum-post-rank">' + esc(p.rank) + '</div>' : '')
                + '</div>'
                // post body
                + '<div class="tmvu-forum-post-body">'
                +   '<div class="tmvu-forum-post-meta">'
                +     (p.postAnchorId ? '<a class="tmvu-forum-post-num" id="' + esc(p.postAnchorId) + '" href="#' + esc(posNum) + '">' + esc(p.postNum) + '</a>' : '')
                +     (likesHtml ? '<span class="tmvu-forum-post-likes">' + likesHtml + '</span>' : '')
                +     (p.postDate ? '<span class="tmvu-forum-post-date">' + esc(p.postDate) + '</span>' : '')
                +   '</div>'
                +   '<div class="tmvu-forum-post-content">' + p.contentHtml + '</div>'
                +   '<div class="tmvu-forum-post-actions">'
                +     (p.postDbId ? '<button class="tmvu-post-btn" onclick="pop_likes(' + p.postDbId + ')">\u2665 ' + (p.likesPos || 0) + '</button>' : '')
                +     (p.seqNum ? '<button class="tmvu-post-btn" onclick="quote(' + p.seqNum + ')">Quote</button>' : '')
                +     '<button class="tmvu-post-btn" onclick="reply()">Reply</button>'
                +   '</div>'
                // hidden TM hooks: likes div (keeps ID for JS updates) + quote span
                +   '<div class="tmvu-post-hidden">' + p.likesDivHtml + p.quoteSpanHtml + '</div>'
                + '</div>'
                + '</div>';
        }).join('');

        const postsHost = document.createElement('div');
        TmSectionCard.mount(postsHost, {
            title: 'Posts',
            icon: '\uD83D\uDCAC',
            subtitle: pagerSummary,
            bodyHtml: posts.length
                ? '<div class="tmvu-forum-posts">' + postsHtml + '</div>'
                  + '<div class="tmvu-forum-pager-footer">' + pagerHtml(pagerLinks) + '</div>'
                : TmUI.empty('No posts found.'),
        });
        col.appendChild(postsHost.firstElementChild || postsHost);

        if (formHtml) {
            const formHost = document.createElement('div');
            TmSectionCard.mount(formHost, {
                hostClass: 'tmvu-forum-reply-card',
                title: 'Reply',
                icon: '\u270D',
                bodyHtml: formHtml,
            });
            col.appendChild(formHost.firstElementChild || formHost);
        }

        main.appendChild(col);
    }

    // ── entry: wait for AJAX content, then dispatch ───────────────────────────

    function waitForContent(cb) {
        const check = () => document.querySelector('.forum_topics, .topic_post');
        if (check()) { cb(); return; }
        const obs = new MutationObserver(() => {
            if (check()) { obs.disconnect(); cb(); }
        });
        obs.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }

    waitForContent(function () {
        const main = document.querySelector('.tmvu-main') || document.querySelector('.main_center');
        if (!main) return;
        const src = main.cloneNode(true);
        if (src.querySelector('.forum_topics')) {
            renderListing(main, src);
        } else if (src.querySelector('.topic_post')) {
            renderThread(main, src);
        }
    });

})();
'@

[System.IO.File]::WriteAllText('H:\projects\Moji\tmscripts\src\pages\forum.js', $content, [System.Text.Encoding]::UTF8)
Write-Host "Written"
