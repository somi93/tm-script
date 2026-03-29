import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmNativeFeed } from '../components/shared/tm-native-feed.js';
import { TmUI }         from '../components/shared/tm-ui.js';
import { TmButton }     from '../components/shared/tm-button.js';
import { TmApi }        from '../services/index.js';
import { buildHomeFeedModel } from '../utils/home-feed.js';
import { buildNativeHomeFeedPostMap, findNativeHomeFeedAction, findNativeHomeFeedCommentControls, queryVisibleNativeFeedPosts } from '../utils/home-feed-native.js';

(function () {
    'use strict';

    if (!/^\/home\/?$/i.test(window.location.pathname)) return;

    const STYLE_ID = 'tmvu-home-style';
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (v) => String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const renderFlag = (country) => {
        const normalized = clean(country).toLowerCase();
        if (typeof window.get_flag === 'function' && normalized) return window.get_flag(normalized);
        if (!normalized) return '';
        return `<span class="tmvu-home-feed-flag-fallback">${escapeHtml(normalized.toUpperCase())}</span>`;
    };

    const formatFeedLikeTime = (unixTime) => {
        const value = Number(unixTime);
        if (!Number.isFinite(value) || value <= 0) return '';
        try {
            return new Date(value * 1000).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (_) {
            return '';
        }
    };

    const renderFeedLogo = (src, fallbackSrc = '') => {
        const primary = escapeHtml(src || '');
        const fallback = escapeHtml(fallbackSrc || '');
        if (!primary) return '<span class="tmvu-home-feed-side-fallback">⚽</span>';
        if (!fallback || fallback === primary) return `<img src="${primary}" alt="">`;
        return `<img src="${primary}" data-fallback-src="${fallback}" onerror="if(this.dataset.fallbackSrc&&this.src!==this.dataset.fallbackSrc){this.src=this.dataset.fallbackSrc;this.removeAttribute('data-fallback-src');return;}this.onerror=null;this.style.display='none'" alt="">`;
    };

    const renderFeedDialogLogo = (clubId) => {
        const id = clean(clubId);
        if (!id) return '<span class="tmvu-home-feed-side-fallback">⚽</span>';
        return `<img src="/pics/club_logos/${escapeHtml(id)}.png" onerror="this.onerror=null;this.style.display='none';this.insertAdjacentHTML('afterend','<span class=&quot;tmvu-home-feed-side-fallback&quot;>⚽</span>')" alt="">`;
    };

    const normalizeFeedLikes = (payload) => {
        const likes = Array.isArray(payload?.likes) ? payload.likes : [];
        const clubs = payload?.clubs && typeof payload.clubs === 'object' ? payload.clubs : {};
        return likes.map((like) => {
            const clubId = clean(like?.club_id);
            const clubInfo = clubs[clubId] || {};
            const timeValue = Number(like?.time) || 0;
            return {
                id: clean(like?.id),
                clubId,
                clubName: clean(like?.club_name || clubInfo?.club_name) || `#${clubId}`,
                managerName: clean(clubInfo?.manager_name),
                country: clean(clubInfo?.country).toLowerCase(),
                timeValue,
                timeText: formatFeedLikeTime(timeValue),
                href: clubId ? `/club/${clubId}/` : '',
            };
        }).sort((left, right) => left.timeValue - right.timeValue);
    };

    const showFeedLikesDialog = async (post) => {
        const postId = clean(post?.id);
        if (!postId) return;

        const existing = document.getElementById('tmvu-home-feed-likes-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'tmvu-home-feed-likes-overlay';
        overlay.className = 'tmvu-home-feed-likes-overlay';
        overlay.innerHTML = `
            <div class="tmvu-home-feed-likes-dialog" role="dialog" aria-modal="true" aria-labelledby="tmvu-home-feed-likes-title">
                <div class="tmvu-home-feed-likes-head">
                    <div>
                        <div id="tmvu-home-feed-likes-title" class="tmvu-home-feed-likes-title">Likes</div>
                        <div class="tmvu-home-feed-likes-subtitle">Loading clubs who liked this post...</div>
                    </div>
                    <button type="button" class="tmvu-home-feed-likes-close" data-feed-likes-close>Close</button>
                </div>
                <div class="tmvu-home-feed-likes-body" data-feed-likes-body>
                    <div class="tmvu-home-empty">Loading likes...</div>
                </div>
            </div>
        `;

        const closeDialog = () => {
            document.removeEventListener('keydown', onKeyDown);
            overlay.remove();
        };

        const onKeyDown = (event) => {
            if (event.key === 'Escape') closeDialog();
        };

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay || event.target.closest('[data-feed-likes-close]')) closeDialog();
        });

        document.addEventListener('keydown', onKeyDown);
        document.body.appendChild(overlay);

        const body = overlay.querySelector('[data-feed-likes-body]');
        const subtitle = overlay.querySelector('.tmvu-home-feed-likes-subtitle');
        const payload = await TmApi.fetchFeedLikes(postId);
        const likes = normalizeFeedLikes(payload);

        subtitle.textContent = likes.length
            ? `${likes.length} club${likes.length === 1 ? '' : 's'} liked this post`
            : 'No likes found for this post';

        if (!likes.length) {
            body.innerHTML = '<div class="tmvu-home-empty">No likes returned by the feed endpoint.</div>';
            return;
        }

        body.innerHTML = `
            <div class="tmvu-home-feed-likes-list">
                ${likes.map((like) => `
                    <a class="tmvu-home-feed-likes-item" href="${escapeHtml(like.href || '#')}">
                        <div class="tmvu-home-feed-likes-item-logo">${renderFeedDialogLogo(like.clubId)}</div>
                        <div class="tmvu-home-feed-likes-item-copy">
                            <div class="tmvu-home-feed-likes-item-name">${like.country ? `${renderFlag(like.country)} ` : ''}${escapeHtml(like.clubName)}</div>
                            <div class="tmvu-home-feed-likes-item-meta">${escapeHtml([like.managerName, like.timeText].filter(Boolean).join(' • '))}</div>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    };

    const expandedFeedPostIds = new Set();
    const expandedSimilarFeedPostIds = new Set();

    const injectStyles = () => {
        const rules = [
            '.tmvu-home-page{display:grid!important;grid-template-columns:minmax(0,1fr) 320px;gap:20px;align-items:start;max-width:1120px;margin:0 auto}',
            '.tmvu-home-left{display:flex;flex-direction:column;gap:16px;min-width:0}',
            '.tmvu-home-right{display:flex;flex-direction:column;gap:16px;min-width:0}',
            '.tmvu-home-tabs-card .tmu-card-body{padding:0!important;gap:0!important}',
            '.tmvu-home-tabs-host{display:flex;flex-direction:column;min-width:0}',
            '.tmvu-home-tabpanel{display:none;padding:14px 16px 16px}',
            '.tmvu-home-tabpanel.tmvu-tab-active{display:block}',
            '.tmvu-home-native-source{display:none!important}',
            '.tmvu-home-empty{padding:16px 4px;color:#78906a;font-size:12px}',
            '.tmvu-home-feed{display:flex;flex-direction:column;gap:10px}',
            '.tmvu-home-feed-post{display:flex;gap:14px;padding:14px;border-radius:12px;border:1px solid rgba(90,126,42,.15);background:rgba(12,24,9,.22)}',
            '.tmvu-home-feed-post--similar{margin-left:18px;padding-left:18px;position:relative}',
            '.tmvu-home-feed-post--similar::before{content:"";position:absolute;left:8px;top:12px;bottom:12px;width:2px;border-radius:999px;background:rgba(205,233,76,.18)}',
            '.tmvu-home-feed-side{flex-shrink:0;width:140px;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}',
            '.tmvu-home-feed-side-logo{width:72px;height:72px;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.2)}',
            '.tmvu-home-feed-side-logo img{max-width:72px;max-height:72px;width:auto;height:auto;object-fit:contain;display:block}',
            '.tmvu-home-feed-side-fallback{font-size:28px;opacity:.35}',
            '.tmvu-home-feed-side-name{font-size:11px;font-weight:700;color:#c8e4a4;text-decoration:none;line-height:1.3;word-break:break-word}',
            '.tmvu-home-feed-side-name:hover{color:#fff}',
            '.tmvu-home-feed-main{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:8px}',
            '.tmvu-home-feed-head{display:flex;align-items:center;gap:10px;padding-bottom:2px}',
            '.tmvu-home-feed-time{display:block;float:right;font-size:11px;color:#6a8e52;white-space:nowrap}',
            '.tmvu-home-feed-body{font-size:13px;color:#d4e8c0;line-height:1.65;word-break:break-word}',
            '.tmvu-home-feed-body a{color:#8ecc60;text-decoration:none}',
            '.tmvu-home-feed-body a:hover{text-decoration:underline}',
            '.tmvu-feed-stars{display:inline-flex;align-items:center;gap:1px;vertical-align:baseline}',
            '.tmvu-feed-stars-full{color:#fbbf24}',
            '.tmvu-feed-stars-empty{color:#3d6828}',
            '.tmvu-home-feed-meta{display:flex;align-items:center;justify-content:flex-start;gap:10px;padding-bottom:2px;color:#7f976f}',
            '.tmvu-home-feed-meta-left{display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
            '.tmvu-home-feed-like-count,.tmvu-home-feed-comment-count{display:inline-flex;align-items:center;gap:6px;min-height:24px;padding:0 10px;border-radius:999px;border:1px solid rgba(61,104,40,.18);background:rgba(42,74,28,.18);color:#d5e5c8;font-size:11px;font-weight:800;line-height:1;letter-spacing:.01em}',
            '.tmvu-home-feed-like-count::before{content:"♥";font-size:10px;color:#7fc65a}',
            '.tmvu-home-feed-comment-count::before{content:"💬";font-size:11px;opacity:.9}',
            '.tmvu-home-feed-like-count{cursor:pointer;transition:background .12s,border-color .12s,color .12s;background:rgba(37,84,34,.18);border:none}',
            '.tmvu-home-feed-like-count:hover{background:rgba(108,192,64,.1);color:#edf7e7}',
            '.tmvu-home-feed-like-count:disabled{opacity:.55;cursor:default}',
            '.tmvu-home-feed-comment-count{border:none}',
            '.tmvu-home-feed-comment-count.tmvu-home-feed-comment-count--action{cursor:pointer;transition:background .12s,color .12s}',
            '.tmvu-home-feed-comment-count.tmvu-home-feed-comment-count--action:hover{background:rgba(108,192,64,.08);color:#edf7e7}',
            '.tmvu-home-feed-date{font-size:11px;color:#7f976f;white-space:nowrap}',
            '.tmvu-home-feed-actions{display:flex;gap:8px;align-items:center;padding-top:2px}',
            '.tmvu-home-feed-action{appearance:none;padding:4px 10px;border-radius:6px;border:1px solid rgba(61,104,40,.25);background:rgba(42,74,28,.3);color:#a4cc88;cursor:pointer;font:inherit;font-size:11px;font-weight:700;line-height:1;text-decoration:none;display:inline-flex;align-items:center}',
            '.tmvu-home-feed-action:hover{background:rgba(108,192,64,.15);color:#e0f0c0;border-color:rgba(108,192,64,.3)}',
            '.tmvu-home-feed-action:disabled{opacity:.45;cursor:default}',
            '.tmvu-home-feed-similar{display:flex;justify-content:flex-end;padding:10px 0 0 18px;margin-top:10px;border-top:1px solid rgba(255,255,255,.04)}',
            '.tmvu-home-feed-similar-btn{appearance:none;background:transparent;border:none;color:#cde94c;cursor:pointer;font:inherit;font-size:12px;font-weight:800;line-height:1.2;padding:0;display:inline-flex;align-items:center;gap:6px}',
            '.tmvu-home-feed-similar-btn:hover{color:#e6f67f}',
            '.tmvu-home-feed-composer{margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,.04)}',
            '.tmvu-home-feed-composer[hidden]{display:none!important}',
            '.tmvu-home-feed-composer-input{width:100%;min-height:84px;box-sizing:border-box;background:rgba(0,0,0,.28);border:1px solid rgba(61,104,40,.42);border-radius:10px;color:#dcebd5;padding:10px 12px;font:inherit;font-size:12px;line-height:1.45;resize:vertical}',
            '.tmvu-home-feed-composer-input::placeholder{color:#759067}',
            '.tmvu-home-feed-composer-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:8px}',
            '.tmvu-home-feed-composer-btn{appearance:none;border:1px solid rgba(61,104,40,.42);background:rgba(0,0,0,.22);border-radius:999px;color:#c8e0b4;cursor:pointer;font:inherit;font-size:11px;font-weight:700;line-height:1;padding:7px 12px}',
            '.tmvu-home-feed-composer-btn:hover{background:rgba(61,104,40,.22);border-color:rgba(108,192,64,.45);color:#e8f5d8}',
            '.tmvu-home-feed-composer-btn[data-role="submit"]{background:rgba(61,104,40,.28);color:#eef8e8}',
            '.tmvu-home-feed-comments{display:flex;flex-direction:column;gap:10px;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.04)}',
            '.tmvu-home-feed-more-comments{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.028);border:1px dashed rgba(255,255,255,.06);color:#d8e8cc;cursor:pointer}',
            '.tmvu-home-feed-more-comments:hover{background:rgba(255,255,255,.04);border-color:rgba(108,192,64,.16)}',
            '.tmvu-home-feed-more-comments-badge{display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;border-radius:8px;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.2);font-size:18px;color:#86aa6b}',
            '.tmvu-home-feed-more-comments-copy{display:flex;flex-direction:column;gap:2px;min-width:0}',
            '.tmvu-home-feed-more-comments-title{font-size:12px;font-weight:800;color:#e5f2dd}',
            '.tmvu-home-feed-more-comments-sub{font-size:10px;color:#7f976f}',
            '.tmvu-home-feed-comment{display:flex;align-items:flex-start;gap:12px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,.022);border:1px solid rgba(255,255,255,.03)}',
            '.tmvu-home-feed-comment-logo{flex:0 0 42px;width:42px;height:42px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.2)}',
            '.tmvu-home-feed-comment-logo img{max-width:42px;max-height:42px;width:auto;height:auto;object-fit:contain;display:block}',
            '.tmvu-home-feed-comment-content{flex:1 1 auto;min-width:0}',
            '.tmvu-home-feed-comment-time{display:block;float:right;font-size:10px;color:#6f8662;margin-left:8px}',
            '.tmvu-home-feed-comment-body{font-size:12px;line-height:1.55;color:#cfe0c6}',
            '.tmvu-home-feed-flag-fallback{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:12px;padding:0 3px;border-radius:3px;background:rgba(255,255,255,.08);font-size:9px;font-weight:800;line-height:1;color:#d8e7cc;vertical-align:middle}',
            '.tmvu-home-feed-likes-overlay{position:fixed;inset:0;z-index:200000;background:rgba(0,0,0,.72);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px}',
            '.tmvu-home-feed-likes-dialog{width:min(520px,100%);max-height:min(72vh,760px);display:flex;flex-direction:column;gap:14px;padding:18px;border-radius:14px;border:1px solid rgba(108,192,64,.22);background:linear-gradient(160deg,#1a2e14 0%,#0e1e0a 100%);box-shadow:0 20px 60px rgba(0,0,0,.8)}',
            '.tmvu-home-feed-likes-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}',
            '.tmvu-home-feed-likes-title{font-size:15px;font-weight:800;color:#eef8e8}',
            '.tmvu-home-feed-likes-subtitle{margin-top:4px;font-size:11px;color:#8eb079}',
            '.tmvu-home-feed-likes-close{appearance:none;border:1px solid rgba(108,192,64,.18);background:rgba(42,74,28,.28);border-radius:999px;color:#dcebd4;cursor:pointer;font:inherit;font-size:11px;font-weight:700;line-height:1;padding:8px 12px}',
            '.tmvu-home-feed-likes-close:hover{background:rgba(108,192,64,.12)}',
            '.tmvu-home-feed-likes-body{overflow:auto;padding-right:4px}',
            '.tmvu-home-feed-likes-list{display:flex;flex-direction:column;gap:8px}',
            '.tmvu-home-feed-likes-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.02);text-decoration:none}',
            '.tmvu-home-feed-likes-item:hover{background:rgba(255,255,255,.04);border-color:rgba(108,192,64,.16)}',
            '.tmvu-home-feed-likes-item-logo{flex:0 0 40px;width:40px;height:40px;border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.2)}',
            '.tmvu-home-feed-likes-item-logo img{max-width:40px;max-height:40px;width:auto;height:auto;object-fit:contain;display:block}',
            '.tmvu-home-feed-likes-item-copy{min-width:0;display:flex;flex-direction:column;gap:3px}',
            '.tmvu-home-feed-likes-item-name{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:800;color:#e6f2dd}',
            '.tmvu-home-feed-likes-item-meta{font-size:10px;color:#7f976f}',
            '.tmvu-home-feed-load-more{display:flex;justify-content:center;padding-top:12px}',
            '.tmvu-home-feed-load-more-btn{appearance:none;min-width:190px;padding:9px 16px;border-radius:999px;border:1px solid rgba(108,192,64,.22);background:rgba(42,74,28,.28);color:#d8eacb;cursor:pointer;font:inherit;font-size:12px;font-weight:800;line-height:1.1}',
            '.tmvu-home-feed-load-more-btn:hover{background:rgba(108,192,64,.14);border-color:rgba(108,192,64,.35)}',
            '.tmvu-home-feed-load-more-btn:disabled{opacity:.6;cursor:default}',
            '.tmvu-home-list{display:flex;flex-direction:column;gap:8px}',
            '.tmvu-home-list-item{display:block;padding:10px 12px;border:1px solid rgba(255,255,255,.04);border-radius:10px;background:rgba(255,255,255,.02);text-decoration:none}',
            '.tmvu-home-list-item:hover{background:rgba(255,255,255,.035);border-color:rgba(108,192,64,.12)}',
            '.tmvu-home-list-title{font-size:12px;font-weight:700;color:#e5f2dd;line-height:1.4}',
            '.tmvu-home-list-sub{margin-top:4px;font-size:10px;color:#7b936d;line-height:1.45}',
            '.tmvu-home-cal{display:flex;flex-direction:column;gap:10px}',
            '.tmvu-home-cal-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.04)}',
            '.tmvu-home-cal-title{font-size:14px;font-weight:700;color:#d9ead1}',
            '.tmvu-home-cal-note{display:none}',
            '.tmvu-home-cal-kpis{display:none}',
            '.tmvu-home-cal-list{display:flex;flex-direction:column;gap:8px;border:none;border-radius:0;overflow:visible;background:transparent}',
            '.tmvu-home-cal-day{display:grid;grid-template-columns:68px 1fr;min-width:0;border:1px solid rgba(255,255,255,.04);border-radius:10px;overflow:hidden;background:rgba(255,255,255,.015)}',
            '.tmvu-home-cal-day-stamp{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:14px 10px;background:rgba(0,0,0,.10);border-right:1px solid rgba(255,255,255,.04)}',
            '.tmvu-home-cal-day-num{font-size:24px;font-weight:800;line-height:1;color:#698857;font-variant-numeric:tabular-nums}',
            '.tmvu-home-cal-day-name{margin-top:4px;font-size:9px;font-weight:700;letter-spacing:.11em;text-transform:uppercase;color:#4f6642}',
            '.tmvu-home-cal-day--today{border-color:rgba(108,192,64,.12);background:rgba(108,192,64,.025)}',
            '.tmvu-home-cal-day--today .tmvu-home-cal-day-stamp{background:rgba(108,192,64,.06)}',
            '.tmvu-home-cal-day--today .tmvu-home-cal-day-num{color:#dcecd2;text-shadow:none}',
            '.tmvu-home-cal-day--today .tmvu-home-cal-day-name{color:#91b474}',
            '.tmvu-home-cal-day--past .tmvu-home-cal-day-stamp{background:transparent}',
            '.tmvu-home-cal-day--past .tmvu-home-cal-day-num{color:#47603a}',
            '.tmvu-home-cal-day--past .tmvu-home-cal-day-name{color:#34472a}',
            '.tmvu-home-cal-events{display:flex;flex-direction:column;padding:8px 10px;gap:4px;min-width:0}',
            '.tmvu-home-cal-empty{font-size:11px;color:#617758;padding:4px 0}',
            '.tmvu-home-cal-event{display:grid;grid-template-columns:52px 1fr;gap:12px;align-items:start;padding:7px 8px;border-radius:8px;border-left:2px solid transparent;background:rgba(0,0,0,.08);text-decoration:none;transition:background .12s,border-color .12s,color .12s}',
            '.tmvu-home-cal-event:hover{background:rgba(255,255,255,.03);transform:none}',
            '.tmvu-home-cal-event--match{border-left-color:rgba(108,192,64,.28)}',
            '.tmvu-home-cal-event--market{border-left-color:rgba(192,160,48,.28)}',
            '.tmvu-home-cal-time{padding-top:1px;font-size:12px;font-weight:800;color:#a8c980;font-variant-numeric:tabular-nums;letter-spacing:.02em}',
            '.tmvu-home-cal-day--past .tmvu-home-cal-time{color:#617851}',
            '.tmvu-home-cal-event-main{min-width:0;display:flex;flex-direction:column;gap:4px}',
            '.tmvu-home-cal-event-title{display:flex;align-items:center;flex-wrap:wrap;gap:5px;min-width:0;font-size:12px;font-weight:700;color:#dbe9d3;line-height:1.3}',
            '.tmvu-home-cal-event-meta{display:flex;align-items:center;flex-wrap:wrap;gap:6px;font-size:10px;color:#78906a;line-height:1.35}',
            '.tmvu-home-cal-event-sub{display:none}',
            '.tmvu-home-cal-event--market .tmvu-home-cal-event-title{color:#e7dcc0}',
            '.tmvu-home-cal-market-status{font-size:10px;font-weight:700;color:#cbc3a1}',
            '.tmvu-home-cal-market-price{display:inline-flex;align-items:center;gap:4px;padding:0;border:none;background:transparent;font-size:10px;font-weight:700;color:#cfb85d}',
            '.tmvu-home-cal-icon{width:16px;height:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
            '.tmvu-home-cal-icon img{width:14px;height:14px;display:block;opacity:.62}',
            '.tmvu-home-cal-logo{width:15px;height:15px;object-fit:contain;vertical-align:middle;flex-shrink:0;opacity:.86}',
            '.tmvu-home-cal-btag{display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;background:rgba(61,104,40,.6);color:#d7ebc7;border-radius:3px;font-size:8px;font-weight:800;flex-shrink:0}',
            '.tmvu-home-cal-tag{display:inline-flex;align-items:center;justify-content:center;padding:0;border-radius:0;background:transparent;border:none;font-size:9px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#8ca676}',
            '.tmvu-home-cal-tag--side{color:#c9d8be}',
            '.tmvu-home-cal-event--market .tmvu-home-cal-tag{color:#c7b25f}',
            '.tmvu-home-cal-coin{color:#d6ba52;font-weight:800;font-variant-numeric:tabular-nums}',
            '.tmvu-home-cal-bid{font-size:11px;color:#8aa073;display:inline-flex;align-items:center;gap:3px}',
            '.tmvu-home-nm{display:flex;flex-direction:column;gap:14px}',
            '.tmvu-home-nm-clubs{display:flex;align-items:center;justify-content:center;gap:22px;padding-top:6px}',
            '.tmvu-home-nm-logo{width:56px;height:56px;object-fit:contain}',
            '.tmvu-home-nm-vs{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#6d8758}',
            '.tmvu-home-nm-names{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:13px;font-weight:800;color:#eef8e8}',
            '.tmvu-home-nm-names>div:last-child{text-align:right}',
            '.tmvu-home-nm-names a{color:inherit;text-decoration:none}',
            '.tmvu-home-nm-info{padding:8px 10px;border-radius:10px;background:rgba(255,255,255,.03);font-size:11px;color:#90a882;text-align:center;line-height:1.4}',
            '.tmvu-home-nm-info a{color:#a8c980;text-decoration:none}',
            '.tmvu-home-nm-section{font-size:10px;font-weight:800;color:#789164;text-transform:uppercase;letter-spacing:.08em;padding-top:2px}',
            '.tmvu-home-prevmatch{display:grid;grid-template-columns:14px 20px 1fr;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.04)}',
            '.tmvu-home-prevmatch:last-child{border-bottom:none;padding-bottom:0}',
            '.tmvu-home-prevmatch-place{font-size:10px;font-weight:800;color:#647c56}',
            '.tmvu-home-prevmatch-logo{width:20px;height:20px;object-fit:contain;flex-shrink:0}',
            '.tmvu-home-prevmatch-info{display:flex;flex-direction:column;gap:1px;min-width:0}',
            '.tmvu-home-prevmatch-info a{font-size:11px;color:#dcebd5;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.tmvu-home-prevmatch-sub{font-size:10px;color:#6d845e}',
            '.tmvu-home-nm-all{display:block;text-align:center;font-size:11px;color:#9fd46a;text-decoration:none;padding-top:4px}',
            '.tmvu-home-forum{display:flex;flex-direction:column;gap:6px}',
            '.tmvu-home-thread{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:start;padding:9px 10px;border:1px solid rgba(255,255,255,.04);border-radius:8px;background:rgba(255,255,255,.015)}',
            '.tmvu-home-thread:hover{background:rgba(255,255,255,.03);border-color:rgba(108,192,64,.12)}',
            '.tmvu-home-thread-main{min-width:0;display:flex;align-items:flex-start;gap:7px}',
            '.tmvu-home-thread-dot{width:5px;height:5px;border-radius:999px;background:#6f8d5a;flex:0 0 auto;margin-top:7px;opacity:.9}',
            '.tmvu-home-thread-copy{min-width:0}',
            '.tmvu-home-thread a{font-size:12px;color:#dcebd5;text-decoration:none;display:block;line-height:1.4;font-weight:700}',
            '.tmvu-home-thread a:hover{color:#a8d86f}',
            '.tmvu-home-thread-date{font-size:10px;color:#7e9670;font-weight:800;white-space:nowrap;padding:3px 7px;border-radius:999px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.04)}',
            '.tmvu-home-forum-footer{padding-top:4px}',
            '.tmvu-home-forum-link{display:block;text-align:center;font-size:11px;font-weight:700;color:#96bf74;text-decoration:none;padding:8px 10px;border-radius:8px;border:1px solid rgba(255,255,255,.04);background:rgba(255,255,255,.015)}',
            '.tmvu-home-forum-link:hover{background:rgba(255,255,255,.03);color:#b8da94}',
            '.tmvu-home-forum-empty{font-size:12px;color:#738967}',
            '@media (max-width: 1120px){.tmvu-home-page{grid-template-columns:minmax(0,1fr)}.tmvu-home-right{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}}',
            '@media (max-width: 760px){.tmvu-home-feed-post{flex-direction:column}.tmvu-home-feed-side{width:100px}.tmvu-home-cal-head{flex-direction:column;align-items:flex-start}.tmvu-home-cal-day{grid-template-columns:58px 1fr}.tmvu-home-right{grid-template-columns:1fr}}',
        ];
        const style = document.getElementById(STYLE_ID) || document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = rules.join('');
        if (!style.parentNode) document.head.appendChild(style);
    };

    const buildNextMatch = (col2) => {
        const nmStd = col2.querySelector('.next_match.std, .next_match');
        if (!nmStd) return null;

        const wrap = document.createElement('div');
        wrap.className = 'tmvu-home-nm';

        // Club logos
        const logos = nmStd.querySelectorAll('.logos .club_logo');
        if (logos.length >= 2) {
            const row = document.createElement('div');
            row.className = 'tmvu-home-nm-clubs';

            const img1 = document.createElement('img');
            img1.src = logos[0].src;
            img1.alt = '';
            img1.className = 'tmvu-home-nm-logo';

            const vs = document.createElement('span');
            vs.className = 'tmvu-home-nm-vs';
            vs.textContent = 'VS';

            const img2 = document.createElement('img');
            img2.src = logos[1].src;
            img2.alt = '';
            img2.className = 'tmvu-home-nm-logo';

            row.appendChild(img1);
            row.appendChild(vs);
            row.appendChild(img2);
            wrap.appendChild(row);
        }

        // Club names
        const nameEls = nmStd.querySelectorAll('.names .name a');
        if (nameEls.length >= 2) {
            const row = document.createElement('div');
            row.className = 'tmvu-home-nm-names';
            nameEls.forEach(el => {
                const d = document.createElement('div');
                const a = document.createElement('a');
                a.href = el.getAttribute('href');
                a.textContent = clean(el.textContent);
                d.appendChild(a);
                row.appendChild(d);
            });
            wrap.appendChild(row);
        }

        // Competition + date
        const infoEl = nmStd.querySelector('.event.event_border');
        if (infoEl) {
            const d = document.createElement('div');
            d.className = 'tmvu-home-nm-info';
            d.innerHTML = infoEl.innerHTML;
            wrap.appendChild(d);
        }

        // Watch Pre Match button
        const btnEl = nmStd.querySelector('.match_link a');
        if (btnEl) {
            const btn = TmButton.button({
                label: clean(btnEl.textContent),
                color: 'primary',
                block: true,
                onClick: () => { location.href = btnEl.getAttribute('href'); },
            });
            wrap.appendChild(btn);
        }

        // Previous Matches
        const prevDiv = col2.querySelector('#previous_matches');
        if (prevDiv) {
            const sectionLabel = document.createElement('div');
            sectionLabel.className = 'tmvu-home-nm-section';
            sectionLabel.textContent = 'Previous Matches';
            wrap.appendChild(sectionLabel);

            prevDiv.querySelectorAll('.previous_match').forEach(pm => {
                const row = document.createElement('div');
                row.className = 'tmvu-home-prevmatch';

                const placeEl = pm.querySelector('.place');
                const logoEl = pm.querySelector('.logo img');
                const linkEl = pm.querySelector('.match_text a');
                const typeEl = pm.querySelector('.match_text .small');

                if (placeEl) {
                    const p = document.createElement('div');
                    p.className = 'tmvu-home-prevmatch-place';
                    p.textContent = clean(placeEl.textContent);
                    row.appendChild(p);
                }
                if (logoEl) {
                    const img = document.createElement('img');
                    img.src = logoEl.src;
                    img.alt = '';
                    img.className = 'tmvu-home-prevmatch-logo';
                    row.appendChild(img);
                }
                if (linkEl) {
                    const info = document.createElement('div');
                    info.className = 'tmvu-home-prevmatch-info';
                    const a = document.createElement('a');
                    a.href = linkEl.getAttribute('href');
                    a.textContent = clean(linkEl.textContent);
                    info.appendChild(a);
                    if (typeEl) {
                        const sub = document.createElement('div');
                        sub.className = 'tmvu-home-prevmatch-sub';
                        sub.textContent = clean(typeEl.textContent);
                        info.appendChild(sub);
                    }
                    row.appendChild(info);
                }
                wrap.appendChild(row);
            });
        }

        // Fixtures link
        const fixturesA = col2.querySelector('.align_center a');
        if (fixturesA) {
            const a = document.createElement('a');
            a.href = fixturesA.getAttribute('href');
            a.className = 'tmvu-home-nm-all';
            a.textContent = clean(fixturesA.textContent) || 'All Fixtures';
            wrap.appendChild(a);
        }

        return wrap;
    };

    const buildForum = (col2) => {
        const boxes = col2.querySelectorAll(':scope > .box');
        const forumBox = boxes[1];
        if (!forumBox) return null;

        const wrap = document.createElement('div');
        wrap.className = 'tmvu-home-forum';

        Array.from(forumBox.querySelectorAll('.previous_match')).slice(0, 6).forEach(row => {
            const linkEl = row.querySelector('.match_text a');
            const dateEl = row.querySelector('.match_text .small');
            if (!linkEl) return;

            const div = document.createElement('div');
            div.className = 'tmvu-home-thread';

            const main = document.createElement('div');
            main.className = 'tmvu-home-thread-main';

            const dot = document.createElement('span');
            dot.className = 'tmvu-home-thread-dot';

            const copy = document.createElement('div');
            copy.className = 'tmvu-home-thread-copy';

            const a = document.createElement('a');
            a.href = linkEl.getAttribute('href');
            a.textContent = clean(linkEl.textContent);
            copy.appendChild(a);
            main.appendChild(dot);
            main.appendChild(copy);
            div.appendChild(main);

            if (dateEl) {
                const date = document.createElement('div');
                date.className = 'tmvu-home-thread-date';
                date.textContent = clean(dateEl.textContent);
                div.appendChild(date);
            }
            wrap.appendChild(div);
        });

        const footer = document.createElement('div');
        footer.className = 'tmvu-home-forum-footer';
        const forumLink = document.createElement('a');
        forumLink.href = '/forum/';
        forumLink.className = 'tmvu-home-forum-link';
        forumLink.textContent = 'Open Forum';
        footer.appendChild(forumLink);
        wrap.appendChild(footer);

        return wrap.children.length > 1 ? wrap : Object.assign(document.createElement('div'), {
            className: 'tmvu-home-forum-empty',
            textContent: 'No forum threads available.',
        });
    };

    // Parse the original TM tab buttons into metadata objects.
    const parseOrigTabs = (col1) => {
        const tabs = [];
        const HIDDEN_LABELS = new Set(['inbox', 'sent', 'trash']);
        col1.querySelectorAll('.tabs_new > [tab_active]').forEach(el => {
            const label = clean(el.textContent).toLowerCase();
            if (HIDDEN_LABELS.has(label)) return;
            const targetId = el.getAttribute('tab_active') || '';
            tabs.push({
                id: el.getAttribute('id') || '',
                element: el,
                label: clean(el.textContent).replace(/private messages/i, 'Messages'),
                targetId,
                onclick: el.getAttribute('onclick') || '',
                isActive: el.hasAttribute('selected') || el.classList.contains('active_tab'),
            });
        });
        return tabs;
    };

    const appendText = (parent, text) => {
        const value = clean(text);
        if (!value) return;
        parent.appendChild(document.createTextNode((parent.childNodes.length ? ' ' : '') + value));
    };

    const parseMatchTitle = (value) => {
        const text = clean(value);
        const sideMatch = text.match(/^(Home|Away)\b/i);
        if (!sideMatch) return null;

        let rest = clean(text.slice(sideMatch[0].length));
        let isBTeam = false;

        if (/^B\b/i.test(rest)) {
            isBTeam = true;
            rest = clean(rest.replace(/^B\b/i, ''));
        }

        const splitToken = ' Match VS ';
        const splitIdx = rest.toLowerCase().indexOf(splitToken.toLowerCase());
        if (splitIdx < 0) return null;

        const competition = clean(rest.slice(0, splitIdx));
        const opponent = clean(rest.slice(splitIdx + splitToken.length));
        if (!competition || !opponent) return null;

        return {
            side: sideMatch[1],
            isBTeam,
            competition,
            opponent,
        };
    };

    const parseMarketMeta = (value) => {
        const text = clean(String(value || '').replace(/^»\s*/, ''));
        if (!text) return null;

        if (/current\s+bid/i.test(text)) {
            return { status: 'Current bid' };
        }
        if (/no\s+bids?/i.test(text)) {
            return { status: 'No bids' };
        }

        const firstChunk = text.split(/\s-\s|:/)[0];
        return { status: clean(firstChunk) || text };
    };

    const createEventRow = (ev) => {
        const row = document.createElement('a');
        const timeEl = document.createElement('div');
        const main = document.createElement('div');
        const title = document.createElement('div');
        const meta = document.createElement('div');
        const sub = document.createElement('div');

        let mode = 'generic';
        let timeSet = false;
        let matchInfo = null;
        let marketInfo = null;
        const fullEventText = clean(ev.textContent || '');

        row.href = ev.getAttribute('href') || '#';
        row.className = 'tmvu-home-cal-event';
        timeEl.className = 'tmvu-home-cal-time';
        main.className = 'tmvu-home-cal-event-main';
        title.className = 'tmvu-home-cal-event-title';
        meta.className = 'tmvu-home-cal-event-meta';
        sub.className = 'tmvu-home-cal-event-sub';

        const walk = (node, target = 'title') => {
            if (node.nodeType === Node.TEXT_NODE) {
                let value = node.textContent || '';
                if (!timeSet) {
                    const match = value.match(/^(\d{1,2}:\d{2})\s*/);
                    if (match) {
                        timeEl.textContent = match[1];
                        timeSet = true;
                        value = value.slice(match[0].length);
                    } else if (clean(value)) {
                        timeSet = true;
                    }
                }
                appendText(target === 'meta' ? meta : title, value);
                return;
            }
            if (!node || node.classList?.contains('icon')) return;
            if (node.classList?.contains('subtle')) {
                if (mode === 'market') {
                    marketInfo = parseMarketMeta(node.textContent || '');
                }
                node.childNodes.forEach(child => walk(child, 'meta'));
                return;
            }
            if (node.nodeName === 'IMG' && node.classList.contains('club_logo')) {
                const img = document.createElement('img');
                img.src = node.src;
                img.alt = '';
                img.className = 'tmvu-home-cal-logo';
                title.appendChild(img);
                return;
            }
            if (node.classList?.contains('b_team_icon')) {
                const badge = document.createElement('span');
                badge.className = 'tmvu-home-cal-btag';
                badge.textContent = 'B';
                title.appendChild(badge);
                return;
            }
            if (node.classList?.contains('coin')) {
                mode = 'market';
                const coin = document.createElement('span');
                coin.className = 'tmvu-home-cal-coin';
                coin.textContent = clean(node.textContent);
                (target === 'meta' ? meta : title).appendChild(coin);
                return;
            }
            if (node.hasAttribute?.('player_link')) {
                mode = 'market';
                Array.from(node.childNodes).forEach(child => {
                    if (child.classList?.contains('subtle')) {
                        walk(child, 'meta');
                    } else {
                        walk(child, 'title');
                    }
                });
                return;
            }
            node.childNodes.forEach(child => walk(child, target));
        };

        const iconImg = ev.querySelector('.icon img');
        if (iconImg) {
            const icon = document.createElement('span');
            icon.className = 'tmvu-home-cal-icon';
            const img = document.createElement('img');
            img.src = iconImg.src;
            img.alt = '';
            icon.appendChild(img);
            title.appendChild(icon);
        }

        ev.childNodes.forEach(child => walk(child));

        const parsedFromFullText = parseMatchTitle(fullEventText.replace(/^\d{1,2}:\d{2}\s*/, ''));
        if (parsedFromFullText) {
            parsedFromFullText.isBTeam = parsedFromFullText.isBTeam || Boolean(ev.querySelector('.b_team_icon'));
            matchInfo = parsedFromFullText;
            mode = 'match';
        } else if (ev.hasAttribute('player_link') || ev.querySelector('[player_link], .coin')) {
            mode = 'market';
            marketInfo = marketInfo || parseMarketMeta(ev.querySelector('.subtle')?.textContent || '');
        }

        if (!timeEl.textContent) timeEl.textContent = '--:--';
        if (mode === 'match') {
            row.classList.add('tmvu-home-cal-event--match');
            if (matchInfo) {
                const titleBits = Array.from(title.childNodes).filter(node => node.nodeType !== Node.TEXT_NODE && !node.classList?.contains('tmvu-home-cal-icon'));
                title.textContent = '';
                title.appendChild(document.createTextNode(matchInfo.opponent));
                titleBits.forEach(node => title.appendChild(node));

                meta.textContent = '';
                const sideTag = document.createElement('span');
                sideTag.className = 'tmvu-home-cal-tag tmvu-home-cal-tag--side';
                sideTag.textContent = matchInfo.side;

                const iconNode = title.querySelector('.tmvu-home-cal-icon');
                if (iconNode) {
                    title.removeChild(iconNode);
                    meta.appendChild(iconNode);
                }

                meta.appendChild(sideTag);

                if (matchInfo.isBTeam) {
                    const bBadge = document.createElement('span');
                    bBadge.className = 'tmvu-home-cal-btag';
                    bBadge.textContent = 'B';
                    meta.appendChild(bBadge);
                }

                const compText = document.createElement('span');
                compText.textContent = `${matchInfo.competition} Match`;
                meta.appendChild(compText);
            }
        } else if (mode === 'market') {
            row.classList.add('tmvu-home-cal-event--market');
            meta.textContent = '';
            if (marketInfo?.status) {
                const status = document.createElement('span');
                status.className = 'tmvu-home-cal-market-status';
                status.textContent = marketInfo.status;
                meta.appendChild(status);
            }

            const coinText = clean(ev.querySelector('.coin')?.textContent || '');
            if (coinText) {
                const price = document.createElement('span');
                price.className = 'tmvu-home-cal-market-price';

                const coin = document.createElement('span');
                coin.className = 'tmvu-home-cal-coin';
                coin.textContent = coinText;
                price.appendChild(coin);
                meta.appendChild(price);
            }
        }

        main.appendChild(title);
        if (meta.childNodes.length) main.appendChild(meta);
        if (sub.textContent) main.appendChild(sub);

        row.appendChild(timeEl);
        row.appendChild(main);
        return row;
    };

    const buildCalendar = (calendarDiv) => {
        const wrap = document.createElement('div');
        wrap.className = 'tmvu-home-cal';

        const days = Array.from(calendarDiv.querySelectorAll('.day'));
        const matches = calendarDiv.querySelectorAll('a.event.event_border').length;
        const market = Array.from(calendarDiv.querySelectorAll('a.event')).filter(ev => ev.hasAttribute('player_link') || ev.querySelector('[player_link], .coin')).length;

        const head = document.createElement('div');
        head.className = 'tmvu-home-cal-head';

        const headMain = document.createElement('div');
        const title = document.createElement('div');
        title.className = 'tmvu-home-cal-title';
        title.textContent = 'Week Agenda';
        const note = document.createElement('div');
        note.className = 'tmvu-home-cal-note';
        note.textContent = 'Upcoming fixtures, market activity and training moments in one timeline.';
        headMain.appendChild(title);
        headMain.appendChild(note);

        const kpis = document.createElement('div');
        kpis.className = 'tmvu-home-cal-kpis';
        [
            `${days.length} days`,
            `${matches} matches`,
            `${market} market events`,
        ].forEach(value => {
            const chip = document.createElement('div');
            chip.className = 'tmvu-home-cal-kpi';
            chip.textContent = value;
            kpis.appendChild(chip);
        });

        head.appendChild(headMain);
        head.appendChild(kpis);
        wrap.appendChild(head);

        const list = document.createElement('div');
        list.className = 'tmvu-home-cal-list';

        days.forEach(day => {
            const dayEl = document.createElement('div');
            dayEl.className = 'tmvu-home-cal-day';
            if (day.classList.contains('today')) dayEl.classList.add('tmvu-home-cal-day--today');
            if (day.classList.contains('subtle')) dayEl.classList.add('tmvu-home-cal-day--past');

            const headSrc = day.querySelector('.day_name img')?.src || '';
            const numMatch = headSrc.match(/calendar_numeral_(\d+)/);
            const weekday = clean(day.querySelector('.day_name')?.textContent || '');

            const stamp = document.createElement('div');
            stamp.className = 'tmvu-home-cal-day-stamp';
            const num = document.createElement('div');
            num.className = 'tmvu-home-cal-day-num';
            num.textContent = numMatch?.[1] || '--';
            const name = document.createElement('div');
            name.className = 'tmvu-home-cal-day-name';
            name.textContent = weekday;
            stamp.appendChild(num);
            stamp.appendChild(name);

            const eventsWrap = document.createElement('div');
            eventsWrap.className = 'tmvu-home-cal-events';
            const events = Array.from(day.querySelectorAll('a.event'));
            if (!events.length) {
                const empty = document.createElement('div');
                empty.className = 'tmvu-home-cal-empty';
                empty.textContent = 'No scheduled items';
                eventsWrap.appendChild(empty);
            } else {
                events.forEach(ev => eventsWrap.appendChild(createEventRow(ev)));
            }

            dayEl.appendChild(stamp);
            dayEl.appendChild(eventsWrap);
            list.appendChild(dayEl);
        });

        wrap.appendChild(list);
        return wrap;
    };

    const triggerNativeClick = (element) => {
        if (!element) return false;
        try {
            element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            return true;
        } catch (_) {
            try {
                element.click();
                return true;
            } catch (_) {
                return false;
            }
        }
    };

    const parseNativeActionArgs = (onclickValue) => {
        const match = String(onclickValue || '').match(/([A-Za-z0-9_]+)\((.*)\)/);
        if (!match) return null;

        const rawArgs = match[2].trim();
        if (!rawArgs) return { fnName: match[1], args: [] };

        return {
            fnName: match[1],
            args: rawArgs.split(',').map(part => part.trim()).map((part) => {
                if (part === 'true') return true;
                if (part === 'false') return false;
                if (/^['"].*['"]$/.test(part)) return part.slice(1, -1);
                const numeric = Number(part);
                return Number.isNaN(numeric) ? part : numeric;
            }),
        };
    };

    const runNativeActionByOnclick = (element) => {
        const onclickValue = element?.getAttribute('onclick');
        if (!onclickValue) return false;

        const parsed = parseNativeActionArgs(onclickValue);
        if (!parsed) return false;

        const fn = window[parsed.fnName];
        if (typeof fn !== 'function') return triggerNativeClick(element);

        try {
            fn(...parsed.args);
            return true;
        } catch (_) {
            return triggerNativeClick(element);
        }
    };

    const getSimilarStoriesLabel = (post) => {
        const similarCount = Array.isArray(post?.similarEntries) ? post.similarEntries.length : 0;
        if (!similarCount) return '';
        return expandedSimilarFeedPostIds.has(post.id)
            ? 'Hide similar stories'
            : `Show ${similarCount} similar stories`;
    };

    const formatCommentCountLabel = (count) => `${count} comment${count === 1 ? '' : 's'}`;
    const formatLikeCountLabel = (count) => `${count} like${count === 1 ? '' : 's'}`;

    const getCommentSummaryLabel = (post, visibleCommentCount) => {
        const totalCount = Number(post?.totalCommentCount) || 0;
        if (!totalCount) return '';
        return formatCommentCountLabel(totalCount);
    };

    const getRemainingCommentCopy = (post, visibleCommentCount) => {
        const loadedCount = Array.isArray(post?.comments) ? post.comments.length : 0;
        const hiddenLoadedCount = Math.max(loadedCount - visibleCommentCount, 0);
        const hiddenNativeCount = Math.max((Number(post?.totalCommentCount) || 0) - loadedCount, 0);
        if (hiddenLoadedCount > 0) {
            return {
                title: `Show ${hiddenLoadedCount} more loaded comments`,
                detail: `${formatCommentCountLabel(loadedCount)} already fetched from the feed API`,
                remainingCount: hiddenLoadedCount,
            };
        }
        if (hiddenNativeCount > 0) {
            return {
                title: `Open full thread (${hiddenNativeCount} more on TM)`,
                detail: `Showing ${visibleCommentCount} of ${formatCommentCountLabel(Number(post?.totalCommentCount) || 0)}`,
                remainingCount: hiddenNativeCount,
            };
        }
        return null;
    };

    const getRenderableHomeFeedPosts = (feedRoot, feedModel = null) => {
        if (feedModel?.kind === 'api') {
            return feedModel.topPosts.flatMap((post) => expandedSimilarFeedPostIds.has(post.id)
                ? [post, ...(post.similarEntries || [])]
                : [post]);
        }

        if (Array.isArray(feedModel?.topPosts)) return feedModel.topPosts;
        return queryVisibleNativeFeedPosts(feedRoot);
    };

    const setNativeCommentValue = (textarea, value) => {
        if (!textarea) return;
        textarea.value = value;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        textarea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    };

    const mountFeedComposer = (targetEl, postEl, mode = 'comment') => {
        if (!targetEl || !postEl) return;

        const controls = findNativeHomeFeedCommentControls(postEl);
        if (!controls?.textarea || !controls?.submitButton) {
            targetEl.hidden = true;
            targetEl.innerHTML = '';
            return;
        }

        targetEl.innerHTML = `
            <textarea class="tmvu-home-feed-composer-input" data-role="input" placeholder="${mode === 'reply' ? 'Write a reply...' : 'Write a comment...'}"></textarea>
            <div class="tmvu-home-feed-composer-actions">
                <button type="button" class="tmvu-home-feed-composer-btn" data-role="cancel">Cancel</button>
                <button type="button" class="tmvu-home-feed-composer-btn" data-role="submit">${mode === 'reply' ? 'Reply' : 'Comment'}</button>
            </div>
        `;
        targetEl.hidden = false;

        const input = targetEl.querySelector('[data-role="input"]');
        const cancelBtn = targetEl.querySelector('[data-role="cancel"]');
        const submitBtn = targetEl.querySelector('[data-role="submit"]');

        cancelBtn?.addEventListener('click', () => {
            targetEl.hidden = true;
            targetEl.innerHTML = '';
        });

        submitBtn?.addEventListener('click', () => {
            const value = clean(input?.value || '');
            if (!value) {
                input?.focus();
                return;
            }
            setNativeCommentValue(controls.textarea, value);
            triggerNativeClick(controls.submitButton);
            targetEl.hidden = true;
            targetEl.innerHTML = '';
        });

        if (input) {
            try { input.focus({ preventScroll: true }); } catch (_) { input.focus(); }
        }
    };

    const handleFeedComposerAction = (post, action, composerEl) => {
        const nativeAction = findNativeHomeFeedAction(post.sourceEl, action);
        if (!nativeAction) return false;

        triggerNativeClick(nativeAction);
        requestAnimationFrame(() => mountFeedComposer(composerEl, post.sourceEl, action));
        return true;
    };

    const renderHomeFeedCards = (panel, feedRoot, refreshFeed = null, feedModel = null, loadMoreFeed = null) => {
        if (!panel) return;

        const posts = getRenderableHomeFeedPosts(feedRoot, feedModel);
        if (!posts.length) {
            panel.innerHTML = '<div class="tmvu-home-empty">No feed posts loaded.</div>';
            return;
        }

        panel.innerHTML = `
            <div class="tmvu-home-feed">
                ${posts.map((post) => {
                    const isExpanded = expandedFeedPostIds.has(post.id);
                    const similarStoriesLabel = getSimilarStoriesLabel(post);
                    const renderedComments = isExpanded ? post.comments : post.comments.slice(0, 3);
                    const remainingCommentCopy = getRemainingCommentCopy(post, renderedComments.length);
                    const commentSummaryLabel = getCommentSummaryLabel(post, renderedComments.length);
                    const hasCommentSummaryAction = Boolean(remainingCommentCopy || post.hiddenCommentsAction || (post.comments.length > 3));
                    return `
                    <article class="tmvu-home-feed-post${post.isSimilarPost ? ' tmvu-home-feed-post--similar' : ''}" data-feed-post-id="${escapeHtml(post.id)}">
                        <div class="tmvu-home-feed-side">
                            <div class="tmvu-home-feed-side-logo">
                                ${renderFeedLogo(post.authorLogoSrc, post.authorLogoFallbackSrc)}
                            </div>
                            ${post.authorName ? (post.authorHref ? `<a class="tmvu-home-feed-side-name" href="${escapeHtml(post.authorHref)}">${escapeHtml(post.authorName)}</a>` : `<div class="tmvu-home-feed-side-name">${escapeHtml(post.authorName)}</div>`) : ''}
                        </div>
                        <div class="tmvu-home-feed-main">
                            <div>${post.time ? `<div class="tmvu-home-feed-time" style="float: right;">${escapeHtml(post.time)}</div>` : ''}
                            <div class="tmvu-home-feed-body">${post.bodyHtml || ''}</div></div>
                            <div class="tmvu-home-feed-meta">
                                <div class="tmvu-home-feed-meta-left">
                                    ${post.likeCount > 0 ? `<button type="button" class="tmvu-home-feed-like-count" data-feed-like-summary title="Show likes">${escapeHtml(formatLikeCountLabel(post.likeCount))}</button>` : ''}
                                    ${commentSummaryLabel ? (hasCommentSummaryAction
                                        ? `<button type="button" class="tmvu-home-feed-comment-count tmvu-home-feed-comment-count--action" data-feed-comment-summary title="Open comments">${escapeHtml(commentSummaryLabel)}</button>`
                                        : `<span class="tmvu-home-feed-comment-count">${escapeHtml(commentSummaryLabel)}</span>`) : ''}
                                </div>
                            </div>
                            <div class="tmvu-home-feed-actions">
                                <button type="button" class="tmvu-home-feed-action" data-feed-action="like">Like</button>
                                <button type="button" class="tmvu-home-feed-action" data-feed-action="comment">Comment</button>
                                <button type="button" class="tmvu-home-feed-action" data-feed-action="reply">Reply</button>
                                <button type="button" class="tmvu-home-feed-action" data-feed-action="link">Link</button>
                                <button type="button" class="tmvu-home-feed-action" data-feed-action="mute">Mute</button>
                            </div>
                            <div class="tmvu-home-feed-composer" data-feed-composer hidden></div>
                            ${(post.totalCommentCount > 0 || post.comments.length) ? `
                                <div class="tmvu-home-feed-comments">
                                    ${remainingCommentCopy ? `
                                        <button type="button" class="tmvu-home-feed-more-comments" data-feed-more-comments>
                                            <span class="tmvu-home-feed-more-comments-badge">+</span>
                                            <span class="tmvu-home-feed-more-comments-copy">
                                                <span class="tmvu-home-feed-more-comments-title">${escapeHtml(remainingCommentCopy.title)}</span>
                                            </span>
                                        </button>
                                    ` : ''}
                                    ${renderedComments.map((comment) => `
                                        <div class="tmvu-home-feed-comment">
                                            <div class="tmvu-home-feed-comment-logo">
                                                ${renderFeedLogo(comment.authorLogoSrc, comment.authorLogoFallbackSrc)}
                                            </div>
                                            <div class="tmvu-home-feed-comment-content">
                                                ${comment.bodyHtml}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            ${similarStoriesLabel ? `
                                <div class="tmvu-home-feed-similar">
                                    <button type="button" class="tmvu-home-feed-similar-btn" data-feed-similar-stories>${escapeHtml(similarStoriesLabel)}</button>
                                </div>
                            ` : ''}
                        </div>
                    </article>
                `;}).join('')}
                ${feedModel?.kind === 'api' && loadMoreFeed && (feedModel?.canLoadMore || feedModel?.isLoadingMore) ? `
                    <div class="tmvu-home-feed-load-more">
                        <button type="button" class="tmvu-home-feed-load-more-btn" data-feed-load-more ${feedModel?.isLoadingMore ? 'disabled' : ''}>
                            ${feedModel?.isLoadingMore ? 'Loading more...' : 'Load older feed posts'}
                        </button>
                    </div>
                ` : ''}
            </div>
        `;

        const openCommentThread = (post) => {
            if (!post) return;

            if (post.comments.length > 3 && !expandedFeedPostIds.has(post.id)) {
                expandedFeedPostIds.add(post.id);
                renderHomeFeedCards(panel, feedRoot, refreshFeed, feedModel, loadMoreFeed);
                return;
            }

            expandedFeedPostIds.add(post.id);
            const nativeTarget = post.hiddenCommentsAction?.matches?.('.hidden_comments_link, .comments_header, .comments_count')
                ? post.hiddenCommentsAction.querySelector('.faux_link, [onclick], a[href]') || post.hiddenCommentsAction
                : post.hiddenCommentsAction;

            if (!nativeTarget) {
                renderHomeFeedCards(panel, feedRoot, refreshFeed, feedModel, loadMoreFeed);
                return;
            }

            if (!runNativeActionByOnclick(nativeTarget)) triggerNativeClick(nativeTarget);
            setTimeout(() => refreshFeed ? refreshFeed() : renderHomeFeedCards(panel, feedRoot, refreshFeed, feedModel, loadMoreFeed), 500);
            setTimeout(() => refreshFeed ? refreshFeed() : renderHomeFeedCards(panel, feedRoot, refreshFeed, feedModel, loadMoreFeed), 1200);
        };

        panel.querySelectorAll('[data-feed-post-id]').forEach((postNode) => {
            const post = posts.find((entry) => entry.id === postNode.getAttribute('data-feed-post-id'));
            if (!post) return;
            const composerEl = postNode.querySelector('[data-feed-composer]');
            const likeSummaryBtn = postNode.querySelector('[data-feed-like-summary]');
            const commentSummaryBtn = postNode.querySelector('[data-feed-comment-summary]');
            const moreCommentsBtn = postNode.querySelector('[data-feed-more-comments]');
            const similarStoriesBtn = postNode.querySelector('[data-feed-similar-stories]');

            if (likeSummaryBtn) likeSummaryBtn.addEventListener('click', () => showFeedLikesDialog(post));

            if (commentSummaryBtn) commentSummaryBtn.addEventListener('click', () => openCommentThread(post));
            if (moreCommentsBtn) moreCommentsBtn.addEventListener('click', () => openCommentThread(post));

            if (similarStoriesBtn && post.similarEntries?.length) {
                similarStoriesBtn.addEventListener('click', (event) => {
                    event.preventDefault();
                    if (expandedSimilarFeedPostIds.has(post.id)) expandedSimilarFeedPostIds.delete(post.id);
                    else expandedSimilarFeedPostIds.add(post.id);
                    renderHomeFeedCards(panel, feedRoot, refreshFeed, feedModel, loadMoreFeed);
                });
            }

            postNode.querySelectorAll('[data-feed-action]').forEach((button) => {
                const action = button.getAttribute('data-feed-action');
                const nativeAction = post.sourceEl ? findNativeHomeFeedAction(post.sourceEl, action) : null;
                button.disabled = !nativeAction;
                button.addEventListener('click', () => {
                    if (!nativeAction) return;
                    if (action === 'comment' || action === 'reply') {
                        handleFeedComposerAction(post, action, composerEl);
                        return;
                    }
                    if (action === 'link' || action === 'mute') runNativeActionByOnclick(nativeAction);
                    else triggerNativeClick(nativeAction);
                });
            });
        });

        const loadMoreBtn = panel.querySelector('[data-feed-load-more]');
        if (loadMoreBtn && typeof loadMoreFeed === 'function') {
            loadMoreBtn.addEventListener('click', async () => {
                if (loadMoreBtn.disabled) return;
                await loadMoreFeed();
            });
        }
    };

    const normalizePmConversationItems = (payload) => {
        const messages = Array.isArray(payload?.messages) ? payload.messages : [];
        const seen = new Set();
        const items = [];

        for (const message of messages) {
            const key = clean(message?.conversation_id || message?.id);
            if (!key || seen.has(key)) continue;
            seen.add(key);
            items.push({
                senderName: clean(message?.sender_name) || 'Unknown sender',
                subject: clean(message?.subject) || '(No subject)',
                time: clean(message?.time),
                href: '/home/',
            });
            if (items.length >= 10) break;
        }

        return items;
    };

    const renderListPanel = (panel, items, emptyCopy) => {
        if (!panel) return;
        if (!items.length) {
            panel.innerHTML = `<div class="tmvu-home-empty">${escapeHtml(emptyCopy)}</div>`;
            return;
        }

        panel.innerHTML = `
            <div class="tmvu-home-list">
                ${items.map((item) => `
                    <a class="tmvu-home-list-item" href="${escapeHtml(item.href || '#')}">
                        <div class="tmvu-home-list-title">${escapeHtml(item.title || item.subject || 'Item')}</div>
                        <div class="tmvu-home-list-sub">${escapeHtml(item.sub || item.senderName || '')}${item.time ? ` • ${escapeHtml(item.time)}` : ''}</div>
                    </a>
                `).join('')}
            </div>
        `;
    };

    const parseReferralItems = (sourcePanel) => {
        const anchors = Array.from(sourcePanel?.querySelectorAll('a[href]') || []);
        const items = [];
        const seen = new Set();

        anchors.forEach((anchor) => {
            const title = clean(anchor.textContent);
            const href = anchor.getAttribute('href') || '#';
            if (!title || seen.has(`${href}|${title}`)) return;
            seen.add(`${href}|${title}`);

            const row = anchor.closest('li, tr, .referral, .referrals_row, .friend, .content') || anchor.parentElement;
            const sub = clean(row?.textContent || '').replace(title, '').trim();
            items.push({ title, sub, href });
        });

        return items.slice(0, 12);
    };

    const bindHomeSourceObserver = (sourceEl, render) => {
        if (!sourceEl || typeof render !== 'function') return null;

        let queued = false;
        const observer = new MutationObserver(() => {
            if (queued) return;
            queued = true;
            requestAnimationFrame(() => {
                queued = false;
                render();
            });
        });
        observer.observe(sourceEl, { childList: true, subtree: true, characterData: true });
        return observer;
    };

    const getPanelMount = (panel) => {
        if (!panel) return null;

        if (panel._tmvuMount?.isConnected) return panel._tmvuMount;

        const mount = document.createElement('div');
        mount.setAttribute('data-home-panel-mount', '1');
        panel.innerHTML = '';
        panel.appendChild(mount);
        panel._tmvuMount = mount;
        return mount;
    };

    const scrubVisiblePanel = (panel) => {
        if (!panel) return;
        let removed = 0;
        panel.querySelectorAll('#feed, .tabs_content, .tabs_outer').forEach((node) => {
            if (node.parentElement === panel) {
                node.remove();
                removed += 1;
            }
        });
        Array.from(panel.childNodes).forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            if (node.hasAttribute('data-home-panel-mount')) return;
            node.remove();
            removed += 1;
        });
    };

    const protectPanelFromNativeInjection = (panel) => {
        if (!panel || panel._tmvuProtectedPanel === '1') return;
        panel._tmvuProtectedPanel = '1';

        const observer = new MutationObserver(() => {
            scrubVisiblePanel(panel);
            getPanelMount(panel);
        });
        observer.observe(panel, { childList: true });
    };

    const renderPage = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;

        const col1 = main.querySelector('.column1');
        const col2 = main.querySelector('.column2_a');
        if (!col1 || !col2) return;

        injectStyles();

        const origTabs = parseOrigTabs(col1);
        const tabsContent = col1.querySelector('.tabs_content');
        const tabsOuter = col1.querySelector('.tabs_outer');
        const activeKey = origTabs.find(t => t.isActive)?.targetId || origTabs[0]?.targetId || '';
        const sourceHost = document.createElement('div');
        sourceHost.className = 'tmvu-home-native-source';
        const keyByLabel = Object.fromEntries(origTabs.map((tab) => [clean(tab.label).toLowerCase(), tab.targetId]));
        const calendarKey = keyByLabel.calendar || 'calendar';
        const feedKey = keyByLabel.feed || 'feed';
        const messagesKey = keyByLabel.messages || keyByLabel['private messages'] || 'messages';
        const referralsKey = keyByLabel.referrals || 'referrals';
        const getSourcePanel = (key) => tabsContent?.querySelector(`#${key}`) || null;
        const getNativeFeedRoot = () => getSourcePanel(feedKey);
        const installNativeFeedSanitizer = () => {
            const feedRoot = getNativeFeedRoot();
            if (feedRoot) TmNativeFeed.installFeedSanitizer(feedRoot);
            return feedRoot;
        };

        installNativeFeedSanitizer();

        const activateNativeTab = (key) => {
            const tab = origTabs.find((item) => item.targetId === key);
            if (!tab?.element) return;

            try {
                tab.element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            } catch (_) {
                try {
                    tab.element.click();
                } catch (_) {
                    if (tab.onclick) {
                        try { (new Function(tab.onclick)).call(tab.element); } catch (_) { /* ignore */ }
                    }
                }
            }
        };

        const panels = {};
        const setActivePanel = (key) => {
            Object.entries(panels).forEach(([panelKey, panel]) => {
                panel.classList.toggle('tmvu-tab-active', panelKey === key);
            });
        };

        const renderMessagesPanel = async () => {
            const panel = panels[messagesKey];
            if (!panel) return;
            panel.innerHTML = '<div class="tmvu-home-empty">Loading messages...</div>';

            const payload = await TmApi.fetchPmMessages('inbox');
            const items = normalizePmConversationItems(payload).map((item) => ({
                title: item.subject,
                sub: item.senderName,
                time: item.time,
                href: item.href,
            }));
            renderListPanel(panel, items, 'No recent conversations found.');
        };

        const renderReferralsPanel = () => {
            const panel = panels[referralsKey];
            const mount = getPanelMount(panel);
            const sourcePanel = getSourcePanel(referralsKey);
            if (!mount) return;
            renderListPanel(mount, parseReferralItems(sourcePanel), 'No referrals available.');
        };

        const renderCalendarPanel = () => {
            const panel = panels[calendarKey];
            const mount = getPanelMount(panel);
            const sourcePanel = getSourcePanel(calendarKey);
            if (!mount || !sourcePanel) return;

            mount.innerHTML = '';
            if (sourcePanel.querySelector('.day')) mount.appendChild(buildCalendar(sourcePanel));
            else mount.innerHTML = '<div class="tmvu-home-empty">No calendar items loaded.</div>';
        };

        const apiFeedState = {
            topPosts: [],
            lastPost: '',
            canLoadMore: false,
            isLoadingMore: false,
        };

        const mergeApiFeedPosts = (existingPosts, nextPosts) => {
            const merged = new Map();
            existingPosts.forEach((post) => merged.set(post.id, post));
            nextPosts.forEach((post) => {
                if (!merged.has(post.id)) merged.set(post.id, post);
            });
            return Array.from(merged.values());
        };

        const getApiFeedStateModel = () => apiFeedState.topPosts.length
            ? {
                kind: 'api',
                topPosts: apiFeedState.topPosts,
                lastPost: apiFeedState.lastPost,
                canLoadMore: apiFeedState.canLoadMore,
                isLoadingMore: apiFeedState.isLoadingMore,
            }
            : null;

        const fetchApiHomeFeedModel = async (feedRoot, { lastPost = '' } = {}) => {
            const payload = await TmApi.fetchDetailedUserFeed({ lastPost });
            return buildHomeFeedModel({
                payload,
                nativePostMap: buildNativeHomeFeedPostMap(feedRoot),
                fetchFeedNames: TmApi.fetchFeedNames,
            });
        };

        const loadApiHomeFeedPage = async (feedRoot, { reset = false, lastPost = '' } = {}) => {
            const apiFeedModel = await fetchApiHomeFeedModel(feedRoot, { lastPost });
            if (!apiFeedModel?.topPosts?.length) {
                if (reset) {
                    apiFeedState.topPosts = [];
                    apiFeedState.lastPost = '';
                }
                apiFeedState.canLoadMore = false;
                return null;
            }

            apiFeedState.topPosts = reset
                ? apiFeedModel.topPosts
                : mergeApiFeedPosts(apiFeedState.topPosts, apiFeedModel.topPosts);
            apiFeedState.lastPost = apiFeedModel.lastPost || apiFeedState.lastPost;
            apiFeedState.canLoadMore = Boolean(apiFeedModel.lastPost) && apiFeedModel.lastPost !== lastPost;
            return getApiFeedStateModel();
        };

        const renderApiHomeFeed = async (mount, feedRoot, refreshFeed = null) => {
            const apiFeedModel = await loadApiHomeFeedPage(feedRoot, { reset: true });
            if (!apiFeedModel?.topPosts?.length) return false;

            const loadMoreFeed = async () => {
                if (apiFeedState.isLoadingMore || !apiFeedState.canLoadMore) return;
                apiFeedState.isLoadingMore = true;
                renderHomeFeedCards(mount, feedRoot, refreshFeed, getApiFeedStateModel(), loadMoreFeed);

                const refreshedFeedRoot = getNativeFeedRoot() || feedRoot;
                await loadApiHomeFeedPage(refreshedFeedRoot, { lastPost: apiFeedState.lastPost });

                apiFeedState.isLoadingMore = false;
                renderHomeFeedCards(mount, refreshedFeedRoot, refreshFeed, getApiFeedStateModel(), loadMoreFeed);
            };

            renderHomeFeedCards(mount, feedRoot, refreshFeed, apiFeedModel, loadMoreFeed);
            return true;
        };

        const renderHomeFeedTab = async () => {
            const panel = panels[feedKey];
            const mount = getPanelMount(panel);
            if (!mount) return;

            mount.innerHTML = '<div class="tmvu-home-empty">Loading feed...</div>';

            const nativeFeedRoot = installNativeFeedSanitizer();
            const refreshNativeFeed = async () => {
                const refreshedFeedRoot = getNativeFeedRoot() || nativeFeedRoot;
                if (await renderApiHomeFeed(mount, refreshedFeedRoot, refreshNativeFeed)) return;
                renderHomeFeedCards(mount, refreshedFeedRoot, refreshNativeFeed);
            };

            if (await renderApiHomeFeed(mount, nativeFeedRoot, refreshNativeFeed)) {
                return;
            }
            if (nativeFeedRoot && queryVisibleNativeFeedPosts(nativeFeedRoot).length) {
                renderHomeFeedCards(mount, nativeFeedRoot, refreshNativeFeed);
                return;
            }

            mount.innerHTML = '<div class="tmvu-home-empty">No recent feed items found.</div>';
        };

        // Tabs section card
        const tabsWrap = document.createElement('section');
        tabsWrap.className = 'tmvu-home-tabs-card';
        const tabsRefs = TmSectionCard.mount(tabsWrap, {
            title: '',
            titleMode: 'body',
            flush: true,
            bodyHtml: '',
        });
        if (tabsRefs?.body) {
            const tabBar = TmUI.tabs({
                items: origTabs.map((tab) => ({ key: tab.targetId, label: tab.label })),
                active: activeKey,
                stretch: true,
                onChange: async (key) => {
                    setActivePanel(key);
                    activateNativeTab(key);
                    if (key === messagesKey) await renderMessagesPanel();
                    if (key === referralsKey) renderReferralsPanel();
                    if (key === feedKey) {
                        await new Promise((resolve) => setTimeout(resolve, 50));
                        await renderHomeFeedTab();
                    }
                    if (key === calendarKey) renderCalendarPanel();
                },
            });

            const tabsHost = document.createElement('div');
            tabsHost.className = 'tmvu-home-tabs-host';
            tabsHost.appendChild(tabBar);

            origTabs.forEach((tab) => {
                const panel = document.createElement('div');
                panel.className = 'tmvu-home-tabpanel';
                if (tab.targetId === activeKey) panel.classList.add('tmvu-tab-active');
                getPanelMount(panel);
                protectPanelFromNativeInjection(panel);
                panels[tab.targetId] = panel;
                tabsHost.appendChild(panel);
            });

            tabsRefs.body.appendChild(tabsHost);
        }

        if (tabsOuter) sourceHost.appendChild(tabsOuter);
        if (tabsContent) sourceHost.appendChild(tabsContent);
        document.body.appendChild(sourceHost);

        bindHomeSourceObserver(getSourcePanel(calendarKey), renderCalendarPanel);
        bindHomeSourceObserver(getSourcePanel(feedKey), () => {
            const panel = panels[feedKey];
            const mount = getPanelMount(panel);
            const nativeFeedRoot = installNativeFeedSanitizer();
            if (mount && nativeFeedRoot && queryVisibleNativeFeedPosts(nativeFeedRoot).length) {
                renderApiHomeFeed(mount, nativeFeedRoot)
                    .then((rendered) => {
                        if (!rendered) renderHomeFeedCards(mount, nativeFeedRoot);
                    });
            }
        });
        bindHomeSourceObserver(getSourcePanel(referralsKey), renderReferralsPanel);

        if (activeKey !== feedKey) activateNativeTab(activeKey);
        renderCalendarPanel();
        renderHomeFeedTab();
        if (activeKey === messagesKey) renderMessagesPanel();
        if (activeKey === referralsKey) renderReferralsPanel();

        // Next Match section card
        const nmWrap = document.createElement('section');
        const nmRefs = TmSectionCard.mount(nmWrap, {
            title: 'Next Match',
            titleMode: 'body',
            cardVariant: 'sidebar',
            bodyHtml: '',
        });
        const nmContent = buildNextMatch(col2);
        if (nmRefs?.body && nmContent) nmRefs.body.appendChild(nmContent);

        // Forum section card
        const forumWrap = document.createElement('section');
        const forumRefs = TmSectionCard.mount(forumWrap, {
            title: 'Forum',
            titleMode: 'body',
            cardVariant: 'sidebar',
            bodyHtml: '',
        });
        const forumContent = buildForum(col2);
        if (forumRefs?.body && forumContent) forumRefs.body.appendChild(forumContent);

        // Assemble 2-col layout
        const leftCol = document.createElement('div');
        leftCol.className = 'tmvu-home-left';
        leftCol.appendChild(tabsWrap);

        const rightCol = document.createElement('div');
        rightCol.className = 'tmvu-home-right';
        rightCol.appendChild(nmWrap);
        rightCol.appendChild(forumWrap);

        main.classList.add('tmvu-home-page');
        main.innerHTML = '';
        main.appendChild(leftCol);
        main.appendChild(rightCol);
    };

    const waitForContent = () => {
        const check = () => document.querySelector('.column1 .tabs_outer');
        if (check()) { renderPage(); return; }
        const observer = new MutationObserver(() => {
            if (check()) { observer.disconnect(); renderPage(); }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForContent);
    } else {
        waitForContent();
    }
})();
