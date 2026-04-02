import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmNativeFeed } from '../components/shared/tm-native-feed.js';
import { TmUI }         from '../components/shared/tm-ui.js';
import { TmButton }     from '../components/shared/tm-button.js';
import { createSocialFeedComponent } from '../components/shared/tm-social-feed.js';
import { TmApi }        from '../services/index.js';
import { buildHomeFeedModel } from '../utils/home-feed.js';
import { buildNativeHomeFeedPostMap, queryVisibleNativeFeedPosts } from '../utils/home-feed-native.js';

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

    const findColumnBoxByTitle = (root, title) => {
        const wanted = clean(title).toLowerCase();
        return Array.from(root?.querySelectorAll(':scope > .box') || []).find((box) => {
            const heading = clean(box.querySelector('.box_head h1, .box_head h2, .box_head h3')?.textContent || '').toLowerCase();
            return heading === wanted;
        }) || null;
    };

    const injectStyles = () => {
        injectTmPageLayoutStyles();
        const rules = [
            '.tmvu-home-page{--tmu-page-gap:var(--tmu-space-xxl);display:grid!important;grid-template-columns:minmax(0,1fr) 292px;gap:var(--tmu-page-gap);align-items:start;max-width:1240px;margin:0 auto;padding:var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-xl)}',
            '.tmvu-home-tabs-host{display:flex;flex-direction:column;min-width:0}',
            '.tmvu-home-tabpanel{display:none;padding:var(--tmu-space-xl)}',
            '.tmvu-home-tabpanel.tmvu-tab-active{display:block}',
            '.tmvu-home-native-source{display:none!important}',
            '.tmvu-home-list-item{display:block;padding:var(--tmu-space-md) var(--tmu-space-lg);border:1px solid var(--tmu-border-soft-alpha);border-radius:var(--tmu-space-md);background:var(--tmu-border-contrast);text-decoration:none}',
            '.tmvu-home-list-item:hover{background:var(--tmu-surface-overlay-soft);border-color:var(--tmu-success-fill-soft)}',
            '.tmvu-home-list-title{font-size:var(--tmu-font-sm);font-weight:800;color:var(--tmu-text-strong);line-height:1.45}',
            '.tmvu-home-list-sub{margin-top:var(--tmu-space-xs);font-size:var(--tmu-font-xs);color:var(--tmu-text-muted);line-height:1.5}',
            '.tmvu-home-cal-head{display:flex;align-items:flex-end;justify-content:space-between;gap:var(--tmu-space-md);padding-bottom:var(--tmu-space-sm);border-bottom:1px solid var(--tmu-border-soft-alpha)}',
            '.tmvu-home-cal-title{font-size:var(--tmu-font-md);font-weight:700;color:var(--tmu-text-strong)}',
            '.tmvu-home-cal-note{display:none}',
            '.tmvu-home-cal-kpis{display:none}',
            '.tmvu-home-cal-list{display:flex;flex-direction:column;gap:var(--tmu-space-sm);border:none;border-radius:0;overflow:visible;background:transparent}',
            '.tmvu-home-cal-day{display:grid;grid-template-columns:68px 1fr;min-width:0;border:1px solid var(--tmu-border-soft-alpha);border-radius:var(--tmu-space-md);overflow:hidden;background:var(--tmu-surface-item-dark)}',
            '.tmvu-home-cal-day-stamp{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--tmu-space-lg) var(--tmu-space-md);background:var(--tmu-surface-overlay-soft);border-right:1px solid var(--tmu-border-soft-alpha)}',
            '.tmvu-home-cal-day-num{font-size:var(--tmu-font-2xl);font-weight:800;line-height:1;color:var(--tmu-text-faint);font-variant-numeric:tabular-nums}',
            '.tmvu-home-cal-day-name{margin-top:var(--tmu-space-xs);font-size:var(--tmu-font-2xs);font-weight:700;letter-spacing:.11em;text-transform:uppercase;color:var(--tmu-text-dim)}',
            '.tmvu-home-cal-day--today{border-color:var(--tmu-border-success);background:var(--tmu-success-fill-faint)}',
            '.tmvu-home-cal-day--today .tmvu-home-cal-day-stamp{background:var(--tmu-success-fill-faint)}',
            '.tmvu-home-cal-day--today .tmvu-home-cal-day-num{color:var(--tmu-text-strong);text-shadow:none}',
            '.tmvu-home-cal-day--today .tmvu-home-cal-day-name{color:var(--tmu-text-accent-soft)}',
            '.tmvu-home-cal-day--past .tmvu-home-cal-day-stamp{background:transparent}',
            '.tmvu-home-cal-day--past .tmvu-home-cal-day-num{color:var(--tmu-text-dim)}',
            '.tmvu-home-cal-day--past .tmvu-home-cal-day-name{color:var(--tmu-text-disabled-strong)}',
            '.tmvu-home-cal-events{display:flex;flex-direction:column;padding:var(--tmu-space-sm) var(--tmu-space-md);gap:var(--tmu-space-xs);min-width:0}',
            '.tmvu-home-cal-event{display:grid;grid-template-columns:52px 1fr;gap:var(--tmu-space-md);align-items:start;padding:var(--tmu-space-sm);border-radius:var(--tmu-space-md);border-left:2px solid transparent;background:var(--tmu-surface-overlay-soft);text-decoration:none;transition:background .12s,border-color .12s,color .12s}',
            '.tmvu-home-cal-event:hover{background:var(--tmu-border-contrast);transform:none}',
            '.tmvu-home-cal-event--match{border-left-color:var(--tmu-border-success)}',
            '.tmvu-home-cal-event--market{border-left-color:var(--tmu-border-warning)}',
            '.tmvu-home-cal-time{padding-top:0;font-size:var(--tmu-font-sm);font-weight:800;color:var(--tmu-text-panel-label);font-variant-numeric:tabular-nums;letter-spacing:.02em}',
            '.tmvu-home-cal-day--past .tmvu-home-cal-time{color:var(--tmu-text-dim)}',
            '.tmvu-home-cal-event-main{min-width:0;display:flex;flex-direction:column;gap:var(--tmu-space-xs)}',
            '.tmvu-home-cal-event-title{display:flex;align-items:center;flex-wrap:wrap;gap:var(--tmu-space-xs);min-width:0;font-size:var(--tmu-font-sm);font-weight:700;color:var(--tmu-text-main);line-height:1.3}',
            '.tmvu-home-cal-event-meta{display:flex;align-items:center;flex-wrap:wrap;gap:var(--tmu-space-sm);font-size:var(--tmu-font-xs);color:var(--tmu-text-faint);line-height:1.35}',
            '.tmvu-home-cal-event-sub{display:none}',
            '.tmvu-home-cal-event--market .tmvu-home-cal-event-title{color:var(--tmu-text-warm-strong)}',
            '.tmvu-home-cal-market-status{font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-warm-muted)}',
            '.tmvu-home-cal-market-price{display:inline-flex;align-items:center;gap:var(--tmu-space-xs);padding:0;border:none;background:transparent;font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-warm-accent)}',
            '.tmvu-home-cal-icon{width:16px;height:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0}',
            '.tmvu-home-cal-icon img{width:14px;height:14px;display:block;opacity:.62}',
            '.tmvu-home-cal-logo{width:15px;height:15px;object-fit:contain;vertical-align:middle;flex-shrink:0;opacity:.86}',
            '.tmvu-home-cal-btag{display:inline-flex;align-items:center;justify-content:center;width:12px;height:12px;background:var(--tmu-success-fill-strong);color:var(--tmu-text-strong);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-2xs);font-weight:800;flex-shrink:0}',
            '.tmvu-home-cal-tag{display:inline-flex;align-items:center;justify-content:center;padding:0;border-radius:0;background:transparent;border:none;font-size:var(--tmu-font-2xs);font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--tmu-text-muted)}',
            '.tmvu-home-cal-tag--side{color:var(--tmu-text-main)}',
            '.tmvu-home-cal-event--market .tmvu-home-cal-tag{color:var(--tmu-text-warm-accent)}',
            '.tmvu-home-cal-coin{color:var(--tmu-text-warm-accent);font-weight:800;font-variant-numeric:tabular-nums}',
            '.tmvu-home-nm-matchup{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:start;gap:var(--tmu-space-md);padding-top:var(--tmu-space-sm)}',
            '.tmvu-home-nm-team{display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:var(--tmu-space-sm);min-width:0;text-decoration:none;color:var(--tmu-text-strong)}',
            '.tmvu-home-nm-team--away{flex-direction:column}',
            '.tmvu-home-nm-team:hover .tmvu-home-nm-name{color:var(--tmu-text-accent-soft)}',
            '.tmvu-home-nm-badge{display:flex;align-items:center;justify-content:center;flex:0 0 74px}',
            '.tmvu-home-nm-logo{width:56px;height:56px;object-fit:contain}',
            '.tmvu-home-nm-name{display:block;min-width:0;font-size:var(--tmu-font-md);font-weight:800;line-height:1.25;color:var(--tmu-text-strong);white-space:normal;overflow-wrap:anywhere;text-align:center}',
            '.tmvu-home-nm-team--home .tmvu-home-nm-copy{text-align:center}',
            '.tmvu-home-nm-team--away .tmvu-home-nm-copy{text-align:center}',
            '.tmvu-home-nm-copy{min-width:0;max-width:100%;display:flex;justify-content:center}',
            '.tmvu-home-nm-vs{display:flex;align-items:center;justify-content:center;align-self:center;min-width:38px;font-size:var(--tmu-font-xs);font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:var(--tmu-text-dim)}',
            '.tmvu-home-nm-info{padding:var(--tmu-space-md);border-radius:var(--tmu-space-md);background:var(--tmu-border-contrast);font-size:var(--tmu-font-xs);color:var(--tmu-text-muted);text-align:center;line-height:1.45}',
            '.tmvu-home-nm-info a{color:var(--tmu-text-panel-label);text-decoration:none}',
            '.tmvu-home-nm-btn-content{display:inline-flex;align-items:center;justify-content:center;gap:var(--tmu-space-sm)}',
            '.tmvu-home-nm-btn-live{display:inline-flex;align-items:center;justify-content:center;gap:var(--tmu-space-sm);padding:var(--tmu-space-xs) var(--tmu-space-sm);border-radius:999px;background:var(--tmu-danger-fill);border:1px solid var(--tmu-border-danger);font-size:var(--tmu-font-xs);font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--tmu-text-inverse);line-height:1}',
            '.tmvu-home-nm-btn-live-dot{width:7px;height:7px;border-radius:999px;background:var(--tmu-danger);box-shadow:0 0 0 0 var(--tmu-border-danger);animation:tmvu-home-live-pulse 1.3s ease-out infinite}',
            '@keyframes tmvu-home-live-pulse{0%{opacity:1;transform:scale(.9);box-shadow:0 0 0 0 var(--tmu-border-danger)}50%{opacity:.45;transform:scale(1);box-shadow:0 0 0 5px transparent}100%{opacity:1;transform:scale(.9);box-shadow:0 0 0 0 transparent}}',
            '.tmvu-home-nm-section{font-size:var(--tmu-font-xs);font-weight:800;color:var(--tmu-text-panel-label);text-transform:uppercase;letter-spacing:.08em;padding-top:var(--tmu-space-xs)}',
            '.tmvu-home-prevmatch{display:grid;grid-template-columns:14px 20px 1fr;gap:var(--tmu-space-sm);align-items:center;padding:var(--tmu-space-sm) 0;border-bottom:1px solid var(--tmu-border-soft-alpha)}',
            '.tmvu-home-prevmatch:last-child{border-bottom:none;padding-bottom:0}',
            '.tmvu-home-prevmatch-place{font-size:var(--tmu-font-xs);font-weight:800;color:var(--tmu-text-dim)}',
            '.tmvu-home-prevmatch-logo{width:20px;height:20px;object-fit:contain;flex-shrink:0}',
            '.tmvu-home-prevmatch-info{display:flex;flex-direction:column;gap:0;min-width:0}',
            '.tmvu-home-prevmatch-info a{font-size:var(--tmu-font-xs);color:var(--tmu-text-main);text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.tmvu-home-prevmatch-sub{font-size:var(--tmu-font-xs);color:var(--tmu-text-faint)}',
            '.tmvu-home-nm-all{display:block;text-align:center;font-size:var(--tmu-font-xs);color:var(--tmu-text-main);text-decoration:none;padding-top:var(--tmu-space-xs)}',
            '.tmvu-home-thread{display:grid;grid-template-columns:1fr auto;gap:var(--tmu-space-md);align-items:start;padding:var(--tmu-space-md);border:1px solid var(--tmu-border-soft-alpha);border-radius:var(--tmu-space-md);background:var(--tmu-surface-item-dark)}',
            '.tmvu-home-thread:hover{background:var(--tmu-border-contrast);border-color:var(--tmu-success-fill-soft)}',
            '.tmvu-home-thread-main{min-width:0;display:flex;align-items:flex-start;gap:var(--tmu-space-sm)}',
            '.tmvu-home-thread-dot{width:5px;height:5px;border-radius:999px;background:var(--tmu-text-faint);flex:0 0 auto;margin-top:var(--tmu-space-sm);opacity:.9}',
            '.tmvu-home-thread-copy{min-width:0}',
            '.tmvu-home-thread a{font-size:var(--tmu-font-sm);color:var(--tmu-text-main);text-decoration:none;display:block;line-height:1.5;font-weight:800}',
            '.tmvu-home-thread a:hover{color:var(--tmu-text-accent-soft)}',
            '.tmvu-home-thread-date{font-size:var(--tmu-font-xs);color:var(--tmu-text-muted);font-weight:800;white-space:nowrap;padding:var(--tmu-space-xs) var(--tmu-space-sm);border-radius:999px;background:var(--tmu-border-contrast);border:1px solid var(--tmu-border-soft-alpha)}',
            '.tmvu-home-forum-footer{padding-top:var(--tmu-space-xs)}',
            '.tmvu-home-forum-link{display:block;text-align:center;font-size:var(--tmu-font-xs);font-weight:800;color:var(--tmu-text-panel-label);text-decoration:none;padding:var(--tmu-space-md);border-radius:var(--tmu-space-md);border:1px solid var(--tmu-border-soft-alpha);background:var(--tmu-surface-item-dark)}',
            '.tmvu-home-forum-link:hover{background:var(--tmu-border-contrast);color:var(--tmu-text-main)}',
            '@media (max-width: 1120px){.tmvu-home-page{grid-template-columns:minmax(0,1fr);padding-left:var(--tmu-space-sm);padding-right:var(--tmu-space-sm)}.tmvu-home-right{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--tmu-space-lg)}}',
            '@media (max-width: 760px){.tmvu-home-cal-head{flex-direction:column;align-items:flex-start}.tmvu-home-cal-day{grid-template-columns:58px 1fr}.tmvu-home-right{grid-template-columns:1fr}.tmvu-home-tabpanel{padding:var(--tmu-space-lg)}.tmvu-home-nm-matchup{grid-template-columns:1fr;gap:var(--tmu-space-md)}.tmvu-home-nm-vs{order:2}.tmvu-home-nm-team--home{order:1}.tmvu-home-nm-team--away{order:3;flex-direction:column}.tmvu-home-nm-team,.tmvu-home-nm-team--home,.tmvu-home-nm-team--away{justify-content:flex-start}.tmvu-home-nm-copy,.tmvu-home-nm-team--home .tmvu-home-nm-copy,.tmvu-home-nm-team--away .tmvu-home-nm-copy{text-align:center;justify-content:center}}',
        ];
        const style = document.getElementById(STYLE_ID) || document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = rules.join('');
        if (!style.parentNode) document.head.appendChild(style);
    };

    const buildNextMatch = (col2) => {
        const nextMatchBox = findColumnBoxByTitle(col2, 'Next match');
        const nmStd = nextMatchBox?.querySelector('.next_match.std, .next_match') || col2.querySelector('.next_match.std, .next_match');
        if (!nmStd) return null;

        const wrap = document.createElement('div');
        wrap.className = 'tmvu-home-nm tmu-stack tmu-stack-density-roomy';

        const nameEls = nmStd.querySelectorAll('.names .name a[club_link], .names .name a.white[club_link], .names .name a[href*="/club/"]');
        const logos = nmStd.querySelectorAll('.logos .club_logo');
        if (logos.length >= 2 && nameEls.length >= 2) {
            const matchup = document.createElement('div');
            matchup.className = 'tmvu-home-nm-matchup';

            const createTeam = (logoEl, nameEl, side) => {
                const team = document.createElement('a');
                team.className = `tmvu-home-nm-team tmvu-home-nm-team--${side}`;
                team.href = nameEl.getAttribute('href') || '#';

                const badge = document.createElement('div');
                badge.className = 'tmvu-home-nm-badge';

                const img = document.createElement('img');
                img.src = logoEl.src;
                img.alt = '';
                img.className = 'tmvu-home-nm-logo';
                badge.appendChild(img);

                const copy = document.createElement('div');
                copy.className = 'tmvu-home-nm-copy';

                const name = document.createElement('span');
                name.className = 'tmvu-home-nm-name';
                name.textContent = clean(nameEl.textContent);
                copy.appendChild(name);

                team.appendChild(badge);
                team.appendChild(copy);
                return team;
            };

            const homeTeam = createTeam(logos[0], nameEls[0], 'home');
            const awayTeam = createTeam(logos[1], nameEls[1], 'away');

            const vs = document.createElement('span');
            vs.className = 'tmvu-home-nm-vs';
            vs.textContent = 'VS';

            matchup.appendChild(homeTeam);
            matchup.appendChild(vs);
            matchup.appendChild(awayTeam);
            wrap.appendChild(matchup);
        }

        const isLive = Boolean(nmStd.querySelector('.match_link.event img[src*="tv_live.gif"], .match_link.event img[src*="live"]'));

        // Competition + date
        const infoEl = nmStd.querySelector('.event.event_border');
        if (infoEl) {
            const d = document.createElement('div');
            d.className = 'tmvu-home-nm-info';
            const infoClone = infoEl.cloneNode(true);
            infoClone.querySelectorAll('.match_link.event, .live, .match_live, .live_now, [class*="live"]').forEach((node) => node.remove());
            d.innerHTML = infoClone.innerHTML.replace(/\bLIVE\b/gi, '').replace(/\s{2,}/g, ' ').trim();
            wrap.appendChild(d);
        }

        // Watch Pre Match / Live button
        const btnEl = nmStd.querySelector('.match_link:not(.event) a')
            || nmStd.querySelector('.match_link a[href*="/matches/"]');
        if (btnEl) {
            const btnText = clean(btnEl.textContent) || (isLive ? 'Watch Live' : 'Open Match');
            const btnContent = document.createElement('span');
            btnContent.className = 'tmvu-home-nm-btn-content';

            if (isLive) {
                const liveBadge = document.createElement('span');
                liveBadge.className = 'tmvu-home-nm-btn-live';
                const liveDot = document.createElement('span');
                liveDot.className = 'tmvu-home-nm-btn-live-dot';
                liveBadge.appendChild(liveDot);

                const liveText = document.createElement('span');
                liveText.textContent = 'LIVE';
                liveBadge.appendChild(liveText);
                btnContent.appendChild(liveBadge);
            }

            const btnLabel = document.createElement('span');
            btnLabel.textContent = btnText;
            btnContent.appendChild(btnLabel);

            const btn = TmButton.button({
                slot: btnContent,
                color: 'primary',
                block: true,
                onClick: () => { location.href = btnEl.getAttribute('href'); },
            });
            wrap.appendChild(btn);
        }

        // Previous Matches
        const prevDiv = nextMatchBox?.querySelector('#previous_matches') || col2.querySelector('#previous_matches');
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
        const fixturesA = nextMatchBox?.querySelector('.align_center a[href]') || col2.querySelector('.align_center a[href]');
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
        const forumBox = findColumnBoxByTitle(col2, 'Forum');
        if (!forumBox) return null;

        const wrap = document.createElement('div');
        wrap.className = 'tmvu-home-forum tmu-stack tmu-stack-density-tight';

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

        if (wrap.children.length > 1) return wrap;

        const empty = document.createElement('div');
        empty.innerHTML = TmUI.empty('No forum threads available.', true);
        return empty.firstElementChild || empty;
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

    const mountHomeSection = ({
        title = '',
        titleMode = 'body',
        flush = false,
        cardVariant = '',
        bodyHtml = '',
        fillBody,
    } = {}) => {
        const wrap = document.createElement('section');
        const refs = TmSectionCard.mount(wrap, {
            title,
            titleMode,
            flush,
            cardVariant,
            bodyHtml,
        });
        if (refs?.body && typeof fillBody === 'function') fillBody(refs.body);
        return { wrap, refs };
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
        wrap.className = 'tmvu-home-cal tmu-stack tmu-stack-density-tight';

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
                eventsWrap.innerHTML = TmUI.empty('No scheduled items', true);
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
            panel.innerHTML = TmUI.empty(escapeHtml(emptyCopy), true);
            return;
        }

        panel.innerHTML = `
            <div class="tmvu-home-list tmu-stack tmu-stack-density-tight">
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

        const homeFeed = createSocialFeedComponent({
            mount: null,
            getFeedRoot: () => getNativeFeedRoot(),
            emptyCopy: 'No recent feed items found.',
            loadingCopy: 'Loading feed...',
            onLoadMore: async () => {
                if (apiFeedState.isLoadingMore || !apiFeedState.canLoadMore) return;
                apiFeedState.isLoadingMore = true;
                homeFeed.renderPosts(apiFeedState.topPosts, {
                    kind: 'api',
                    lastPost: apiFeedState.lastPost,
                    canLoadMore: apiFeedState.canLoadMore,
                    isLoadingMore: true,
                    feedRoot: getNativeFeedRoot(),
                });

                const refreshedFeedRoot = getNativeFeedRoot();
                await loadApiHomeFeedPage(refreshedFeedRoot, { lastPost: apiFeedState.lastPost });

                apiFeedState.isLoadingMore = false;
                homeFeed.renderPosts(apiFeedState.topPosts, {
                    kind: 'api',
                    lastPost: apiFeedState.lastPost,
                    canLoadMore: apiFeedState.canLoadMore,
                    isLoadingMore: false,
                    feedRoot: getNativeFeedRoot(),
                });
            },
        });

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
            panel.innerHTML = TmUI.loading('Loading messages...', true);

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
            else mount.innerHTML = TmUI.empty('No calendar items loaded.', true);
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

        const renderHomeFeedTab = async () => {
            const panel = panels[feedKey];
            const mount = getPanelMount(panel);
            if (!mount) return;

            homeFeed.setMount(mount);

            homeFeed.renderLoading();

            const nativeFeedRoot = installNativeFeedSanitizer();
            const apiFeedModel = await loadApiHomeFeedPage(nativeFeedRoot, { reset: true });
            if (apiFeedModel?.topPosts?.length) {
                homeFeed.renderPosts(apiFeedState.topPosts, {
                    kind: 'api',
                    lastPost: apiFeedState.lastPost,
                    canLoadMore: apiFeedState.canLoadMore,
                    isLoadingMore: apiFeedState.isLoadingMore,
                    feedRoot: nativeFeedRoot,
                });
                return;
            }
            if (nativeFeedRoot && queryVisibleNativeFeedPosts(nativeFeedRoot).length) {
                homeFeed.renderNative(nativeFeedRoot);
                return;
            }

            homeFeed.renderEmpty();
        };

        // Tabs section card
        const { wrap: tabsWrap } = mountHomeSection({
            title: '',
            titleMode: 'body',
            flush: true,
            bodyHtml: '',
            fillBody: (body) => {
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

                body.appendChild(tabsHost);
            },
        });

        if (tabsOuter) sourceHost.appendChild(tabsOuter);
        if (tabsContent) sourceHost.appendChild(tabsContent);
        document.body.appendChild(sourceHost);

        bindHomeSourceObserver(getSourcePanel(calendarKey), renderCalendarPanel);
        bindHomeSourceObserver(getSourcePanel(feedKey), () => {
            const panel = panels[feedKey];
            const mount = getPanelMount(panel);
            const nativeFeedRoot = installNativeFeedSanitizer();
            if (mount && nativeFeedRoot && queryVisibleNativeFeedPosts(nativeFeedRoot).length) {
                homeFeed.setMount(mount);
                loadApiHomeFeedPage(nativeFeedRoot, { reset: true }).then((apiFeedModel) => {
                    if (apiFeedModel?.topPosts?.length) {
                        homeFeed.renderPosts(apiFeedState.topPosts, {
                            kind: 'api',
                            lastPost: apiFeedState.lastPost,
                            canLoadMore: apiFeedState.canLoadMore,
                            isLoadingMore: apiFeedState.isLoadingMore,
                            feedRoot: nativeFeedRoot,
                        });
                        return;
                    }
                    homeFeed.renderNative(nativeFeedRoot);
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
        const { wrap: nmWrap } = mountHomeSection({
            title: 'Next Match',
            titleMode: 'body',
            cardVariant: 'sidebar',
            bodyHtml: '',
            fillBody: (body) => {
                const nmContent = buildNextMatch(col2);
                if (nmContent) body.appendChild(nmContent);
            },
        });

        // Forum section card
        const { wrap: forumWrap } = mountHomeSection({
            title: 'Forum',
            titleMode: 'body',
            cardVariant: 'sidebar',
            bodyHtml: '',
            fillBody: (body) => {
                const forumContent = buildForum(col2);
                if (forumContent) body.appendChild(forumContent);
            },
        });

        // Assemble 2-col layout
        const leftCol = document.createElement('div');
        leftCol.className = 'tmvu-home-left tmu-page-section-stack';
        leftCol.appendChild(tabsWrap);

        const rightCol = document.createElement('div');
        rightCol.className = 'tmvu-home-right tmu-page-section-stack';
        rightCol.appendChild(nmWrap);
        rightCol.appendChild(forumWrap);

        main.classList.add('tmvu-home-page', 'tmu-page-density-roomy');
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
