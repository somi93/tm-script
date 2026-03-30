import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmPlayerService } from '../services/player.js';
import { TmPlayerTooltip } from '../components/player/tm-player-tooltip.js';

(function () {
    'use strict';

    if (!/^\/forum\//i.test(window.location.pathname)) return;

    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();
    const esc = (v) => String(v || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const htmlOf = (node) => node ? node.outerHTML : '';
    const buttonHtml = ({ cls = '', attrs = {}, ...opts } = {}) => htmlOf(TmUI.button({ ...opts, cls, attrs }));

    // â”€â”€ sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    function parseSidebar(src) {
        const countryOptions = Array.from(src.querySelectorAll('#menu_country_select_hidden option')).map(o => ({
            val: o.value,
            label: clean(o.textContent),
            sel: o.getAttribute('selected') !== null || o.selected,
        }));

        // Derive current scope from URL: /forum/{country_code}/{section}/
        const urlMatch = window.location.pathname.match(/^\/forum\/([^/]+)\//i);
        const urlCode  = urlMatch ? urlMatch[1].toLowerCase() : '';

        // Find option whose value matches the URL code; 'int' → value may be 'int' or '0' or similar
        let activeOption = countryOptions.find(o => o.val.toLowerCase() === urlCode);
        // If not found by value, try matching label slug (some codes are numeric)
        if (!activeOption && urlCode) {
            activeOption = countryOptions.find(o => o.val.toLowerCase() === urlCode || o.label.toLowerCase().replace(/\s*\[.*$/, '').trim().toLowerCase() === urlCode);
        }
        // Mark the correct option as selected (override TM's pre-selection)
        if (activeOption) {
            countryOptions.forEach(o => { o.sel = false; });
            activeOption.sel = true;
        }

        const currentCountry = activeOption
            ? clean(activeOption.label.replace(/\s*\[.*$/, ''))
            : (urlCode === 'int' ? 'International' : clean(
                src.querySelector('.dark .white')?.firstChild?.textContent
                || src.querySelector('.dark .white')?.textContent || ''
            ));

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
            title: currentCountry || 'Scope',
            icon: '\uD83C\uDF0D',
            bodyHtml: '<div class="tmvu-forum-country-wrap">'
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
            window.location.assign('/forum/' + e.target.value + '/general/');
        });

        return sidebar;
    }

    // â”€â”€ pager â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

    // â”€â”€ styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            '.tmvu-forum-nav-group .tmu-list-item.is-active{background:rgba(108,192,64,.14);box-shadow:inset 3px 0 0 var(--tmu-accent);color:var(--tmu-text-strong)}',
            // country selector
            '.tmvu-forum-country-wrap{display:flex;flex-direction:column;gap:8px}',
            '.tmvu-forum-country-current{font-size:13px;font-weight:700;color:var(--tmu-text-strong)}',
            '.tmvu-forum-country-select{width:100%;padding:7px 10px;border-radius:8px;border:1px solid rgba(61,104,40,.3);background:rgba(12,24,9,.8);color:var(--tmu-text-strong);font:inherit;font-size:12px}',
            // pager
            '.tmvu-forum-pager{display:flex;gap:5px;flex-wrap:wrap;align-items:center}',
            '.tmvu-forum-pager-link{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:28px;padding:0 8px;border-radius:999px;border:1px solid rgba(61,104,40,.22);background:rgba(42,74,28,.22);color:var(--tmu-text-main);font-size:11px;font-weight:700;text-decoration:none}',
            '.tmvu-forum-pager-link:hover{background:rgba(108,192,64,.12);color:var(--tmu-text-strong)}',
            '.tmvu-forum-pager-link.is-current{background:rgba(108,192,64,.18);border-color:rgba(108,192,64,.3);color:var(--tmu-text-strong)}',
            '.tmvu-forum-pager-link.icon{min-width:28px;font-size:14px}',
            // listing topics
            '.tmvu-forum-topic-list{display:flex;flex-direction:column;gap:8px}',
            '.tmvu-forum-pager-footer{margin-top:12px}',
            '.tmvu-forum-topic{display:flex;justify-content:space-between;gap:14px;padding:12px 14px;border-radius:12px;border:1px solid rgba(90,126,42,.16);background:rgba(12,24,9,.22);transition:background .15s}',
            '.tmvu-forum-topic:hover{background:rgba(28,52,16,.5)}',
            '.tmvu-forum-topic.is-subtle{opacity:.84}',
            '.tmvu-forum-topic-main{flex:1 1 auto;min-width:0}',
            '.tmvu-forum-topic-head{display:flex;align-items:flex-start;gap:10px}',
            '.tmvu-forum-topic-title{color:var(--tmu-text-strong);font-size:14px;font-weight:700;line-height:1.35;text-decoration:none}',
            '.tmvu-forum-topic-title:hover{color:var(--tmu-text-strong);text-decoration:underline}',
            '.tmvu-forum-topic-badges{display:flex;gap:5px;flex-wrap:wrap;align-items:center;margin-top:4px}',
            '.tmvu-forum-topic-meta{margin-top:6px;display:flex;gap:8px;color:var(--tmu-text-muted);font-size:11px}',
            '.tmvu-forum-topic-side{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;width:76px}',
            '.tmvu-forum-topic-jump{color:var(--tmu-text-main);font-size:11px;font-weight:700;text-decoration:none;white-space:nowrap}',
            '.tmvu-forum-topic-jump:hover{color:var(--tmu-text-strong);text-decoration:underline}',
            // thread posts
            '.tmvu-forum-posts{display:flex;flex-direction:column;gap:10px}',
            '.tmvu-forum-post{display:flex;gap:14px;padding:14px;border-radius:12px;border:1px solid rgba(90,126,42,.15);background:rgba(12,24,9,.22)}',
            '.tmvu-forum-post-user{flex-shrink:0;width:140px;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}',
            '.tmvu-forum-post-logo{width:72px;height:72px;border-radius:10px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.2)}',
            '.tmvu-forum-post-logo img{width:72px;height:72px;object-fit:contain}',
            '.tmvu-forum-post-club{font-size:11px;font-weight:700;color:var(--tmu-text-main);text-decoration:none;line-height:1.3;word-break:break-word}',
            '.tmvu-forum-post-club:hover{color:var(--tmu-text-inverse)}',
            '.tmvu-forum-post-rank{font-size:10px;color:var(--tmu-text-muted);font-style:italic;text-align:center}',
            '.tmvu-forum-post-flag img{height:14px;border-radius:2px}',
            '.tmvu-forum-post-badges{display:flex;flex-wrap:wrap;justify-content:center;gap:3px;margin-top:3px;align-items:center}',
            '.tmvu-forum-post-pro{height:12px}',
            '.tmvu-forum-post-veteran{height:16px}',
            '.tmvu-forum-post-franks{display:flex;gap:2px;flex-wrap:wrap;justify-content:center}',
            '.tmvu-forum-post-franks img{height:12px}',
            '.tmvu-forum-post-franks img[src*="micro_gt"]{filter:hue-rotate(10deg)}',
            '.tmvu-forum-post-franks img[src*="micro_dt"]{filter:hue-rotate(30deg)}',
            '.tmvu-forum-post-franks img[src*="micro_ft"]{filter:hue-rotate(60deg)}',
            '.tmvu-forum-post-franks img[src*="micro_lt"]{filter:hue-rotate(90deg)}',
            '.tmvu-forum-post-franks img[src*="micro_wt"]{filter:hue-rotate(120deg)}',
            '.tmvu-forum-post-franks img[src*="micro_mt"]{filter:hue-rotate(150deg)}',
            '.tmvu-forum-post-franks img[src*="micro_st"]{filter:hue-rotate(180deg)}',
            '.tmvu-forum-post-franks img[src*="micro_ct"]{filter:hue-rotate(210deg)}',
            '.tmvu-forum-post-franks img[src*="micro_ot"]{filter:hue-rotate(240deg)}',
            '.tmvu-forum-post-franks img[src*="micro_xt"]{filter:hue-rotate(270deg)}',
            '.tmvu-forum-post-franks img[src*="micro_rt"]{filter:hue-rotate(300deg)}',
            '.tmvu-forum-post-franks img[src*="micro_nt"]{filter:hue-rotate(330deg)}',
            '.tmvu-forum-post-body{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:8px}',
            '.tmvu-forum-post-meta{display:flex;align-items:center;gap:10px;padding-bottom:8px;border-bottom:1px solid rgba(61,104,40,.14)}',
            '.tmvu-forum-post-num{font-size:11px;font-weight:800;color:#5a824a;text-decoration:none}',
            '.tmvu-forum-post-num:hover{color:#a4d476}',
            '.tmvu-forum-post-date{font-size:11px;color:#6a8e52;margin-left:auto}',
            '.tmvu-forum-post-likes{display:flex;gap:5px;align-items:center;cursor:pointer;border-radius:5px;padding:1px 4px;transition:background .12s}',
            '.tmvu-forum-post-likes:hover{background:rgba(108,192,64,.1)}',
            '.tmvu-forum-post-like-pos{color:#7fc65a;font-size:11px;font-weight:700}',
            '.tmvu-forum-post-like-neg{color:#c47a5a;font-size:11px;font-weight:700}',
            '.tmvu-forum-post-content{font-size:13px;color:#d4e8c0;line-height:1.65;word-break:break-word}',
            '.tmvu-forum-post-content a{color:#8ecc60;text-decoration:none}',
            '.tmvu-forum-post-content a:hover{text-decoration:underline}',
            '.tmvu-forum-post-content a[player_link]{white-space:nowrap}',
            '.tmvu-pstars{display:inline-flex;align-items:center;gap:1px;vertical-align:middle;margin-right:2px}',
            '.tmvu-pinfo{font-size:10px;color:#7aaa5a;font-weight:600;margin-left:3px;opacity:.85}',
            '.tmvu-forum-post-content img{max-width:100%;border-radius:6px;margin:4px 0}',
            '.tmvu-forum-post-content .quote{margin:8px 0;padding:8px 12px;border-left:3px solid rgba(108,192,64,.35);background:rgba(42,74,28,.3);border-radius:0 8px 8px 0;font-size:12px;color:#b4cc98}',
            '.tmvu-forum-post-content .quote_text{display:block}',
            '.tmvu-forum-post-content .mega_quotes{display:none!important}',
            '.tmvu-forum-post-content .subtle.align_right{font-size:10px;color:#6a8e52;text-align:right;margin-top:4px}',
            '.tmvu-forum-post-content .text_red{color:#e07060}',
            '.tmvu-forum-post-content .text_blue{color:#6090e0}',
            '.tmvu-forum-post-content .text_orange{color:#e0a050}',
            '.tmvu-forum-post-actions{display:flex;gap:8px;align-items:center;padding-top:8px;border-top:1px solid rgba(61,104,40,.12)}',
            '.tmvu-post-btn{line-height:1;display:inline-flex;align-items:center}',
            '.tmvu-post-link{padding:4px 10px;border-radius:6px;border:1px solid rgba(61,104,40,.25);background:rgba(42,74,28,.3);color:#a4cc88;font-size:11px;font-weight:700;line-height:1;text-decoration:none;display:inline-flex;align-items:center}',
            '.tmvu-post-link:hover{background:rgba(108,192,64,.15);color:#e0f0c0;border-color:rgba(108,192,64,.3)}',
            '.tmvu-post-hidden{display:none!important}',
            // reply / compose form
            '.tmvu-forum-form{display:flex;flex-direction:column;gap:0}',
            '.tmvu-forum-form-toolbar{display:flex;flex-wrap:wrap;gap:4px;padding:8px;background:rgba(12,24,9,.4);border-radius:8px 8px 0 0;border:1px solid rgba(61,104,40,.22);border-bottom:none}',
            '.tmvu-ftool{min-width:26px;min-height:26px;line-height:1}',
            '.tmvu-ftool img{height:14px;filter:brightness(1.5)saturate(.4);pointer-events:none;vertical-align:middle}',
            '.tmvu-ftool svg{width:15px;height:15px;display:block;pointer-events:none}',
            '.tmvu-ftool .smiley{pointer-events:none}',
            '.tmvu-forum-form #forum_post_form{display:block!important}',
            '.tmvu-forum-form #forum_post_form>.forum_center,.tmvu-forum-form #forum_post_form>.textarea_icons{display:none!important}',
            '.tmvu-forum-title-row{margin-bottom:0}',
            '.tmvu-forum-title-input{width:100%;box-sizing:border-box;padding:9px 12px;background:rgba(8,18,5,.8);border:1px solid rgba(61,104,40,.25);border-radius:8px 8px 0 0;color:#d4e8c0;font-size:13px;font-family:inherit;outline:none;border-bottom:none;display:block}',
            '.tmvu-forum-title-input:focus{border-color:rgba(108,192,64,.42);background:rgba(8,18,5,.95)}',
            '.tmvu-forum-title-input+.tmvu-forum-form-toolbar{border-radius:0;border-top:1px solid rgba(61,104,40,.22)}',
            '.tmvu-forum-title-input~* .tmvu-forum-form #topic_content{border-radius:0 0 8px 8px!important}',
            '.tmvu-forum-form #forum_post_form .align_center{display:block!important;text-align:left!important}',
            '.tmvu-forum-form #forum_post_form .textarea_buttons{visibility:hidden;height:0;overflow:hidden;margin:0;padding:0}',
            '.tmvu-forum-form #topic_content{width:100%!important;max-width:100%!important;box-sizing:border-box!important;padding:10px 12px!important;background:rgba(8,18,5,.8)!important;border:1px solid rgba(61,104,40,.25)!important;border-radius:0 0 8px 8px!important;color:#d4e8c0!important;font-size:13px!important;font-family:inherit!important;line-height:1.6!important;resize:vertical!important;min-height:120px!important;outline:none!important;display:block!important}',
            '.tmvu-forum-form #topic_content:focus{border-color:rgba(108,192,64,.42)!important;background:rgba(8,18,5,.95)!important}',
            // inline panel (colors / smileys / url prompt)
            '.tmvu-forum-panel{display:none;padding:6px 8px;background:rgba(8,16,4,.6);border-left:1px solid rgba(61,104,40,.22);border-right:1px solid rgba(61,104,40,.22)}',
            '.tmvu-fpanel-prompt{display:flex;gap:6px;align-items:center}',
            '.tmvu-fpanel-input{flex:1;min-width:0;padding:5px 9px;border-radius:6px;border:1px solid rgba(61,104,40,.28);background:rgba(8,18,5,.8);color:#d4e8c0;font-size:12px;font-family:inherit;outline:none}',
            '.tmvu-fpanel-input:focus{border-color:rgba(108,192,64,.42);background:rgba(8,18,5,.95)}',
            '.tmvu-fpanel-colors{display:flex;gap:5px;align-items:center;flex-wrap:wrap}',
            '.tmvu-fcolor{width:20px;height:20px;border-radius:4px;border:1px solid rgba(0,0,0,.35);cursor:pointer;flex-shrink:0;transition:transform .1s}',
            '.tmvu-fcolor:hover{transform:scale(1.18);border-color:rgba(255,255,255,.35)}',
            '.tmvu-fcolor--yellow{background:#c8a800}',
            '.tmvu-fcolor--orange{background:#c86400}',
            '.tmvu-fcolor--red{background:#b82020}',
            '.tmvu-fcolor--purple{background:#7818a8}',
            '.tmvu-fcolor--blue{background:#1650c0}',
            '.tmvu-fcolor--pink{background:#b02888}',
            '.tmvu-fcolor--black{background:#182814}',
            '.tmvu-fpanel-smileys{display:flex;gap:5px;align-items:center;flex-wrap:wrap}',
            '.tmvu-fsmiley{display:inline-flex;align-items:center;justify-content:center;padding:4px;border-radius:5px;background:rgba(42,74,28,.3);border:1px solid rgba(61,104,40,.2);cursor:pointer;min-width:26px;min-height:26px}',
            '.tmvu-fsmiley:hover{background:rgba(108,192,64,.15)}',
            '.tmvu-ftool--sm{padding:2px 8px!important;font-size:10px!important;min-width:auto!important;min-height:auto!important}',
            '@media(max-width:960px){.tmvu-main.tmvu-forum-page{grid-template-columns:1fr}.tmvu-forum-post-user{width:100px}}',
        ].join('');
        document.head.appendChild(s);
    }

    // â”€â”€ topic item HTML (listing) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    function buildForumCard(liveForm, title) {
        if (!liveForm) return null;

        // Park TM's original pickers off-screen so TM's own code can still find them by ID
        ['smiley_picker', 'color_picker'].forEach(function (id) {
            var el = liveForm.querySelector('#' + id);
            if (el) { el.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden'; document.body.appendChild(el); }
        });

        // ── Native BB helpers (no jQuery / .caret() required) ─────────────
        window._tmvuF = {
            _ta: function () { return document.getElementById('topic_content'); },
            // Wrap selection with open+close tags (toggle: remove if already wrapped)
            _wrap: function (open, close) {
                var ta = this._ta(); if (!ta) return;
                var s = ta.selectionStart, e = ta.selectionEnd;
                var sel = ta.value.substring(s, e);
                var ins = (sel.startsWith(open) && close && sel.endsWith(close))
                    ? sel.slice(open.length, sel.length - close.length)
                    : open + sel + close;
                ta.value = ta.value.slice(0, s) + ins + ta.value.slice(e);
                ta.selectionStart = s; ta.selectionEnd = s + ins.length;
                ta.focus();
            },
            // Insert text at cursor (replaces selection)
            _ins: function (text) {
                var ta = this._ta(); if (!ta) return;
                var s = ta.selectionStart, e = ta.selectionEnd;
                ta.value = ta.value.slice(0, s) + text + ta.value.slice(e);
                ta.selectionStart = ta.selectionEnd = s + text.length;
                ta.focus();
            },
            bold:   function () { this._wrap('[b]', '[/b]'); },
            italic: function () { this._wrap('[i]', '[/i]'); },
            code:   function () { this._wrap('[pre]', '[/pre]'); },
            color:  function (c) { this._wrap('[color=' + c + ']', '[/color]'); this._close(); },
            smiley: function (n) { this._ins('[smiley=' + n + ']'); this._close(); },
            link:   function (url) {
                url = (url || '').trim(); if (!url) return;
                var ta = this._ta(); if (!ta) return;
                var sel = ta.value.substring(ta.selectionStart, ta.selectionEnd);
                if (sel) this._wrap('[url=' + url + ']', '[/url]');
                else this._ins('[url=' + url + ']' + url + '[/url]');
                this._close();
            },
            image:  function (url) {
                url = (url || '').trim(); if (!url) return;
                this._ins('[img=' + url + ']');
                this._close();
            },
            player: function (id) {
                id = (id || '').trim(); if (!id) return;
                this._ins('[player=' + id + ']');
                this._close();
            },
            _panel: function () { return document.getElementById('tmvu-forum-panel'); },
            _close: function () {
                var p = this._panel();
                if (p) { p.style.display = 'none'; p.innerHTML = ''; }
            },
            _open:  function (html) {
                var p = this._panel(); if (!p) return;
                p.innerHTML = html;
                p.style.display = 'block';
            },
            showColors: function () {
                this._open('<div class="tmvu-fpanel-colors">'
                    + ['yellow','orange','red','purple','blue','pink','black'].map(function (c) {
                        return buttonHtml({ cls: 'tmvu-fcolor tmvu-fcolor--' + c, title: c, size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.color(\'' + c + '\')' } });
                    }).join('')
                    + buttonHtml({ slot: '&times;', cls: 'tmvu-ftool tmvu-ftool--sm', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF._close()' } })
                    + '</div>');
            },
            showSmileys: function () {
                this._open('<div class="tmvu-fpanel-smileys">'
                    + [1,2,3,4,5,6,7].map(function (n) {
                        return buttonHtml({ slot: '<span class="smiley smiley' + n + '"></span>', cls: 'tmvu-fsmiley', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.smiley(' + n + ')' } });
                    }).join('')
                    + buttonHtml({ slot: '&times;', cls: 'tmvu-ftool tmvu-ftool--sm', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF._close()' } })
                    + '</div>');
            },
            showPrompt: function (type) {
                var ph = type === 'player' ? 'Player ID' : type === 'image' ? 'Image URL' : 'https://';
                var call = '_tmvuF.' + type + '(document.getElementById(\'tmvu-fpanel-input\').value)';
                this._open('<div class="tmvu-fpanel-prompt">'
                    + '<input id="tmvu-fpanel-input" type="text" class="tmvu-fpanel-input" placeholder="' + ph + '"'
                    + ' onkeydown="if(event.key===\'Enter\'){' + call + '}else if(event.key===\'Escape\'){_tmvuF._close()}">'
                    + buttonHtml({ label: 'OK', cls: 'tmvu-ftool tmvu-ftool--sm', size: 'xs', color: 'secondary', attrs: { onclick: call } })
                    + buttonHtml({ slot: '&times;', cls: 'tmvu-ftool tmvu-ftool--sm', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF._close()' } })
                    + '</div>');
                setTimeout(function () { var i = document.getElementById('tmvu-fpanel-input'); if (i) i.focus(); }, 20);
            },
        };

        // ── Card shell ────────────────────────────────────────────────────
        var host = document.createElement('div');
        TmSectionCard.mount(host, { title: title || 'Reply', icon: '\u270D', bodyHtml: '<div class="tmvu-forum-form"></div>' });
        var card = host.firstElementChild || host;
        var wrap = card.querySelector('.tmvu-forum-form');

        // ── Topic title field (New Topic only) ────────────────────────────
        var titleInput = liveForm.querySelector('#topic_title');
        if (titleInput) {
            titleInput.className = 'tmvu-forum-title-input';
            titleInput.placeholder = 'Topic title…';
            wrap.appendChild(titleInput);
        }

        // SVG icons
        var svgB     = '<svg viewBox="0 0 16 16" fill="none" stroke="none" xmlns="http://www.w3.org/2000/svg"><text x="2" y="13" font-size="13" font-weight="900" font-family="serif" fill="currentColor">B</text></svg>';
        var svgI     = '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><text x="5" y="13" font-size="13" font-style="italic" font-weight="700" font-family="serif" fill="currentColor">I</text></svg>';
        var svgCode  = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><polyline points="5,4 1,8 5,12"/><polyline points="11,4 15,8 11,12"/></svg>';
        var svgColor = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" xmlns="http://www.w3.org/2000/svg"><path d="M8 2 L14 13 H2 Z" stroke-linejoin="round"/><line x1="4.5" y1="9.5" x2="11.5" y2="9.5"/></svg>';
        var svgLink  = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6.5 9.5a3.5 3.5 0 0 0 5 0l2-2a3.5 3.5 0 0 0-5-5L7 4"/><path d="M9.5 6.5a3.5 3.5 0 0 0-5 0l-2 2a3.5 3.5 0 0 0 5 5L9 12"/></svg>';
        var svgImg   = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="1.5" y="3" width="13" height="10" rx="1.5"/><circle cx="5.5" cy="6.5" r="1"/><path d="M1.5 11 L5 7.5 L8 10.5 L10.5 8 L14.5 13"/></svg>';
        var svgUser  = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="5.5" r="2.5"/><path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/></svg>';
        var svgSmiley= '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6"/><circle cx="5.5" cy="7" r=".7" fill="currentColor" stroke="none"/><circle cx="10.5" cy="7" r=".7" fill="currentColor" stroke="none"/><path d="M5.5 10.5 Q8 12.5 10.5 10.5" stroke-linejoin="round"/></svg>';

        var tb = document.createElement('div');
        tb.className = 'tmvu-forum-form-toolbar';
        tb.innerHTML =
                        buttonHtml({ slot: svgB, cls: 'tmvu-ftool', title: 'Bold', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.bold()' } })
                    + buttonHtml({ slot: svgI, cls: 'tmvu-ftool', title: 'Italic', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.italic()' } })
                    + buttonHtml({ slot: svgCode, cls: 'tmvu-ftool', title: 'Code', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.code()' } })
                    + buttonHtml({ slot: svgColor, cls: 'tmvu-ftool', title: 'Color', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.showColors()' } })
                    + buttonHtml({ slot: svgLink, cls: 'tmvu-ftool', title: 'Link', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.showPrompt(\'link\')' } })
                    + buttonHtml({ slot: svgImg, cls: 'tmvu-ftool', title: 'Image', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.showPrompt(\'image\')' } })
                    + buttonHtml({ slot: svgUser, cls: 'tmvu-ftool', title: 'Player', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.showPrompt(\'player\')' } })
                    + buttonHtml({ slot: svgSmiley, cls: 'tmvu-ftool', title: 'Smileys', size: 'xs', color: 'secondary', attrs: { onclick: '_tmvuF.showSmileys()' } });

        var panel = document.createElement('div');
        panel.id = 'tmvu-forum-panel';
        panel.className = 'tmvu-forum-panel';

        // Ensure hidden submit_post so form.submit() includes it server-side
        if (!liveForm.querySelector('[name="submit_post"][type="hidden"]')) {
            var hs = document.createElement('input');
            hs.type = 'hidden'; hs.name = 'submit_post'; hs.value = 'Submit';
            liveForm.appendChild(hs);
        }

        wrap.appendChild(tb);
        wrap.appendChild(panel);
        wrap.appendChild(liveForm);

        var acts = document.createElement('div');
        acts.className = 'tmvu-forum-form-actions';
        acts.innerHTML =
                        buttonHtml({ label: 'Submit', cls: 'tmvu-post-btn tmvu-post-btn--primary', color: 'primary', size: 'xs', attrs: { onclick: 'document.getElementById(\'forum_post_form\').submit()' } })
                    + buttonHtml({ label: 'Preview', cls: 'tmvu-post-btn', color: 'secondary', size: 'xs', attrs: { onclick: 'pop_preview2()' } });
        wrap.appendChild(acts);
        return card;
    }

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

    // â”€â”€ render listing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

        const liveFormL = main.querySelector('#forum_post_form');
        if (liveFormL) liveFormL.remove();

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

        const composeCard = buildForumCard(liveFormL, 'Post New Topic');
        if (composeCard) col.appendChild(composeCard);

        main.appendChild(col);
    }

    // â”€â”€ render thread â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    function renderThread(main, src) {
        const sidebarData  = parseSidebar(src);
        const forumEl      = src.querySelector('#forum') || src;
        const topicPagesEl = forumEl.querySelector('.topic_pages');
        const backHref     = topicPagesEl?.querySelector('.arrow_left')?.getAttribute('href') || '';
        const pagerSummary = clean(topicPagesEl?.querySelector('.subtle')?.textContent || '');
        const pagerLinks   = parsePager(forumEl, '.topic_pages');
        const topicTitle   = clean(forumEl.querySelector('h1.mega_headline')?.textContent || 'Thread');
        const liveFormT = main.querySelector('#forum_post_form');
        if (liveFormT) liveFormT.remove();

        const posts = Array.from(forumEl.querySelectorAll('.topic_post')).map(postEl => {
            const userEl   = postEl.querySelector('.user');
            const clubA    = userEl?.querySelector('a[club_link]');
            const logoLink = userEl?.querySelector('a[no_logo]') || userEl?.querySelector('a.logo_large') || userEl?.querySelector('a.logo_normal') || userEl?.querySelector('a:has(.club_logo)');
            const logoClubId = logoLink?.getAttribute('no_logo') || '';
            const logoImgEl  = logoLink?.querySelector('.club_logo') || userEl?.querySelector('.club_logo');
            // Prefer the already-rendered src; fall back to constructing from no_logo id
            const logoSrc = (logoImgEl?.getAttribute('src') || '') || (logoClubId ? '/pics/club_logos/' + logoClubId + '.png' : '');
            const valign   = userEl?.querySelector('.valign_all');
            const flagA    = valign?.querySelector('a[href*="/national-teams/"]');
            const flagImg  = flagA?.querySelector('img');
            const veteranImg = valign?.querySelector('img[src*="veteran_rank"]');
            const isPro    = !!valign?.querySelector('.pro_icon');
            const forumRankImgs = Array.from(userEl?.querySelectorAll('.forum_rank') || []).map(img => img.getAttribute('src') || '');
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
                postDbId:      postEl.getAttribute('id')?.replace('post', '') || '',
                postNum:       clean(postNumA?.textContent || ''),
                postAnchorId:  postNumA?.getAttribute('id') || '',
                postDate:      clean(actionsEl?.querySelector('.post_time')?.textContent || ''),
                clubHref:      clubA?.getAttribute('href') || (logoClubId ? '/club/' + logoClubId + '/' : ''),
                clubName:      clean(clubA?.textContent || ''),
                logoSrc,
                flagSrc:       flagImg?.getAttribute('src') || '',
                flagHref:      flagA?.getAttribute('href') || '',
                veteranSrc:    veteranImg?.getAttribute('src') || '',
                veteranTip:    veteranImg?.getAttribute('tooltip') || '',
                isPro,
                forumRankImgs,
                rank:          clean(postEl.querySelector('.user_rank')?.textContent || ''),
                contentHtml:   (textEl?.querySelector('span') || textEl)?.innerHTML || '',
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
                actions:  (backHref ? '<a class="tmvu-post-link" href="' + esc(backHref) + '">\u2190 Back</a> ' : '')
                          + buttonHtml({ label: '\u270F Reply', cls: 'tmvu-post-btn', color: 'secondary', size: 'xs', attrs: { onclick: 'reply()' } }),
                footer:   pagerHtml(pagerLinks),
            },
        });
        col.appendChild(heroHost.firstElementChild || heroHost);

        const postsHtml = posts.map(p => {
            const posNum   = p.postNum.replace('#', '');
            const likesHtml = (p.likesPos > 0 ? '<span class="tmvu-forum-post-like-pos">+' + p.likesPos + '</span>' : '')
                            + (p.likesNeg > 0 ? ' <span class="tmvu-forum-post-like-neg">-' + p.likesNeg + '</span>' : '');
            const flagEl = p.flagSrc ? '<div class="tmvu-forum-post-flag">' + (p.flagHref ? '<a href="' + esc(p.flagHref) + '">' : '') + '<img src="' + esc(p.flagSrc) + '" alt="">' + (p.flagHref ? '</a>' : '') + '</div>' : '';
            const veteranEl = p.veteranSrc ? '<img class="tmvu-forum-post-veteran" src="' + esc(p.veteranSrc) + '" title="' + esc(p.veteranTip) + '" alt="' + esc(p.veteranTip) + '">' : '';
            const proEl = p.isPro ? '<img class="tmvu-forum-post-pro" src="/pics/pro_icon.png" title="TM Pro" alt="Pro">' : '';
            const forumRanksEl = p.forumRankImgs.length ? '<div class="tmvu-forum-post-franks">' + p.forumRankImgs.map(src => '<img src="' + esc(src) + '">').join('') + '</div>' : '';
            return '<div class="tmvu-forum-post">'
                // user card
                + '<div class="tmvu-forum-post-user">'
                +   '<div class="tmvu-forum-post-logo">'
                +     (p.clubHref ? '<a href="' + esc(p.clubHref) + '">' : '')
                +     (p.logoSrc ? '<img src="' + esc(p.logoSrc) + '" alt="">' : '<span style="font-size:22px;opacity:.35">\u26BD</span>')
                +     (p.clubHref ? '</a>' : '')
                +   '</div>'
                +   (p.clubHref
                    ? '<a class="tmvu-forum-post-club" href="' + esc(p.clubHref) + '">' + esc(p.clubName) + '</a>'
                    : (p.clubName ? '<span class="tmvu-forum-post-club">' + esc(p.clubName) + '</span>' : ''))
                +   flagEl
                +   '<div class="tmvu-forum-post-badges">' + proEl + veteranEl + forumRanksEl + '</div>'
                +   (p.rank ? '<div class="tmvu-forum-post-rank">' + esc(p.rank) + '</div>' : '')
                + '</div>'
                // post body
                + '<div class="tmvu-forum-post-body">'
                +   '<div class="tmvu-forum-post-meta">'
                +     (p.postAnchorId ? '<a class="tmvu-forum-post-num" id="' + esc(p.postAnchorId) + '" href="#' + esc(posNum) + '">' + esc(p.postNum) + '</a>' : '')
                +     (likesHtml && p.postDbId ? '<span class="tmvu-forum-post-likes" onclick="pop_likes(' + p.postDbId + ')" title="See who liked this">' + likesHtml + '</span>' : likesHtml ? '<span class="tmvu-forum-post-likes">' + likesHtml + '</span>' : '')
                +     (p.postDate ? '<span class="tmvu-forum-post-date">' + esc(p.postDate) + '</span>' : '')
                +   '</div>'
                +   '<div class="tmvu-forum-post-content">' + p.contentHtml + '</div>'
                +   '<div class="tmvu-forum-post-actions">'
                +     (p.postDbId ? buttonHtml({ label: '\u2665 ' + (p.likesPos || 0), cls: 'tmvu-post-btn', color: 'secondary', size: 'xs', attrs: { onclick: 'pop_likes(' + p.postDbId + ')' } }) : '')
                +     (p.seqNum ? buttonHtml({ label: 'Quote', cls: 'tmvu-post-btn', color: 'secondary', size: 'xs', attrs: { onclick: 'quote(' + p.seqNum + ')' } }) : '')
                +     buttonHtml({ label: 'Reply', cls: 'tmvu-post-btn', color: 'secondary', size: 'xs', attrs: { onclick: 'reply()' } })
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

        // ── Resolve @playerID text → named <a player_link> ─────────────────
        (function resolvePlayerMentions() {
            // Fetch player data, normalize, render name + fractional SVG stars + compact stats inline
            const starsSvg = (rec, pid) => {
                const D = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
                const full = Math.min(5, Math.max(0, rec || 0));
                const fullN = Math.floor(full);
                const frac = full - fullN;
                let s = '';
                for (let i = 1; i <= 5; i++) {
                    if (i <= fullN) {
                        s += `<svg width="13" height="13" viewBox="0 0 24 24"><path d="${D}" fill="#f5c518"/></svg>`;
                    } else if (i === fullN + 1 && frac >= 0.1) {
                        const pct = Math.round(frac * 100);
                        const gid = `tmvupg_${pid}_${i}`;
                        s += `<svg width="13" height="13" viewBox="0 0 24 24"><defs><linearGradient id="${gid}" x1="0" x2="1" y1="0" y2="0"><stop offset="${pct}%" stop-color="#f5c518"/><stop offset="${pct}%" stop-color="#374f22"/></linearGradient></defs><path d="${D}" fill="url(#${gid})"/></svg>`;
                    } else {
                        s += `<svg width="13" height="13" viewBox="0 0 24 24"><path d="${D}" fill="none" stroke="#5a7a44" stroke-width="1.5"/></svg>`;
                    }
                }
                return `<span class="tmvu-pstars">${s}</span>`;
            };
            const fetchAndEnrich = (pid, anchor) => {
                const fd = new FormData();
                fd.append('player_id', pid);
                fetch('/ajax/tooltip.ajax.php', { method: 'POST', body: fd, credentials: 'include' })
                    .then(r => r.ok ? r.json() : null)
                    .then(data => {
                        if (!data?.player) return;
                        const p = data.player;
                        TmPlayerService.normalizePlayer(p, null, { skipSync: true });
                        const name = p.name || p.player_name || '';
                        if (!name) return;
                        const retired = p.club_id == null;
                        const starsHtml = starsSvg(p.rec, pid);
                        const ageHtml = !retired && p.ageMonthsString ? `<span class="tmvu-pinfo">${p.ageMonthsString}</span> ` : '';
                        const r5Html = !retired && p.r5 != null ? ` <span class="tmvu-pinfo">${p.r5.toFixed(2)}</span>` : '';
                        anchor.innerHTML = starsHtml + ageHtml + esc(name) + r5Html;
                    })
                    .catch(() => {});
            };

            col.querySelectorAll('.tmvu-forum-post-content').forEach(content => {
                // Step 1: existing <a href="/players/ID/"> anchors (TM already created them)
                content.querySelectorAll('a[href]').forEach(a => {
                    const m = (a.getAttribute('href') || '').match(/\/players?\/(\d+)\//);
                    if (!m) return;
                    const pid = m[1];
                    if (!a.getAttribute('player_link')) a.setAttribute('player_link', pid);
                    if (/@player\d+/.test(a.textContent)) fetchAndEnrich(pid, a);
                });

                // Step 2: bare @playerID or [player=ID] text nodes not inside any anchor
                const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null, false);
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
                        // split groups: [full, @playerID|[player=ID], id-from-@, id-from-[player=]]
                        if (i % 4 === 0) {
                            if (parts[i]) frag.appendChild(document.createTextNode(parts[i]));
                        } else if (i % 4 === 1) {
                            const pid = parts[i + 1] || parts[i + 2];
                            const a = document.createElement('a');
                            a.setAttribute('player_link', pid);
                            a.href = '/players/' + pid + '/';
                            a.textContent = parts[i];
                            fetchAndEnrich(pid, a);
                            frag.appendChild(a);
                        }
                        // i % 4 === 2,3 are inner capture groups — skip
                    }
                    textNode.parentNode?.replaceChild(frag, textNode);
                });
            });
        })();

        // ── Player link hover tooltip ─────────────────────────────────────
        let _playerTipTimer = null;
        col.addEventListener('mouseover', (e) => {
            const anchor = e.target.closest('[player_link]');
            if (!anchor || anchor.contains(e.relatedTarget)) return;
            clearTimeout(_playerTipTimer);
            const pid = anchor.getAttribute('player_link');
            if (!pid) return;
            _playerTipTimer = setTimeout(() => {
                TmPlayerService.fetchPlayerTooltip(pid).then(data => {
                    if (data?.player) TmPlayerTooltip.show(anchor, data.player);
                }).catch(() => {});
            }, 200);
        });
        col.addEventListener('mouseout', (e) => {
            const anchor = e.target.closest('[player_link]');
            if (!anchor || anchor.contains(e.relatedTarget)) return;
            clearTimeout(_playerTipTimer);
            TmPlayerTooltip.hide();
        });

        const replyCard = buildForumCard(liveFormT, 'Reply');
        if (replyCard) col.appendChild(replyCard);

        main.appendChild(col);
    }

    // â”€â”€ entry: wait for AJAX content, then dispatch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    function renderNewTopic(main, src) {
        const sidebarData = parseSidebar(src);
        const liveForm = main.querySelector('#forum_post_form');
        if (liveForm) liveForm.remove();

        injectStyles();
        main.classList.add('tmvu-forum-page');
        main.innerHTML = '';

        const sidebar = buildSidebar(sidebarData);
        main.appendChild(sidebar);

        const col = document.createElement('div');
        col.className = 'tmvu-forum-main';

        const backHref = document.referrer && document.referrer.includes('/forum/') ? document.referrer : '/forum/' + (window.location.pathname.match(/^\/forum\/([^/]+)\//)?.[1] || '') + '/general/';
        const heroHost = document.createElement('div');
        TmHeroCard.mount(heroHost, {
            slots: {
                kicker: 'Forum',
                title:  'New Topic',
                subtitle: sidebarData.currentCountry,
                actions: '<a class="tmvu-post-link" href="' + esc(backHref) + '">← Back</a>',
            },
        });
        col.appendChild(heroHost.firstElementChild || heroHost);

        const formCard = buildForumCard(liveForm, 'New Topic');
        if (formCard) col.appendChild(formCard);

        main.appendChild(col);
    }

    function waitForContent(cb) {
        const check = () => document.querySelector('.forum_topics, .topic_post, #forum_post_form');
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
        } else if (src.querySelector('#forum_post_form')) {
            renderNewTopic(main, src);
        }
    });

})();