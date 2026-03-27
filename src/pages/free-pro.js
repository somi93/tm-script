import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';

(function () {
    'use strict';

    if (!/^\/free-pro\/?$/i.test(window.location.pathname)) return;

    const STYLE_ID = 'tmvu-freepro-style';
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

    const PRO_NAV = [
        { href: '/buy-pro', label: 'Buy Pro' },
        { href: '/free-pro', label: 'Free Pro' },
        { href: '/donations', label: 'Donations' },
        { href: '/support-pro', label: 'Support' },
    ];

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        const rules = [
            '.tmvu-freepro-page{display:grid!important;grid-template-columns:184px minmax(0,1fr);gap:16px;align-items:start}',
            '.tmvu-freepro-main{display:flex;flex-direction:column;gap:16px;min-width:0}',
            '.tmvu-freepro-hero{grid-template-columns:minmax(0,1fr)!important}',
            '.tmvu-freepro-body{font-size:13px;line-height:1.75;color:#c8e0b4}',
            '.tmvu-freepro-body p{margin:0 0 12px}',
            '.tmvu-freepro-body p:last-child{margin-bottom:0}',
            '.tmvu-freepro-body a{color:#80e048;text-decoration:none}',
            '.tmvu-freepro-body a:hover{text-decoration:underline}',
        ];
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = rules.join('');
        document.head.appendChild(style);
    };

    const renderPage = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;

        const col2 = main.querySelector('.column2_c');
        if (!col2) return;

        const snap = col2.cloneNode(true);
        const title = clean(snap.querySelector('.box_head h1.std, .box_head h2.std')?.textContent || 'Free Pro');
        const std = snap.querySelector('.box_body .std');

        injectStyles();

        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-freepro-hero',
            slots: { kicker: 'TM PRO', title },
        });

        const cardWrap = document.createElement('section');
        const cardRefs = TmSectionCard.mount(cardWrap, {
            flush: true,
            bodyHtml: '',
        });
        if (cardRefs?.body && std) {
            std.removeAttribute('class');
            std.className = 'tmvu-freepro-body';
            // strip HTML comments (iframe placeholder)
            std.querySelectorAll('*').forEach(el => {
                if (el.tagName === 'SCRIPT') el.remove();
            });
            cardRefs.body.appendChild(std);
        }

        const mainCol = document.createElement('div');
        mainCol.className = 'tmvu-freepro-main';
        mainCol.appendChild(heroWrap);
        mainCol.appendChild(cardWrap);

        main.classList.add('tmvu-freepro-page');
        main.innerHTML = '';
        main.appendChild(mainCol);
        TmSideMenu.mount(main, { items: PRO_NAV, currentHref: window.location.pathname });
    };

    const waitForContent = () => {
        const check = () => document.querySelector('.column2_c .box_head');
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
