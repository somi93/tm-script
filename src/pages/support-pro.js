import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';

(function () {
    'use strict';

    if (!/^\/support-pro\/?$/i.test(window.location.pathname)) return;

    const STYLE_ID = 'tmvu-spro-style';
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        const rules = [
            // 2-col layout: side-menu | main
            '.tmvu-spro-page{display:grid!important;grid-template-columns:184px minmax(0,1fr);gap:16px;align-items:start}',
            '.tmvu-spro-main{display:flex;flex-direction:column;gap:16px;min-width:0}',
            // hero: single column
            '.tmvu-spro-hero{grid-template-columns:minmax(0,1fr)!important}',
            // article body
            '.tmvu-spro-body{font-size:13px;line-height:1.75;color:var(--tmu-text-main)}',
            '.tmvu-spro-body a{color:var(--tmu-accent);text-decoration:none}',
            '.tmvu-spro-body a:hover{text-decoration:underline}',
            // TOC
            '.tmvu-spro-toc{list-style:none;margin:0 0 18px;padding:0;display:flex;flex-direction:column;gap:4px;padding-left:12px}',
            '.tmvu-spro-toc a{font-size:12px;color:var(--tmu-text-panel-label)}',
            '.tmvu-spro-toc a:hover{color:#b0d890;text-decoration:underline}',
            // "Answers" heading
            '.tmvu-spro-section{font-size:11px;font-weight:800;color:var(--tmu-text-panel-label);margin:4px 0 14px;text-transform:uppercase;letter-spacing:.06em;padding-bottom:4px;border-bottom:1px solid rgba(61,104,40,.3)}',
            // FAQ items
            '.tmvu-spro-faq-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:0}',
            '.tmvu-spro-faq-item{padding:14px 0;border-bottom:1px solid rgba(61,104,40,.18)}',
            '.tmvu-spro-faq-item:last-child{border-bottom:none;padding-bottom:0}',
            '.tmvu-spro-faq-q{font-weight:700;color:var(--tmu-text-strong);font-size:13px;margin-bottom:6px}',
            '.tmvu-spro-faq-a{color:var(--tmu-text-main);padding-left:12px;border-left:2px solid rgba(100,160,60,.25);font-size:13px;line-height:1.7}',
        ];
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = rules.join('');
        document.head.appendChild(style);
    };

    const parseNav = (col1) =>
        Array.from(col1.querySelectorAll('.content_menu a')).map(a => ({
            href: a.getAttribute('href'),
            label: clean(a.textContent),
        }));

    const buildContent = (boxBody) => {
        const clone = boxBody.cloneNode(true);
        clone.querySelectorAll('.box_shadow').forEach(el => el.remove());

        const wrap = document.createElement('div');
        wrap.className = 'tmvu-spro-body';

        // TOC: first <ul> (list-style:none with anchor links)
        const tocUl = clone.querySelector('ul');
        if (tocUl) {
            tocUl.className = 'tmvu-spro-toc';
            tocUl.removeAttribute('style');
            tocUl.querySelectorAll('li').forEach(li => li.removeAttribute('style'));
            wrap.appendChild(tocUl);
        }

        // "Answers" h3
        const h3 = clone.querySelector('h3');
        if (h3) {
            h3.className = 'tmvu-spro-section';
            h3.removeAttribute('style');
            h3.textContent = clean(h3.textContent);
            wrap.appendChild(h3);
        }

        // FAQ answers — in .std > ul
        const faqUl = clone.querySelector('.std ul');
        if (faqUl) {
            const newList = document.createElement('ul');
            newList.className = 'tmvu-spro-faq-list';

            Array.from(faqUl.querySelectorAll('li')).forEach(li => {
                const item = document.createElement('li');
                item.className = 'tmvu-spro-faq-item';

                // Question anchor (keep for TOC jump targets)
                const anchor = li.querySelector('a[name]');
                if (anchor) {
                    const a = document.createElement('a');
                    a.name = anchor.getAttribute('name');
                    item.appendChild(a);
                }

                // Question text (strong)
                const strong = li.querySelector('strong');
                if (strong) {
                    const qDiv = document.createElement('div');
                    qDiv.className = 'tmvu-spro-faq-q';
                    qDiv.textContent = clean(strong.textContent);
                    item.appendChild(qDiv);
                }

                // Answer div
                const answerDiv = li.querySelector('div');
                if (answerDiv) {
                    answerDiv.removeAttribute('style');
                    answerDiv.className = 'tmvu-spro-faq-a';
                    item.appendChild(answerDiv);
                }

                newList.appendChild(item);
            });

            wrap.appendChild(newList);
        }

        return wrap;
    };

    const renderPage = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;

        const col1 = main.querySelector('.column1');
        const col2 = main.querySelector('.column2_a');
        if (!col2) return;

        const snap2 = col2.cloneNode(true);
        const title = clean(snap2.querySelector('.box_head h1.std, .box_head h2.std')?.textContent || 'Support');
        const boxBody = snap2.querySelector('.box_body');

        const navItems = col1 ? parseNav(col1.cloneNode(true)) : [];

        injectStyles();

        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-spro-hero',
            slots: { kicker: 'TM PRO', title },
        });

        const cardWrap = document.createElement('section');
        const cardRefs = TmSectionCard.mount(cardWrap, {
            flush: true,
            bodyHtml: '',
        });
        if (cardRefs?.body && boxBody) {
            cardRefs.body.appendChild(buildContent(boxBody));
        }

        const mainCol = document.createElement('div');
        mainCol.className = 'tmvu-spro-main';
        mainCol.appendChild(heroWrap);
        mainCol.appendChild(cardWrap);

        main.classList.add('tmvu-spro-page');
        main.innerHTML = '';
        main.appendChild(mainCol);
        TmSideMenu.mount(main, { items: navItems, currentHref: window.location.pathname });
    };

    const waitForContent = () => {
        const check = () => document.querySelector('.column2_a .box_head h1.std, .column2_a .box_head h2.std');
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
