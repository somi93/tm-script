import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';

(function () {
    'use strict';

    if (!/^\/user-guide\//i.test(window.location.pathname)) return;

    const STYLE_ID = 'tmvu-ug-style';

    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

    // ── styles ──────────────────────────────────────────────────────────────

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        const rules = [
            // page layout
            '.tmvu-ug-page{display:grid!important;grid-template-columns:184px minmax(0,1fr);gap:16px;align-items:start}',
            '.tmvu-ug-main{display:flex;flex-direction:column;gap:16px;min-width:0}',
            // hero: single column (no side slot used)
            '.tmvu-ug-hero-card{grid-template-columns:minmax(0,1fr)!important}',
            // article body
            '.tmvu-ug-article{font-size:13px;line-height:1.75;color:var(--tmu-text-main)}',
            '.tmvu-ug-article .paragraph{margin-bottom:14px}',
            '.tmvu-ug-article .paragraph:last-child{margin-bottom:0}',
            '.tmvu-ug-section{font-size:12px;font-weight:800;color:var(--tmu-text-panel-label);margin:20px 0 8px;padding:5px;border-bottom:1px solid rgba(61,104,40,.3);text-transform:uppercase;letter-spacing:.06em}',
            '.tmvu-ug-article ul,.tmvu-ug-article ol{padding-left:20px;margin-bottom:12px}',
            '.tmvu-ug-article li{margin-bottom:3px}',
            '.tmvu-ug-article strong{color:var(--tmu-text-strong)}',
            '.tmvu-ug-article a{color:var(--tmu-accent);text-decoration:none}',
            '.tmvu-ug-article a:hover{text-decoration:underline}',
            // schedule table
            '.tmvu-ug-article table.userguide{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:12px}',
            '.tmvu-ug-article table.userguide th{background:rgba(61,104,40,.25);color:var(--tmu-text-panel-label);padding:7px 10px;text-align:left;font-weight:700;font-size:11px;letter-spacing:.04em;border-bottom:1px solid rgba(61,104,40,.35)}',
            '.tmvu-ug-article table.userguide td{padding:6px 10px;border-bottom:1px solid rgba(61,104,40,.15);vertical-align:top}',
            '.tmvu-ug-article table.userguide tr:last-child td{border-bottom:none}',
            '.tmvu-ug-article table.userguide tbody tr:hover td{background:rgba(42,74,28,.2)}',
            // TM event colour spans (keep TM original class names)
            '.tmvu-ug-article .moneystack{color:#f0d080;font-weight:600}',
            '.tmvu-ug-article .training{color:#80c8f0;font-weight:600}',
            '.tmvu-ug-article .gameday{color:var(--tmu-accent);font-weight:600}',
            '.tmvu-ug-article .players{color:#f0a090;font-weight:600}',
            '.tmvu-ug-article .text_orange{color:#f0a050;font-weight:600}',
        ];
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = rules.join('');
        document.head.appendChild(style);
    };

    // ── parse left sidebar nav ───────────────────────────────────────────────

    const parseSections = (col1) => {
        const sections = [];
        // Each nav group is a [id$="_section"] span (not the _arrow ones)
        col1.querySelectorAll('[id$="_section"]:not([id*="_arrow"])').forEach(span => {
            // Find group label: prefer <h3 id="X_arrow">, else previous H3 sibling
            const arrowEl = col1.querySelector('#' + span.id + '_arrow');
            let label = arrowEl ? clean(arrowEl.textContent) : '';
            if (!label) {
                let el = span.previousElementSibling;
                while (el) {
                    if (el.tagName === 'H3') { label = clean(el.textContent); break; }
                    el = el.previousElementSibling;
                }
            }
            // Direct <a> children only (nested sections handle their own links)
            const links = Array.from(span.querySelectorAll(':scope > a')).map(a => ({
                href: a.getAttribute('href') || '#',
                label: clean(a.textContent),
                active: a.classList.contains('selected'),
            }));
            if (!links.length) return;
            sections.push({ label, links });
        });
        return sections;
    };

    // ── transform article content ────────────────────────────────────────────

    const transformArticle = (stdDiv) => {
        if (!stdDiv) return '';
        const clone = stdDiv.cloneNode(true);
        // Remove bare id-anchor tags (<a id="1"></a> used as jump targets)
        clone.querySelectorAll('a[id]:not([href])').forEach(a => a.remove());
        // Remove section_mark images embedded in h3 headings
        clone.querySelectorAll('img.section_mark').forEach(img => img.remove());
        // Restyle section headings
        clone.querySelectorAll('h3.section').forEach(h3 => {
            h3.className = 'tmvu-ug-section';
        });
        return clone.innerHTML;
    };

    // ── render ───────────────────────────────────────────────────────────────

    const renderPage = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;
        const col1 = main.querySelector('.column1');
        const col2 = main.querySelector('.column2_b');
        if (!col1 || !col2) return;

        // Snapshot before we clear the DOM
        const snap1 = col1.cloneNode(true);
        const snap2 = col2.cloneNode(true);

        const title = clean(
            snap2.querySelector('.box_head h1.std')?.textContent ||
            snap2.querySelector('.box_head h2.std')?.textContent ||
            'User Guide'
        );
        const sections = parseSections(snap1);
        const articleHtml = transformArticle(snap2.querySelector('.box_body .std'));

        // Find active section label for kicker
        let kicker = 'User Guide';
        for (const s of sections) {
            if (s.links.some(l => l.active)) { kicker = s.label || kicker; break; }
        }

        // Build flat items for TmSideMenu — subtitle heading before each section group
        const menuItems = [];
        sections.forEach((s, i) => {
            if (i > 0) menuItems.push({ type: 'separator' });
            if (s.label) menuItems.push({ type: 'subtitle', label: s.label });
            s.links.forEach(l => menuItems.push({ href: l.href, label: l.label }));
        });

        injectStyles();

        // Hero
        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-ug-hero-card',
            slots: { kicker, title },
        });

        // Content card
        const contentWrap = document.createElement('section');
        TmSectionCard.mount(contentWrap, {
            flush: true,
            bodyClass: 'tmvu-ug-article',
            bodyHtml: articleHtml,
        });

        // Main column
        const mainCol = document.createElement('div');
        mainCol.className = 'tmvu-ug-main';
        mainCol.appendChild(heroWrap);
        mainCol.appendChild(contentWrap);

        // Replace page content then let TmSideMenu prepend itself
        main.classList.add('tmvu-ug-page');
        main.innerHTML = '';
        main.appendChild(mainCol);
        TmSideMenu.mount(main, { items: menuItems, currentHref: window.location.pathname });
    };

    // ── wait for DOM ─────────────────────────────────────────────────────────

    const waitForContent = () => {
        const check = () => document.querySelector('.column2_b .box_head h1.std, .column2_b .box_head h2.std');
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
