import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmUI }         from '../components/shared/tm-ui.js';
import { TmButton }     from '../components/shared/tm-button.js';

(function () {
    'use strict';

    if (!/^\/home\/?$/i.test(window.location.pathname)) return;

    const STYLE_ID = 'tmvu-home-style';
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        const rules = [
            '.tmvu-home-page{display:grid!important;grid-template-columns:minmax(0,1fr) 320px;gap:20px;align-items:start;max-width:1120px;margin:0 auto}',
            '.tmvu-home-left{display:flex;flex-direction:column;gap:16px;min-width:0}',
            '.tmvu-home-right{display:flex;flex-direction:column;gap:16px;min-width:0}',
            '.tmvu-home-tabs-card .tmu-card-body{padding:0!important;gap:0!important}',
            '.tmvu-home-tabpanel{display:none}',
            '.tmvu-home-tabpanel.tmvu-tab-active{display:block;padding:14px 16px 16px}',
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
            '@media (max-width: 760px){.tmvu-home-cal-head{flex-direction:column;align-items:flex-start}.tmvu-home-cal-day{grid-template-columns:58px 1fr}.tmvu-home-right{grid-template-columns:1fr}}',
        ];
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = rules.join('');
        document.head.appendChild(style);
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

    const renderPage = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;

        const col1 = main.querySelector('.column1');
        const col2 = main.querySelector('.column2_a');
        if (!col1 || !col2) return;

        injectStyles();

        const origTabs = parseOrigTabs(col1);
        const tabsContent = col1.querySelector('.tabs_content');

        // Keep original .tabs_outer hidden — TM JS still toggles active_tab class on it
        const tabsOuter = col1.querySelector('.tabs_outer');
        if (tabsOuter) tabsOuter.style.display = 'none';

        // Build panels (keyed by targetId)
        const activeKey = origTabs.find(t => t.isActive)?.targetId || origTabs[0]?.targetId || '';
        const panels = {};

        origTabs.forEach(tab => {
            const panel = document.createElement('div');
            panel.className = 'tmvu-home-tabpanel';
            if (tab.targetId === activeKey) panel.classList.add('tmvu-tab-active');

            const origContent = tabsContent?.querySelector(`#${tab.targetId}`);
            if (origContent) {
                if (tab.targetId === 'calendar') {
                    // Keep #calendar hidden in <body> so TM's $.post → $("#calendar").html(...) still works
                    origContent.style.display = 'none';
                    document.body.appendChild(origContent);

                    const calView = document.createElement('div');
                    panel.appendChild(calView);

                    const rebuildCal = () => {
                        calView.innerHTML = '';
                        if (origContent.querySelector('.day')) {
                            calView.appendChild(buildCalendar(origContent));
                        }
                    };

                    new MutationObserver(rebuildCal)
                        .observe(origContent, { childList: true, subtree: true });

                    // If this tab is active on load, fire TM's onclick to kick off the AJAX request
                    if (tab.isActive && tab.onclick) {
                        try { (new Function(tab.onclick))(); } catch (_) { /* ignore */ }
                    }
                } else {
                    // Feed / PM / Referrals — move live div so AJAX still populates it
                    panel.appendChild(origContent);
                }
            }

            panels[tab.targetId] = panel;
        });

        // Tab bar — use shared TmUI.tabs
        const tabBar = TmUI.tabs({
            items: origTabs.map(t => ({ key: t.targetId, label: t.label })),
            active: activeKey,
            stretch: true,
            onChange: (key) => {
                Object.entries(panels).forEach(([k, p]) => p.classList.toggle('tmvu-tab-active', k === key));
                const tab = origTabs.find(t => t.targetId === key);
                if (tab?.onclick) {
                    try { (new Function(tab.onclick))(); } catch (_) { /* ignore */ }
                }
            },
        });

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
            tabsRefs.body.appendChild(tabBar);
            Object.values(panels).forEach(panel => tabsRefs.body.appendChild(panel));
        }

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
