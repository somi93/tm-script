import { TmSectionCard } from '../shared/tm-section-card.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmPlayerModel } from '../../models/player.js';
import { TmPlayerTooltip } from '../player/tooltip/tm-player-tooltip.js';
import { TmMessagesModel } from '../../models/messages.js';
import { TmStars } from '../shared/tm-stars.js';
import { esc, clean } from './tm-forum-utils.js';

const btn = (opts) => (TmUI.button(opts) || document.createElement('span')).outerHTML;

/**
 * Render a single post as HTML string.
 * @param {object} p  parsed post data
 * @returns {string}
 */
function postHtml(p) {
    const posNum = p.postNum.replace('#', '');
    const likesHtml =
        (p.likesPos > 0 ? '<span class="tmvu-forum-post-like-pos">+' + p.likesPos + '</span>' : '')
        + (p.likesNeg > 0 ? ' <span class="tmvu-forum-post-like-neg">-' + p.likesNeg + '</span>' : '');
    const flagEl = p.flagSrc
        ? '<div class="tmvu-forum-post-flag">'
            + (p.flagHref ? '<a href="' + esc(p.flagHref) + '">' : '')
            + '<img src="' + esc(p.flagSrc) + '" alt="">'
            + (p.flagHref ? '</a>' : '')
            + '</div>'
        : '';
    const veteranEl = p.veteranSrc
        ? '<img class="tmvu-forum-post-veteran" src="' + esc(p.veteranSrc) + '" title="' + esc(p.veteranTip) + '" alt="' + esc(p.veteranTip) + '">'
        : '';
    const proEl = p.isPro ? '<img class="tmvu-forum-post-pro" src="/pics/pro_icon.png" title="TM Pro" alt="Pro">' : '';
    const franksEl = p.forumRankImgs.length
        ? '<div class="tmvu-forum-post-franks">' + p.forumRankImgs.map(src => '<img src="' + esc(src) + '">').join('') + '</div>'
        : '';

    return '<div class="tmvu-forum-post"' + (p.postDbId ? ' id="tmvu-post-' + p.postDbId + '"' : '') + '>'
        // user card
        + '<div class="tmvu-forum-post-user">'
        + '<div class="tmvu-forum-post-logo">'
        + (p.clubHref ? '<a href="' + esc(p.clubHref) + '">' : '')
        + (p.logoSrc ? '<img src="' + esc(p.logoSrc) + '" alt="">' : '<span style="font-size:var(--tmu-font-xl);opacity:.35">\u26BD</span>')
        + (p.clubHref ? '</a>' : '')
        + '</div>'
        + (p.clubHref
            ? '<a class="tmvu-forum-post-club" href="' + esc(p.clubHref) + '">' + esc(p.clubName) + '</a>'
            : (p.clubName ? '<span class="tmvu-forum-post-club">' + esc(p.clubName) + '</span>' : ''))
        + flagEl
        + '<div class="tmvu-forum-post-badges">' + proEl + veteranEl + franksEl + '</div>'
        + (p.rank ? '<div class="tmvu-forum-post-rank">' + esc(p.rank) + '</div>' : '')
        + '</div>'
        // post body
        + '<div class="tmvu-forum-post-body">'
        + '<div class="tmvu-forum-post-meta">'
        + (p.postAnchorId ? '<a class="tmvu-forum-post-num" id="' + esc(p.postAnchorId) + '" href="#' + esc(posNum) + '">' + esc(p.postNum) + '</a>' : '')
        + (likesHtml && p.postDbId ? '<span class="tmvu-forum-post-likes" onclick="pop_likes(' + p.postDbId + ')" title="See who liked this">' + likesHtml + '</span>' : likesHtml ? '<span class="tmvu-forum-post-likes">' + likesHtml + '</span>' : '')
        + (p.postDate ? '<span class="tmvu-forum-post-date">' + esc(p.postDate) + '</span>' : '')
        + '</div>'
        + '<div class="tmvu-forum-post-content">' + p.contentHtml + '</div>'
        + '<div class="tmvu-forum-post-actions">'
        + (p.postDbId ? btn({ label: '\u2665 ' + (p.likesPos || 0), cls: 'tmvu-post-btn', color: 'secondary', size: 'xs', attrs: { onclick: 'pop_likes(' + p.postDbId + ')' } }) : '')
        + (p.postDbId ? '<div class="tmvu-post-like-btns" id="tmvu-like-btns-' + p.postDbId + '">'
            + btn({ label: '\uD83D\uDC4D', cls: 'tmvu-post-btn', color: 'secondary', size: 'xs', attrs: { onclick: '_tmvuPost.like(' + p.postDbId + ',1)', title: 'Like' } })
            + btn({ label: '\uD83D\uDC4E', cls: 'tmvu-post-btn', color: 'secondary', size: 'xs', attrs: { onclick: '_tmvuPost.like(' + p.postDbId + ',2)', title: 'Dislike' } })
            + '</div>' : '')
        + (p.seqNum   ? btn({ label: 'Quote', cls: 'tmvu-post-btn', color: 'secondary', size: 'xs', attrs: { onclick: 'quote(' + p.seqNum + ')' } }) : '')
        + btn({ label: 'Reply', cls: 'tmvu-post-btn', color: 'secondary', size: 'xs', attrs: { onclick: 'reply()' } })
        + '</div>'
        + '<div class="tmvu-post-hidden">' + p.likesDivHtml + p.quoteSpanHtml + '</div>'
        + '</div>'
        + '</div>';
}

