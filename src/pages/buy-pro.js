import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';

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
        const rules = [
            // 2-col layout: side-menu | main
            '.tmvu-buypro-page{display:grid!important;grid-template-columns:184px minmax(0,1fr);gap:16px;align-items:start}',
            '.tmvu-buypro-main{display:flex;flex-direction:column;gap:16px;min-width:0}',
            // hero: single column
            '.tmvu-buypro-hero{grid-template-columns:minmax(0,1fr)!important}',
            // recipient bar
            '.tmvu-buypro-recipient{display:flex;align-items:center;gap:8px;font-size:12px;color:#90b878;margin-bottom:16px}',
            '.tmvu-buypro-recipient strong{color:#c8e0b4}',
            '.tmvu-buypro-recipient a{color:#80e048;font-size:11px;margin-left:auto;text-decoration:none}',
            '.tmvu-buypro-recipient a:hover{text-decoration:underline}',
            // product grid
            '.tmvu-buypro-products{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}',
            '.tmvu-buypro-product{display:flex;flex-direction:column;gap:8px;padding:16px;border:1px solid rgba(61,104,40,.3);border-radius:8px;background:rgba(0,0,0,.15)}',
            '.tmvu-buypro-product-period{font-size:11px;font-weight:800;color:#a8c890;text-transform:uppercase;letter-spacing:.06em}',
            '.tmvu-buypro-product-price{font-size:22px;font-weight:700;color:#e0f0c0;line-height:1}',
            '.tmvu-buypro-product-badge{font-size:10px;color:#80e048;font-weight:700;margin-top:-4px}',
            '.tmvu-buypro-product-btn{display:inline-block;margin-top:auto;padding:7px 14px;background:linear-gradient(135deg,#4a8a28,#2d5a18);color:#e0f0c0;border-radius:6px;font-size:12px;font-weight:700;text-decoration:none;text-align:center;cursor:pointer;border:1px solid rgba(80,140,40,.4);transition:filter .15s}',
            '.tmvu-buypro-product-btn:hover{filter:brightness(1.15)}',
            // notice
            '.tmvu-buypro-notice{font-size:12px;line-height:1.65;color:#a0b890}',
            '.tmvu-buypro-notice a{color:#80e048;text-decoration:none}',
            '.tmvu-buypro-notice p{margin:0 0 8px}',
            '.tmvu-buypro-notice p:last-child{margin-bottom:0}',
            '.tmvu-buypro-notice strong{color:#c8e0b4}',
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

            const btn = document.createElement('a');
            btn.className = 'tmvu-buypro-product-btn';
            btn.href = `javascript:submit_order(${value})`;
            btn.textContent = 'To Payment';

            card.appendChild(periodDiv);
            card.appendChild(priceDiv);
            if (badge) {
                const badgeDiv = document.createElement('div');
                badgeDiv.className = 'tmvu-buypro-product-badge';
                badgeDiv.textContent = badge;
                card.appendChild(badgeDiv);
            }
            card.appendChild(btn);
            wrap.appendChild(card);
        });

        return wrap;
    };

    const renderPage = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;

        const col1 = main.querySelector('.column1');
        const col2 = main.querySelector('.column2_a');
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
            flush: true,
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
            flush: true,
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
        mainCol.className = 'tmvu-buypro-main';
        mainCol.appendChild(heroWrap);
        mainCol.appendChild(productCardWrap);
        mainCol.appendChild(noticeCardWrap);

        main.classList.add('tmvu-buypro-page');
        main.innerHTML = '';
        main.appendChild(mainCol);

        // Re-attach hidden live form (needed for submit_order JS)
        main.appendChild(liveForm);

        TmSideMenu.mount(main, { items: PRO_NAV, currentHref: window.location.pathname });
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
