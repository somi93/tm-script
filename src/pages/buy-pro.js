import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmUI } from '../components/shared/tm-ui.js';

(function () {
    'use strict';

    if (!/^\/buy-pro\/?$/i.test(window.location.pathname)) return;

    const STYLE_ID = 'tmvu-buypro-style';
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

    // Nav items are hardcoded because column1 on this page is a country widget, not a menu
    const PRO_NAV = [
        { href: '/buy-pro', label: 'Buy Pro' },
        { href: '/free-pro', label: 'Free Pro' },
        { href: '/donations', label: 'Donations' },
        { href: '/support-pro', label: 'Support' },
    ];

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();
        const rules = [
            // hero: single column
            '.tmvu-buypro-hero{grid-template-columns:minmax(0,1fr)!important}',
            // recipient bar
            '.tmvu-buypro-recipient{display:flex;align-items:center;gap:var(--tmu-space-sm);font-size:var(--tmu-font-sm);color:var(--tmu-text-panel-label);margin:0 var(--tmu-space-lg) var(--tmu-space-sm)}',
            '.tmvu-buypro-recipient strong{color:var(--tmu-text-main)}',
            '.tmvu-buypro-recipient a{color:var(--tmu-accent);font-size:var(--tmu-font-xs);margin-left:auto;text-decoration:none}',
            '.tmvu-buypro-recipient a:hover{text-decoration:underline}',
            // product grid
            '.tmvu-buypro-products{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--tmu-space-md);padding:var(--tmu-space-lg)}',
            '.tmvu-buypro-product{display:flex;flex-direction:column;gap:var(--tmu-space-sm);padding:var(--tmu-space-lg);border:1px solid var(--tmu-border-soft-alpha-strong);border-radius:var(--tmu-space-sm);background:var(--tmu-surface-overlay-soft)}',
            '.tmvu-buypro-product-period{font-size:var(--tmu-font-xs);font-weight:800;color:var(--tmu-text-panel-label);text-transform:uppercase;letter-spacing:.06em}',
            '.tmvu-buypro-product-price{font-size:var(--tmu-font-xl);font-weight:700;color:var(--tmu-text-strong);line-height:1}',
            '.tmvu-buypro-product-badge{font-size:var(--tmu-font-xs);color:var(--tmu-accent);font-weight:700;margin-top:calc(-1 * var(--tmu-space-xs))}',
            '.tmvu-buypro-product-btn-wrap{margin-top:auto}',
            // notice
            '.tmvu-buypro-notice{font-size:var(--tmu-font-sm);line-height:1.65;color:var(--tmu-text-main);padding:var(--tmu-space-lg)}',
            '.tmvu-buypro-notice a{color:var(--tmu-accent);text-decoration:none}',
            '.tmvu-buypro-notice p{margin:0 0 var(--tmu-space-sm)}',
            '.tmvu-buypro-notice p:last-child{margin-bottom:0}',
            '.tmvu-buypro-notice strong{color:var(--tmu-text-strong)}',
        ];
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = rules.join('');
        document.head.appendChild(style);
    };

    // badge text scraped from payment_save images, e.g. payment_save_22.png → "Save 22%"
    const parseSaveBadge = (row) => {
        const img = row.querySelector('img[src*="payment_save_"]');
        if (!img) return '';
        const m = img.src.match(/payment_save_(\d+)/);
        return m ? `Save ${m[1]}%` : '';
    };

    const buildProducts = (form) => {
        const wrap = document.createElement('div');
        wrap.className = 'tmvu-buypro-products';

        form.querySelectorAll('.product_row').forEach(row => {
            const radio = row.querySelector('input[type="radio"]');
            const value = radio?.value;
            const periodEl = row.querySelector('span[style*="white-space"]');
            const priceEl = row.querySelector('.large strong');
            if (!value || !periodEl || !priceEl) return;

            const badge = parseSaveBadge(row);
            const period = clean(periodEl.textContent);
            const price = clean(priceEl.textContent);

            const card = document.createElement('div');
            card.className = 'tmvu-buypro-product';

            const periodDiv = document.createElement('div');
            periodDiv.className = 'tmvu-buypro-product-period';
            periodDiv.textContent = period;

            const priceDiv = document.createElement('div');
            priceDiv.className = 'tmvu-buypro-product-price';
            priceDiv.textContent = price;

            card.appendChild(periodDiv);
            card.appendChild(priceDiv);
            if (badge) {
                const badgeDiv = document.createElement('div');
                badgeDiv.className = 'tmvu-buypro-product-badge';
                badgeDiv.textContent = badge;
                card.appendChild(badgeDiv);
            }
            const btnWrap = document.createElement('div');
            btnWrap.className = 'tmvu-buypro-product-btn-wrap';
            btnWrap.appendChild(TmUI.button({
                label: 'To Payment',
                color: 'primary',
                size: 'lg',
                block: true,
                onClick: () => { if (typeof submit_order === 'function') submit_order(value); },
            }));
            card.appendChild(btnWrap);
            wrap.appendChild(card);
        });

        return wrap;
    };

    const renderPage = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;

        const col1 = main.querySelector('.column1');
        const col3 = main.querySelector('.column3_a');

        const liveForm = document.getElementById('order_submit');
        if (!liveForm) return;

        injectStyles();

        // Keep live form and country select hidden in DOM so submit_order() still works
        liveForm.style.display = 'none';
        const liveCountry = document.getElementById('payment_country-button');
        if (liveCountry) liveCountry.style.display = 'none';

        // Recipient info
        const recipientEl = col1?.querySelector('#pro_recipient_name');
        const recipientName = clean(recipientEl?.textContent || '');

        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-buypro-hero',
            slots: { kicker: 'TM PRO', title: 'Buy Pro' },
        });

        // Product card
        const productCardWrap = document.createElement('section');
        const productRefs = TmSectionCard.mount(productCardWrap, {
            title: 'Select Package',
            titleMode: 'body',
            cardVariant: 'flatpanel',
            bodyHtml: '',
        });
        if (productRefs?.body) {
            if (recipientName) {
                const recipBar = document.createElement('div');
                recipBar.className = 'tmvu-buypro-recipient';
                recipBar.innerHTML = `<strong>Recipient:</strong> ${recipientName}`;
                const changeLink = document.createElement('a');
                changeLink.href = 'javascript:buy_pro_change_recipient()';
                changeLink.textContent = 'Change';
                recipBar.appendChild(changeLink);
                productRefs.body.appendChild(recipBar);
            }
            productRefs.body.appendChild(buildProducts(liveForm));
        }

        // Notice card
        const noticeCardWrap = document.createElement('section');
        const noticeRefs = TmSectionCard.mount(noticeCardWrap, {
            title: 'Notice',
            titleMode: 'body',
            cardVariant: 'flatpanel',
            bodyHtml: '',
        });
        if (noticeRefs?.body && col3) {
            const noticeStd = col3.querySelector('.std');
            if (noticeStd) {
                const noticeDiv = document.createElement('div');
                noticeDiv.className = 'tmvu-buypro-notice';
                noticeDiv.innerHTML = noticeStd.innerHTML;
                noticeRefs.body.appendChild(noticeDiv);
            }
        }

        const mainCol = document.createElement('div');
        mainCol.className = 'tmvu-buypro-main tmu-page-section-stack';
        mainCol.appendChild(heroWrap);
        mainCol.appendChild(productCardWrap);
        mainCol.appendChild(noticeCardWrap);

        main.classList.add('tmvu-buypro-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
        main.innerHTML = '';
        main.appendChild(mainCol);

        // Re-attach hidden live form (needed for submit_order JS)
        main.appendChild(liveForm);

        TmSideMenu.mount(main, { className: 'tmu-page-sidebar-stack', items: PRO_NAV, currentHref: window.location.pathname });
    };

    const waitForContent = () => {
        const check = () => document.getElementById('order_submit');
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