/**
 * Resolve all player link anchors inside a post content container:
 * - Replaces href-based player links
 * - Replaces bare @playerID / [player=ID] text nodes
 */
function resolvePlayerMentions(contentEl) {
    const enrich = (pid, anchor) => {
        TmPlayerModel.fetchTooltipCached(pid).then(player => {
            if (!player) return;
            const name = player.name || '';
            if (!name) return;
            const retired = !player.club_id;
            const starsHtml = player.rec != null ? TmStars.recommendation(player.rec, 'tmvu-pstars') : '';
            const ageHtml = !retired && player.ageMonthsString ? `<span class="tmvu-pinfo">${player.ageMonthsString}</span> ` : '';
            const r5Html  = !retired && player.r5 != null ? ` <span class="tmvu-pinfo">${Number(player.r5).toFixed(2)}</span>` : '';
            anchor.innerHTML = starsHtml + ageHtml + esc(name) + r5Html;
        }).catch(() => { });
    };

    // Step 1: existing <a href="/players/ID/"> anchors
    contentEl.querySelectorAll('a[href]').forEach(a => {
        const m = (a.getAttribute('href') || '').match(/\/players?\/(\d+)\//);
        if (!m) return;
        const pid = m[1];
        if (!a.getAttribute('player_link')) a.setAttribute('player_link', pid);
        enrich(pid, a);
    });

    // Step 2: bare @playerID or [player=ID] text nodes not inside an anchor
    const walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    let n;
    while ((n = walker.nextNode())) {
        if (/(@player\d+|\[player=\d+\])/.test(n.textContent) && !n.parentElement?.closest('a')) textNodes.push(n);
    }
    textNodes.forEach(textNode => {
        const parts = textNode.textContent.split(/(@player(\d+)|\[player=(\d+)\])/);
        if (parts.length <= 1) return;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < parts.length; i++) {
            if (i % 4 === 0) {
                if (parts[i]) frag.appendChild(document.createTextNode(parts[i]));
            } else if (i % 4 === 1) {
                const pid = parts[i + 1] || parts[i + 2];
                const a = document.createElement('a');
                a.setAttribute('player_link', pid);
                a.href = '/players/' + pid + '/';
                a.textContent = parts[i];
                enrich(pid, a);
                frag.appendChild(a);
            }
            // i % 4 === 2,3 are inner capture groups — skip
        }
        textNode.parentNode?.replaceChild(frag, textNode);
    });
}

