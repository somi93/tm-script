import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';

(function () {
    'use strict';

    if (!/^\/about-tm\//i.test(window.location.pathname)) return;

    const STYLE_ID = 'tmvu-abouttm-style';
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();
        const rules = [
            // page wrapper: single centered column
            '.tmvu-abouttm-page{max-width:860px;width:100%;margin:0 auto}',
            // hero: single column (no side slot)
            '.tmvu-abouttm-hero{grid-template-columns:minmax(0,1fr)!important}',
            // article body
            '.tmvu-abouttm-article{font-size:13px;line-height:1.8;color:var(--tmu-text-main)}',
            '.tmvu-abouttm-article p{margin:0 0 14px}',
            '.tmvu-abouttm-article p:last-child{margin-bottom:0}',
            '.tmvu-abouttm-article a{color:var(--tmu-accent);text-decoration:none}',
            '.tmvu-abouttm-article a:hover{text-decoration:underline}',
            '.tmvu-abouttm-article strong{color:var(--tmu-text-strong)}',
            // float images
            '.tmvu-abouttm-article .img_float_left{float:left;margin:2px 18px 10px 0;max-width:210px}',
            '.tmvu-abouttm-article .img_float_right{float:right;margin:2px 0 10px 18px;max-width:210px}',
            '.tmvu-abouttm-article .img_float_left img,.tmvu-abouttm-article .img_float_right img{width:100%;border-radius:6px;border:1px solid var(--tmu-border-input-overlay)!important;display:block}',
            '.tmvu-abouttm-article .img_text{font-size:11px;color:var(--tmu-text-faint);font-style:italic;margin-top:5px;line-height:1.4;text-align:center}',
            // clearfix so card wraps floated images
            '.tmvu-abouttm-clearfix::after{content:"";display:table;clear:both}',
        ];
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = rules.join('');
        document.head.appendChild(style);
    };

    const transformArticle = (stdDiv) => {
        if (!stdDiv) return '';
        const clone = stdDiv.cloneNode(true);
        clone.querySelectorAll('a[id]:not([href])').forEach(a => a.remove());
        return clone.innerHTML;
    };

    const renderPage = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;
        const col2 = main.querySelector('.column2_b');
        if (!col2) return;

        const snap = col2.cloneNode(true);
        const title = clean(
            snap.querySelector('.box_head h1.std, .box_head h2.std')?.textContent || 'About TM'
        );
        const articleHtml = transformArticle(snap.querySelector('.box_body .std'));

        injectStyles();

        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-abouttm-hero',
            slots: { kicker: 'About TM', title },
        });

        const contentWrap = document.createElement('section');
        TmSectionCard.mount(contentWrap, {
            flush: true,
            bodyClass: 'tmvu-abouttm-article tmvu-abouttm-clearfix',
            bodyHtml: articleHtml,
        });

        const page = document.createElement('div');
        page.className = 'tmvu-abouttm-page tmu-stack tmu-stack-density-roomy';
        page.appendChild(heroWrap);
        page.appendChild(contentWrap);

        main.innerHTML = '';
        main.appendChild(page);
    };

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
