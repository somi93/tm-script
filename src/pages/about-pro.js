import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';

export function initAboutProPage(main) {
    if (!main || !main.isConnected) return;

    const STYLE_ID = 'tmvu-aboutpro-style';
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();
        const rules = [
            // hero: single column (no side slot)
            '.tmvu-aboutpro-hero{grid-template-columns:minmax(0,1fr)!important}',
            // intro text
            '.tmvu-aboutpro-intro{font-size:var(--tmu-font-sm);line-height:1.75;color:var(--tmu-text-main)}',
            '.tmvu-aboutpro-intro strong{color:var(--tmu-text-strong)}',
            // feature list
            '.tmvu-aboutpro-features{display:grid;grid-template-columns:repeat(2,1fr);gap:var(--tmu-space-sm)}',
            '.tmvu-aboutpro-feature{display:flex;flex-direction:column;gap:0;background:var(--tmu-surface-overlay-soft);border:1px solid var(--tmu-border-soft-alpha);border-radius:var(--tmu-space-sm);overflow:hidden}',
            '.tmvu-aboutpro-feature-thumb{width:100%;aspect-ratio:16/9;object-fit:cover;display:block}',
            '.tmvu-aboutpro-feature-info{display:flex;flex-direction:column;gap:var(--tmu-space-xs);padding:var(--tmu-space-sm) var(--tmu-space-md) var(--tmu-space-md)}',
            '.tmvu-aboutpro-feature-name{font-size:var(--tmu-font-sm);font-weight:700;color:var(--tmu-text-strong)}',
            '.tmvu-aboutpro-feature-desc{font-size:var(--tmu-font-sm);color:var(--tmu-text-panel-label);line-height:1.5}',
            // quotes
            '.tmvu-aboutpro-quote{display:flex;gap:var(--tmu-space-md);align-items:flex-start;padding:var(--tmu-space-md);background:var(--tmu-surface-overlay-soft);border-radius:var(--tmu-space-sm)}',
            '.tmvu-aboutpro-quote-logo{flex-shrink:0;width:26px;height:26px;object-fit:contain}',
            '.tmvu-aboutpro-quote-text{font-size:var(--tmu-font-sm);color:var(--tmu-text-main);line-height:1.6;font-style:italic}',
            '.tmvu-aboutpro-quote-attr{font-size:var(--tmu-font-xs);color:var(--tmu-text-faint);margin-top:var(--tmu-space-xs);text-align:right}',
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

    const buildIntro = (col2) => {
        const p = col2.querySelector('.box_body p.std');
        if (!p) return null;
        const div = document.createElement('div');
        div.className = 'tmvu-aboutpro-intro';
        div.innerHTML = p.innerHTML;
        return div;
    };

    const parseThumbnail = (frame) => {
        if (!frame) return null;
        const style = frame.getAttribute('style') || '';
        const m = style.match(/background-image:\s*url\(['"]?([^'")\s]+)['"]?\)/);
        return m ? m[1].replace('_thumb', '') : null;
    };

    const buildSections = (col2) => {
        const sections = [];
        col2.querySelectorAll('.box_body h3').forEach(h3 => {
            const rawId = h3.getAttribute('id') || '';
            const contentId = rawId.replace(/_arrow$/, '');
            const title = clean(h3.textContent);
            const contentEl = contentId ? col2.querySelector(`#${contentId}`) : null;
            if (!contentEl) return;

            const items = [];
            contentEl.querySelectorAll('.border_bottom').forEach(itemEl => {
                const nameEl = itemEl.querySelector('strong.large');
                const descEl = itemEl.querySelector('p.small');
                if (!nameEl) return;
                items.push({
                    name: clean(nameEl.textContent),
                    desc: clean(descEl?.textContent || ''),
                    thumb: parseThumbnail(itemEl.querySelector('a.screenshot_frame')),
                });
            });
            sections.push({ title, items });
        });
        return sections;
    };

    const buildQuotes = (col3) => {
        const quotes = [];
        col3?.querySelectorAll('.round_corners.dark').forEach(q => {
            const floatDivs = q.querySelectorAll(':scope > .float_left');
            const logoImg = floatDivs[0]?.querySelector('.club_logo');
            const textDiv = floatDivs[1];
            if (!textDiv) return;

            const clone = textDiv.cloneNode(true);
            clone.querySelectorAll('img').forEach(img => img.remove());
            const attrEl = clone.querySelector('.subtle, .align_right');
            const attr = clean(attrEl?.textContent || '');
            if (attrEl) attrEl.remove();
            const text = clean(clone.textContent);

            quotes.push({ text, attr, logoSrc: logoImg?.src || '' });
        });
        return quotes;
    };

    const renderPage = () => {
        const nativeMain = document.querySelector('.main_center') || main;
        const col1 = nativeMain.querySelector('.column1');
        const col2 = nativeMain.querySelector('.column2_a');
        const col3 = nativeMain.querySelector('.column3_a');
        if (!col2) return;

        injectStyles();

        const navItems = parseNav(col1);
        const sections = buildSections(col2);
        const quotes = buildQuotes(col3);

        // Hero
        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-aboutpro-hero',
            slots: { kicker: 'TM PRO', title: 'About Pro' },
        });

        // Intro card
        const introWrap = document.createElement('section');
        const introContent = buildIntro(col2);
        const introRefs = TmSectionCard.mount(introWrap, {
            title: 'Overview',
            titleMode: 'body',
            cardVariant: 'flatpanel',
            bodyHtml: '',
        });
        if (introRefs?.body && introContent) {
            introRefs.body.appendChild(introContent);
        }

        // One card per feature section (TOOLS, DATA, STYLE, OTHER, ADDITIONAL PURCHASES)
        const sectionWraps = sections.map(({ title, items }) => {
            const wrap = document.createElement('section');
            const refs = TmSectionCard.mount(wrap, {
                title,
                titleMode: 'body',
                cardVariant: 'flatpanel',
                bodyHtml: '',
            });
            if (refs?.body) {
                const list = document.createElement('div');
                list.className = 'tmvu-aboutpro-features';
                items.forEach(({ name, desc, thumb }) => {
                    const item = document.createElement('div');
                    item.className = 'tmvu-aboutpro-feature';

                    if (thumb) {
                        const img = document.createElement('img');
                        img.src = thumb;
                        img.alt = '';
                        img.className = 'tmvu-aboutpro-feature-thumb';
                        item.appendChild(img);
                    }

                    const info = document.createElement('div');
                    info.className = 'tmvu-aboutpro-feature-info';

                    const nameEl = document.createElement('div');
                    nameEl.className = 'tmvu-aboutpro-feature-name';
                    nameEl.textContent = name;

                    const descEl = document.createElement('div');
                    descEl.className = 'tmvu-aboutpro-feature-desc';
                    descEl.textContent = desc;

                    info.appendChild(nameEl);
                    info.appendChild(descEl);
                    item.appendChild(info);
                    list.appendChild(item);
                });
                refs.body.appendChild(list);
            }
            return wrap;
        });

        // Quotes card
        let quotesWrap = null;
        if (quotes.length) {
            quotesWrap = document.createElement('section');
            const quotesRefs = TmSectionCard.mount(quotesWrap, {
                title: 'What Managers Say',
                titleMode: 'body',
                cardVariant: 'flatpanel',
                bodyHtml: '',
            });
            if (quotesRefs?.body) {
                const list = document.createElement('div');
                list.className = 'tmvu-aboutpro-quotes tmu-stack tmu-stack-density-tight';
                quotes.forEach(({ text, attr, logoSrc }) => {
                    const q = document.createElement('div');
                    q.className = 'tmvu-aboutpro-quote';

                    if (logoSrc) {
                        const img = document.createElement('img');
                        img.src = logoSrc;
                        img.alt = '';
                        img.className = 'tmvu-aboutpro-quote-logo';
                        q.appendChild(img);
                    }

                    const body = document.createElement('div');

                    const textDiv = document.createElement('div');
                    textDiv.className = 'tmvu-aboutpro-quote-text';
                    textDiv.textContent = text;

                    const attrDiv = document.createElement('div');
                    attrDiv.className = 'tmvu-aboutpro-quote-attr';
                    attrDiv.textContent = attr;

                    body.appendChild(textDiv);
                    body.appendChild(attrDiv);
                    q.appendChild(body);
                    list.appendChild(q);
                });
                quotesRefs.body.appendChild(list);
            }
        }

        const mainCol = document.createElement('div');
        mainCol.className = 'tmvu-aboutpro-main tmu-page-section-stack';
        mainCol.appendChild(heroWrap);
        mainCol.appendChild(introWrap);
        sectionWraps.forEach(w => mainCol.appendChild(w));
        if (quotesWrap) mainCol.appendChild(quotesWrap);

        main.classList.add('tmvu-aboutpro-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
        main.innerHTML = '';
        main.appendChild(mainCol);

        TmSideMenu.mount(main, { className: 'tmu-page-sidebar-stack', items: navItems, currentHref: window.location.pathname });
    };

    const waitForContent = () => {
        const check = () => document.querySelector('.column2_a .box_head');
        if (check()) { renderPage(); return; }
        const observer = new MutationObserver(() => {
            if (check()) { observer.disconnect(); renderPage(); }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    };

    waitForContent();
}