export const TmForumPosts = {
    /**
     * Parse post elements from TM forum element.
     * @param {Element} forumEl
     * @returns {Array}
     */
    parse(forumEl) {
        return Array.from(forumEl.querySelectorAll('.topic_post')).map(postEl => {
            const userEl = postEl.querySelector('.user');
            const clubA = userEl?.querySelector('a[club_link]');
            const logoLink = userEl?.querySelector('a[no_logo]')
                || userEl?.querySelector('a.logo_large')
                || userEl?.querySelector('a.logo_normal')
                || userEl?.querySelector('a:has(.club_logo)');
            const logoClubId = logoLink?.getAttribute('no_logo') || '';
            const logoImgEl = logoLink?.querySelector('.club_logo') || userEl?.querySelector('.club_logo');
            const logoSrc = (logoImgEl?.getAttribute('src') || '') || (logoClubId ? '/pics/club_logos/' + logoClubId + '.png' : '');
            const valign = userEl?.querySelector('.valign_all');
            const flagA = valign?.querySelector('a[href*="/national-teams/"]');
            const flagImg = flagA?.querySelector('img');
            const veteranImg = valign?.querySelector('img[src*="veteran_rank"]');
            const isPro = !!valign?.querySelector('.pro_icon');
            const forumRankImgs = Array.from(userEl?.querySelectorAll('.forum_rank') || []).map(img => img.getAttribute('src') || '');
            const actionsEl = postEl.querySelector('.actions');
            const postNumA = actionsEl?.querySelector('.post_number a');

            const textEl = postEl.querySelector('.content .text');
            if (textEl) textEl.querySelectorAll('.signature, .text_fade_overlay').forEach(el => el.remove());

            const likesDiv = actionsEl?.querySelector('.likes');
            const likesPos = parseInt(likesDiv?.querySelector('.positive')?.getAttribute('current_value') || '0', 10);
            const likesNeg = parseInt(likesDiv?.querySelector('.negative')?.getAttribute('current_value') || '0', 10);

            const likesDivHtml = likesDiv?.outerHTML || '';
            const quoteSpanHtml = actionsEl?.querySelector('[id^="quote_post"]')?.outerHTML || '';

            const iAttr = postEl.getAttribute('i');
            const seqNum = iAttr != null ? String(parseInt(iAttr, 10) + 1) : '';

            return {
                postDbId: postEl.getAttribute('id')?.replace('post', '') || '',
                postNum: clean(postNumA?.textContent || ''),
                postAnchorId: postNumA?.getAttribute('id') || '',
                postDate: clean(actionsEl?.querySelector('.post_time')?.textContent || ''),
                clubHref: clubA?.getAttribute('href') || (logoClubId ? '/club/' + logoClubId + '/' : ''),
                clubName: clean(clubA?.textContent || ''),
                logoSrc,
                flagSrc: flagImg?.getAttribute('src') || '',
                flagHref: flagA?.getAttribute('href') || '',
                veteranSrc: veteranImg?.getAttribute('src') || '',
                veteranTip: veteranImg?.getAttribute('tooltip') || '',
                isPro,
                forumRankImgs,
                rank: clean(postEl.querySelector('.user_rank')?.textContent || ''),
                contentHtml: (textEl?.querySelector('span') || textEl)?.innerHTML || '',
                likesDivHtml,
                quoteSpanHtml,
                likesPos,
                likesNeg,
                seqNum,
            };
        });
    },

    /**
     * Mount the posts section into col.
     * Resolves player mentions and wires hover tooltips.
     * @param {Element} col
     * @param {{ posts, pagerSummary, pagerLinks, pagerHtml }} props
     * @returns {Element}
     */
    mount(col, { posts, pagerSummary, pagerLinks, pagerHtml }) {
        const postsHost = document.createElement('div');
        TmSectionCard.mount(postsHost, {
            title: 'Posts',
            icon: '\uD83D\uDCAC',
            subtitle: pagerSummary,
            bodyHtml: posts.length
                ? '<div class="tmvu-forum-posts tmu-stack tmu-stack-density-tight">'
                    + posts.map(postHtml).join('')
                    + '</div>'
                    + '<div class="tmvu-forum-pager-footer">' + pagerHtml(pagerLinks) + '</div>'
                : TmUI.empty('No posts found.'),
        });
        const el = postsHost.firstElementChild || postsHost;
        col.appendChild(el);

        // Resolve player mentions in post content
        el.querySelectorAll('.tmvu-forum-post-content').forEach(resolvePlayerMentions);

        // Player link hover tooltip
        let tipTimer = null;
        col.addEventListener('mouseover', (e) => {
            const anchor = e.target.closest('[player_link]');
            if (!anchor || anchor.contains(e.relatedTarget)) return;
            clearTimeout(tipTimer);
            const pid = anchor.getAttribute('player_link');
            if (!pid) return;
            tipTimer = setTimeout(() => {
                TmPlayerModel.fetchTooltipCached(pid).then(player => {
                    if (player) TmPlayerTooltip.show(anchor, player);
                }).catch(() => { });
            }, 200);
        });
        col.addEventListener('mouseout', (e) => {
            const anchor = e.target.closest('[player_link]');
            if (!anchor || anchor.contains(e.relatedTarget)) return;
            clearTimeout(tipTimer);
            TmPlayerTooltip.hide();
        });

        window._tmvuPost = {
            like(postId, likeType) {
                const btnsEl = document.getElementById('tmvu-like-btns-' + postId);
                if (!btnsEl) return;
                const origHtml = btnsEl.innerHTML;
                btnsEl.innerHTML = '<span class="tmvu-post-like-loader">\u23F3</span>';

                const likesDiv = document.querySelector('#like_post' + postId);
                const currentValue = likesDiv?.getAttribute('current_value') || '0';

                TmMessagesModel.likeForumPost(String(postId), likeType, currentValue).then(data => {
                    if (data != null) {
                        const postEl = document.getElementById('tmvu-post-' + postId);
                        const metaEl = postEl?.querySelector('.tmvu-forum-post-meta');
                        let likesEl = postEl?.querySelector('.tmvu-forum-post-likes');

                        const posSpan = likesDiv?.querySelector('.positive');
                        const negSpan = likesDiv?.querySelector('.negative');
                        let pos = parseInt(posSpan?.getAttribute('current_value') || '0', 10) || 0;
                        let neg = parseInt(negSpan?.getAttribute('current_value') || '0', 10) || 0;
                        if (likeType === 1) pos++;
                        else neg++;

                        const newHtml =
                            (pos > 0 ? '<span class="tmvu-forum-post-like-pos">+' + pos + '</span>' : '')
                            + (pos > 0 && neg > 0 ? ' ' : '')
                            + (neg > 0 ? '<span class="tmvu-forum-post-like-neg">-' + neg + '</span>' : '');

                        if (likesEl) {
                            likesEl.innerHTML = newHtml;
                        } else if (metaEl && newHtml) {
                            likesEl = document.createElement('span');
                            likesEl.className = 'tmvu-forum-post-likes';
                            likesEl.setAttribute('onclick', 'pop_likes(' + postId + ')');
                            likesEl.setAttribute('title', 'See who liked this');
                            likesEl.innerHTML = newHtml;
                            const dateEl = metaEl.querySelector('.tmvu-forum-post-date');
                            if (dateEl) metaEl.insertBefore(likesEl, dateEl);
                            else metaEl.appendChild(likesEl);
                        }

                        btnsEl.innerHTML = origHtml;
                    } else {
                        btnsEl.innerHTML = origHtml;
                    }
                }).catch(() => {
                    btnsEl.innerHTML = origHtml;
                });
            },
        };

        return el;
    },
};
