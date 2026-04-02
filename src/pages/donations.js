import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';

(function () {
    'use strict';

    if (!/^\/donations(\/legendary)?\/?$/i.test(window.location.pathname)) return;

    const STYLE_ID = 'tmvu-donations-style';
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();
        const rules = [
            '.tmvu-donations-hero{grid-template-columns:minmax(0,1fr)!important}',
            // intro text
            '.tmvu-donations-intro{font-size:var(--tmu-font-sm);line-height:1.75;color:var(--tmu-text-main)}',
            '.tmvu-donations-intro p{margin:0 0 var(--tmu-space-md)}',
            '.tmvu-donations-intro ul{padding-left:var(--tmu-space-xl);margin:0 0 var(--tmu-space-md)}',
            '.tmvu-donations-intro li{margin-bottom:var(--tmu-space-xs)}',
            '.tmvu-donations-intro a{color:var(--tmu-accent);text-decoration:none}',
            '.tmvu-donations-intro a:hover{text-decoration:underline}',
            '.tmvu-donations-intro strong{color:var(--tmu-text-strong)}',
            // donators section heading
            '.tmvu-donations-section{font-size:var(--tmu-font-xs);font-weight:800;color:var(--tmu-text-panel-label);margin:var(--tmu-space-xl) 0 var(--tmu-space-md);text-transform:uppercase;letter-spacing:.06em;padding-bottom:var(--tmu-space-xs);border-bottom:1px solid var(--tmu-border-soft-alpha-strong)}',
            '.tmvu-donations-section:first-child{margin-top:0}',
            // tier
            '.tmvu-donations-tier{margin-bottom:var(--tmu-space-lg)}',
            '.tmvu-donations-amount{display:inline-block;padding:var(--tmu-space-xs) var(--tmu-space-md);background:linear-gradient(135deg,var(--tmu-surface-accent-soft),var(--tmu-surface-panel-dark));border:1px solid var(--tmu-border-success);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-sm);font-weight:700;color:var(--tmu-text-accent-soft);margin-bottom:var(--tmu-space-sm)}',
            '.tmvu-donations-clubs{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:var(--tmu-space-xs)}',
            '.tmvu-donations-club{display:flex;align-items:center;gap:var(--tmu-space-sm);padding:var(--tmu-space-xs) var(--tmu-space-sm);border-radius:var(--tmu-space-xs);font-size:var(--tmu-font-sm)}',
            '.tmvu-donations-club:nth-child(odd){background:var(--tmu-border-contrast)}',
            '.tmvu-donations-club a.normal{color:var(--tmu-text-main);text-decoration:none}',
            '.tmvu-donations-club a.normal:hover{color:var(--tmu-accent);text-decoration:underline}',
            // legendary clubs grid
            '.tmvu-donations-legendary{--tmu-card-grid-min:200px}',
            '.tmvu-donations-legendary .tmvu-donations-club{background:var(--tmu-border-contrast);border-radius:var(--tmu-space-xs)}',
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

    const buildIntro = (stdDiv) => {
        const wrap = document.createElement('div');
        wrap.className = 'tmvu-donations-intro';

        // Grab nodes up to and including the h3 "Top Donators" — stop before it
        for (const node of Array.from(stdDiv.childNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H3') break;
            wrap.appendChild(node.cloneNode(true));
        }
        return wrap;
    };

    const buildDonators = (stdDiv) => {
        const wrap = document.createElement('div');

        const heading = document.createElement('div');
        heading.className = 'tmvu-donations-section';
        heading.textContent = clean(stdDiv.querySelector('h3')?.textContent || 'Top Donators');
        wrap.appendChild(heading);

        // Walk children after h3: alternating .dark.large (amount) and ul.zebra (clubs)
        let currentTier = null;
        let inDonators = false;

        for (const node of Array.from(stdDiv.childNodes)) {
            if (node.nodeType !== Node.ELEMENT_NODE) continue;

            if (node.tagName === 'H3') { inDonators = true; continue; }
            if (!inDonators) continue;

            if (node.classList.contains('dark') && node.classList.contains('large')) {
                currentTier = document.createElement('div');
                currentTier.className = 'tmvu-donations-tier';

                const amtBadge = document.createElement('div');
                amtBadge.className = 'tmvu-donations-amount';
                amtBadge.textContent = clean(node.textContent);
                currentTier.appendChild(amtBadge);

                const clubList = document.createElement('ul');
                clubList.className = 'tmvu-donations-clubs';
                currentTier.appendChild(clubList);

                wrap.appendChild(currentTier);
            } else if (node.tagName === 'UL' && currentTier) {
                const clubList = currentTier.querySelector('.tmvu-donations-clubs');
                node.querySelectorAll('li').forEach(li => {
                    // skip empty club links (id=0)
                    const clubLink = li.querySelector('a.normal');
                    if (!clubLink || !clubLink.textContent.trim()) return;

                    const item = document.createElement('li');
                    item.className = 'tmvu-donations-club';

                    const flag = li.querySelector('ib[class*="flag-img-"]');
                    if (flag) item.appendChild(flag.cloneNode(true));

                    const link = clubLink.cloneNode(true);
                    item.appendChild(link);
                    clubList.appendChild(item);
                });
            }
        }

        return wrap;
    };

    const buildLegendary = (stdDiv) => {
        const wrap = document.createElement('div');

        // Intro paragraphs (everything before the first <li>)
        const introDiv = document.createElement('div');
        introDiv.className = 'tmvu-donations-intro';
        for (const node of Array.from(stdDiv.childNodes)) {
            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'LI') break;
            introDiv.appendChild(node.cloneNode(true));
        }
        wrap.appendChild(introDiv);

        // Club list — bare <li> elements directly in .std
        const clubList = document.createElement('ul');
        clubList.className = 'tmvu-donations-clubs tmvu-donations-legendary tmu-page-card-grid tmu-card-grid-density-tight';

        stdDiv.querySelectorAll('li').forEach(li => {
            const clubLink = li.querySelector('a.normal');
            if (!clubLink || !clubLink.textContent.trim()) return;

            const item = document.createElement('li');
            item.className = 'tmvu-donations-club';

            const flag = li.querySelector('ib[class*="flag-img-"]');
            if (flag) item.appendChild(flag.cloneNode(true));
            item.appendChild(clubLink.cloneNode(true));
            clubList.appendChild(item);
        });

        wrap.appendChild(clubList);
        return wrap;
    };

    const renderLegendary = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;

        const col1 = main.querySelector('.column1');
        const col2 = main.querySelector('.column2_a');
        if (!col2) return;

        const snap = col2.cloneNode(true);
        const title = clean(snap.querySelector('.box_head h1.std, .box_head h2.std')?.textContent || 'Legendary Clubs');
        const std = snap.querySelector('.box_body .std');

        const navItems = col1 ? parseNav(col1.cloneNode(true)) : [];

        injectStyles();

        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-donations-hero',
            slots: { kicker: 'TM PRO Diamond', title },
        });

        const cardWrap = document.createElement('section');
        const cardRefs = TmSectionCard.mount(cardWrap, {
            flush: true,
            bodyHtml: '',
        });
        if (cardRefs?.body && std) {
            cardRefs.body.appendChild(buildLegendary(std));
        }

        const mainCol = document.createElement('div');
        mainCol.className = 'tmvu-donations-main tmu-page-section-stack';
        mainCol.appendChild(heroWrap);
        mainCol.appendChild(cardWrap);

        main.classList.add('tmvu-donations-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
        main.innerHTML = '';
        main.appendChild(mainCol);
        TmSideMenu.mount(main, { className: 'tmu-page-sidebar-stack', items: navItems, currentHref: window.location.pathname });
    };

    const renderPage = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;

        const col1 = main.querySelector('.column1');
        const col2 = main.querySelector('.column2_a');
        if (!col2) return;

        const snap = col2.cloneNode(true);
        const title = clean(snap.querySelector('.box_head h1.std, .box_head h2.std')?.textContent || 'Donations');
        const std = snap.querySelector('.box_body .std');

        const navItems = col1 ? parseNav(col1.cloneNode(true)) : [];

        injectStyles();

        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-donations-hero',
            slots: { kicker: 'TM PRO', title },
        });

        // Intro card
        const introCardWrap = document.createElement('section');
        const introRefs = TmSectionCard.mount(introCardWrap, {
            flush: true,
            bodyHtml: '',
        });
        if (introRefs?.body && std) {
            introRefs.body.appendChild(buildIntro(std));
        }

        // Donators card
        const donatorsCardWrap = document.createElement('section');
        const donatorsRefs = TmSectionCard.mount(donatorsCardWrap, {
            flush: true,
            bodyHtml: '',
        });
        if (donatorsRefs?.body && std) {
            donatorsRefs.body.appendChild(buildDonators(std));
        }

        const mainCol = document.createElement('div');
        mainCol.className = 'tmvu-donations-main tmu-page-section-stack';
        mainCol.appendChild(heroWrap);
        mainCol.appendChild(introCardWrap);
        mainCol.appendChild(donatorsCardWrap);

        main.classList.add('tmvu-donations-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
        main.innerHTML = '';
        main.appendChild(mainCol);
        TmSideMenu.mount(main, { className: 'tmu-page-sidebar-stack', items: navItems, currentHref: window.location.pathname });
    };

    const waitForContent = () => {
        const isLegendary = /\/donations\/legendary/i.test(window.location.pathname);
        const check = () => document.querySelector('.column2_a .box_head');
        const run = () => isLegendary ? renderLegendary() : renderPage();
        if (check()) { run(); return; }
        const observer = new MutationObserver(() => {
            if (check()) { observer.disconnect(); run(); }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForContent);
    } else {
        waitForContent();
    }
})();
