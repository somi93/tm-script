import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmUI } from '../components/shared/tm-ui.js';

(function () {
    'use strict';

    if (!/^\/teamsters\//i.test(window.location.pathname)) return;

    const STYLE_ID = 'tmvu-teamsters-style';
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        const rules = [
            // 3-col layout: side-menu | main | teamster list
            '.tmvu-teamsters-page{display:grid!important;grid-template-columns:184px minmax(0,1fr) 260px;gap:16px;align-items:start}',
            '.tmvu-teamsters-main,.tmvu-teamsters-side{display:flex;flex-direction:column;gap:16px;min-width:0}',
            // hero: single column
            '.tmvu-teamsters-hero{grid-template-columns:minmax(0,1fr)!important}',
            // article body
            '.tmvu-teamsters-article{font-size:13px;line-height:1.75;color:var(--tmu-text-main)}',
            '.tmvu-teamsters-article p{margin:0 0 12px}',
            '.tmvu-teamsters-article p:last-child{margin-bottom:0}',
            '.tmvu-teamsters-article a{color:var(--tmu-accent);text-decoration:none}',
            '.tmvu-teamsters-article a:hover{text-decoration:underline}',
            '.tmvu-teamsters-article strong{color:var(--tmu-text-strong)}',
            '.tmvu-teamsters-section-head{font-size:11px;font-weight:800;color:var(--tmu-text-panel-label);margin:16px 0 6px;padding-bottom:4px;border-bottom:1px solid rgba(61,104,40,.3);text-transform:uppercase;letter-spacing:.06em}',
            '.tmvu-teamsters-section-head:first-child{margin-top:0}',
            '.tmvu-teamsters-article .align_center{text-align:center}',
            // teamster list (right column)
            '.tmvu-teamster-list{list-style:none;margin:0;padding:0}',
            '.tmvu-teamster-item{display:flex;align-items:center;gap:8px;padding:6px 14px;border-bottom:1px solid rgba(42,74,28,.35);font-size:12px;color:var(--tmu-text-main)}',
            '.tmvu-teamster-item:last-child{border-bottom:none}',
            '.tmvu-teamster-item:hover{background:rgba(42,74,28,.2)}',
            '.tmvu-teamster-item a{color:var(--tmu-text-main);text-decoration:none;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
            '.tmvu-teamster-item a:hover{color:var(--tmu-text-strong)}',
            '.tmvu-teamster-flag{flex-shrink:0;width:18px;height:13px;display:inline-block;vertical-align:middle}',
            // tab panels
            '.tmvu-teamster-tab-panels>div{display:none}',
            '.tmvu-teamster-tab-panels>div.is-active{display:block}',
            // 2-col layout for apply page (no right panel)
            '.tmvu-teamsters-apply-page{display:grid!important;grid-template-columns:184px minmax(0,1fr);gap:16px;align-items:start}',
            // apply form
            '.tmvu-apply-form{display:flex;flex-direction:column;gap:14px;max-width:520px}',
            '.tmvu-apply-row{display:flex;flex-direction:column;gap:4px}',
            '.tmvu-apply-label{font-size:11px;font-weight:700;color:var(--tmu-text-panel-label);text-transform:uppercase;letter-spacing:.04em}',
            '.tmvu-apply-label .req{color:var(--tmu-accent);margin-right:2px}',
            '.tmvu-apply-row .tmu-input{width:100%}',
            '.tmvu-apply-row select.tmu-input{width:100%}',
            '.tmvu-apply-row textarea.tmu-input{width:100%;resize:vertical;min-height:100px;line-height:1.6}',
            '.tmvu-apply-row.is-hidden{display:none}',
            '.tmvu-apply-actions{padding-top:4px}',
            '.tmvu-apply-intro{font-size:13px;line-height:1.65;color:var(--tmu-text-main);margin-bottom:20px;}',
            '.tmvu-apply-intro p{margin:0 0 10px}',
            '.tmvu-apply-intro ul,.tmvu-apply-intro ol{padding-left:20px;margin:0 0 10px}',
            '.tmvu-apply-intro li{margin-bottom:4px}',
            '.tmvu-apply-intro hr{border:none;border-top:1px solid #3a5030;margin:14px 0}',
            '.tmvu-apply-intro a{color:var(--tmu-accent)}',
        ];
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = rules.join('');
        document.head.appendChild(style);
    };

    // ── parse nav links ────────────────────────────────────────────────────────

    const parseNav = (col1) =>
        Array.from(col1.querySelectorAll('.content_menu a')).map(a => ({
            href: a.getAttribute('href') || '#',
            label: clean(a.textContent),
        }));

    // ── parse article (alternating h3 + .std div pairs) ──────────────────────

    const parseArticle = (col2) => {
        const bodyEl = col2.querySelector('.box_body');
        if (!bodyEl) return '';
        const clone = bodyEl.cloneNode(true);
        clone.querySelector('.box_shadow')?.remove();
        // Wrap h3 headings in our styled class
        clone.querySelectorAll('h3').forEach(h3 => {
            h3.className = 'tmvu-teamsters-section-head';
        });
        // Strip outer .std wrappers, keep their children inline
        clone.querySelectorAll('.std').forEach(div => {
            const frag = document.createDocumentFragment();
            while (div.firstChild) frag.appendChild(div.firstChild);
            div.replaceWith(frag);
        });
        // HTML comments left by TM (e.g. <!-- apply link -->) — harmless, leave
        return clone.innerHTML;
    };

    // ── parse tab panels ──────────────────────────────────────────────────────

    const parseTabs = (col3) => {
        const container = col3.querySelector('.tab_container');
        if (!container) return [];
        const tabEls = col3.querySelectorAll('.tabs > div[set_active]');
        return Array.from(container.querySelectorAll(':scope > div[id]')).map((panel, i) => {
            const label = clean(tabEls[i]?.textContent || panel.querySelector('h3')?.textContent || panel.id);
            const items = Array.from(panel.querySelectorAll('li')).map(li => {
                const flagIb = li.querySelector('ib[class*="flag-img-"]');
                const flagClass = flagIb?.className || '';
                const clubA = li.querySelector('a[href*="/club/"]');
                return {
                    flagClass,
                    clubHref: clubA?.getAttribute('href') || '#',
                    clubName: clean(clubA?.textContent || ''),
                };
            }).filter(it => it.clubName);
            return { key: panel.id, label, items };
        });
    };

    // ── render ────────────────────────────────────────────────────────────────

    const renderPage = () => {
        const main = document.querySelector('.tmvu-main, .main_center');
        if (!main) return;
        const col1 = main.querySelector('.column1');
        const col2 = main.querySelector('.column2_a');
        const col3 = main.querySelector('.column3_a');
        if (!col2) return;

        const snap1 = col1?.cloneNode(true);
        const snap2 = col2.cloneNode(true);
        const snap3 = col3?.cloneNode(true);

        const title = clean(snap2.querySelector('.box_head h2.std, .box_head h1.std')?.textContent || 'Teamsters');
        const navItems = snap1 ? parseNav(snap1) : [];
        const articleHtml = parseArticle(snap2);
        const tabDefs = snap3 ? parseTabs(snap3) : [];

        injectStyles();

        // Hero
        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-teamsters-hero',
            slots: { kicker: 'TM Team', title },
        });

        // Article
        const articleWrap = document.createElement('section');
        TmSectionCard.mount(articleWrap, {
            flush: true,
            bodyClass: 'tmvu-teamsters-article',
            bodyHtml: articleHtml,
        });

        // Main column
        const mainCol = document.createElement('section');
        mainCol.className = 'tmvu-teamsters-main';
        mainCol.appendChild(heroWrap);
        mainCol.appendChild(articleWrap);

        // Right column: tabbed teamster lists
        const sideCol = document.createElement('aside');
        sideCol.className = 'tmvu-teamsters-side';

        if (tabDefs.length) {
            const firstKey = tabDefs[0].key;

            const tabsBar = TmUI.tabs({
                items: tabDefs.map(t => ({ key: t.key, label: t.label })),
                active: firstKey,
                color: 'primary',
                stretch: true,
            });

            const panelsEl = document.createElement('div');
            panelsEl.className = 'tmvu-teamster-tab-panels';

            tabDefs.forEach((t, i) => {
                const panelEl = document.createElement('div');
                panelEl.dataset.tabPanel = t.key;
                if (i === 0) panelEl.classList.add('is-active');
                const listHtml = t.items.map(it => `
                    <li class="tmvu-teamster-item">
                        <ib class="${it.flagClass} tmvu-teamster-flag"></ib>
                        <a href="${it.clubHref}">${it.clubName}</a>
                    </li>
                `).join('');
                panelEl.innerHTML = `<ul class="tmvu-teamster-list">${listHtml}</ul>`;
                panelsEl.appendChild(panelEl);
            });

            tabsBar.addEventListener('click', (e) => {
                const btn = e.target.closest('.tmu-tab[data-tab]');
                if (!btn) return;
                panelsEl.querySelectorAll('[data-tab-panel]').forEach(p => {
                    p.classList.toggle('is-active', p.dataset.tabPanel === btn.dataset.tab);
                });
            });

            const listWrap = document.createElement('section');
            TmSectionCard.mount(listWrap, {
                flush: true,
                bodyHtml: tabsBar.outerHTML + '<div class="tmvu-teamster-tab-panels"></div>',
            });

            // Re-attach live tabsBar + panelsEl after SectionCard renders
            const liveBody = listWrap.querySelector('.tmvu-teamster-tab-panels');
            if (liveBody) {
                liveBody.replaceWith(panelsEl);
                // Replace the static tabsBar outerHTML with the live node
                const staticTabsBar = listWrap.querySelector('.tmu-tabs');
                staticTabsBar?.replaceWith(tabsBar);
            }

            sideCol.appendChild(listWrap);
        }

        // Assemble page
        main.classList.add('tmvu-teamsters-page');
        main.innerHTML = '';
        main.appendChild(mainCol);
        main.appendChild(sideCol);
        TmSideMenu.mount(main, { items: navItems, currentHref: window.location.pathname.replace(/\/$/, '') + '/' });
    };

    // ── render apply form ─────────────────────────────────────────────────────

    const renderApply = (main, liveForm, navItems) => {
        const cloneSelect = (liveSel, id, name, tabIdx) => {
            const sel = document.createElement('select');
            sel.id = id; sel.name = name; sel.tabIndex = tabIdx;
            sel.className = 'tmu-input tmu-input-tone-overlay tmu-input-density-regular';
            Array.from(liveSel?.options || []).forEach(o =>
                sel.appendChild(new Option(o.text, o.value, false, o.selected)));
            return sel;
        };

        const selFor      = cloneSelect(liveForm.querySelector('#apply_for'),  'apply_for', 'apply_for', 1);
        const selCountry  = cloneSelect(liveForm.querySelector('#country'),    'country',   'country',   2);
        const selLanguage = cloneSelect(liveForm.querySelector('#language'),   'language',  'language',  3);
        const selAge      = cloneSelect(liveForm.querySelector('#age'),        'age',       'age',       5);

        const inputName = TmUI.input({ id: 'name', name: 'name', placeholder: 'John', tone: 'overlay', size: 'full', tabindex: 4 });

        const selGender = document.createElement('select');
        selGender.id = 'gender'; selGender.name = 'gender'; selGender.tabIndex = 6;
        selGender.className = 'tmu-input tmu-input-tone-overlay tmu-input-density-regular';
        [['', 'Select..'], ['male', 'Male'], ['female', 'Female']].forEach(([v, t]) =>
            selGender.appendChild(new Option(t, v)));

        const textarea = document.createElement('textarea');
        textarea.id = 'motivation'; textarea.name = 'motivation'; textarea.tabIndex = 7;
        textarea.placeholder = 'I wish to be a teamster in TM because...';
        textarea.className = 'tmu-input tmu-input-tone-overlay tmu-input-density-regular';

        const submitBtn = TmUI.button({ label: 'Send Application', color: 'primary', size: 'sm', shape: 'md', type: 'submit' });

        const makeRow = (labelText, el, required = false) => {
            const div = document.createElement('div');
            div.className = 'tmvu-apply-row';
            const lbl = document.createElement('label');
            lbl.className = 'tmvu-apply-label';
            if (el.id) lbl.htmlFor = el.id;
            if (required) {
                const req = document.createElement('span');
                req.className = 'req'; req.textContent = '* ';
                lbl.appendChild(req);
            }
            lbl.appendChild(document.createTextNode(labelText));
            div.appendChild(lbl);
            div.appendChild(el);
            return div;
        };

        const rowCountry  = makeRow('Country', selCountry, true);
        const rowLanguage = makeRow('Language', selLanguage, true);
        rowCountry.classList.add('is-hidden');
        rowLanguage.classList.add('is-hidden');

        selFor.addEventListener('change', () => {
            const v = selFor.value;
            rowCountry.classList.toggle('is-hidden', v !== 'lt');
            rowLanguage.classList.toggle('is-hidden', v !== 'lt');
        });

        const form = document.createElement('form');
        form.id = 'teamster_apply_ui';
        form.className = 'tmvu-apply-form';
        form.appendChild(makeRow('Apply For', selFor, true));
        form.appendChild(rowCountry);
        form.appendChild(rowLanguage);
        form.appendChild(makeRow('Name', inputName));
        form.appendChild(makeRow('Age', selAge));
        form.appendChild(makeRow('Gender', selGender));
        form.appendChild(makeRow('Motivation', textarea, true));
        const actions = document.createElement('div');
        actions.className = 'tmvu-apply-actions';
        actions.appendChild(submitBtn);
        form.appendChild(actions);

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            ['apply_for', 'country', 'language', 'name', 'age', 'gender', 'motivation'].forEach(n => {
                const live = liveForm.elements[n];
                const our  = form.elements[n];
                if (live && our) live.value = our.value;
            });
            liveForm.submit();
        });

        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-teamsters-hero',
            slots: { kicker: 'TM Team', title: 'Apply' },
        });

        // extract intro text (everything before the <form> in .std)
        const introDiv = document.createElement('div');
        introDiv.className = 'tmvu-apply-intro';
        const liveStd = liveForm.closest('.std') || liveForm.parentElement;
        if (liveStd) {
            for (const node of Array.from(liveStd.childNodes)) {
                if (node === liveForm) break;
                introDiv.appendChild(node.cloneNode(true));
            }
        }

        const cardWrap = document.createElement('section');
        const cardRefs = TmSectionCard.mount(cardWrap, {
            title: 'Application Form',
            titleMode: 'body',
            flush: true,
            bodyHtml: '',
        });
        cardRefs?.body?.appendChild(introDiv);
        cardRefs?.body?.appendChild(form);

        const mainCol = document.createElement('section');
        mainCol.className = 'tmvu-teamsters-main';
        mainCol.appendChild(heroWrap);
        mainCol.appendChild(cardWrap);

        main.classList.add('tmvu-teamsters-apply-page');
        main.innerHTML = '';
        main.appendChild(mainCol);
        TmSideMenu.mount(main, { items: navItems, currentHref: '/teamsters/apply/' });
    };

    const waitForContent = () => {
        const isApply = /^\/teamsters\/apply\//i.test(window.location.pathname);
        const check = () => isApply
            ? document.querySelector('#teamster_apply')
            : document.querySelector('.column2_a .box_head');

        const run = () => {
            const main = document.querySelector('.tmvu-main, .main_center');
            if (!main) return;
            injectStyles();
            if (isApply) {
                const liveForm = document.querySelector('#teamster_apply');
                const col1 = main.querySelector('.column1');
                const navItems = col1 ? parseNav(col1.cloneNode(true)) : [];
                renderApply(main, liveForm, navItems);
            } else {
                renderPage();
            }
        };

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
