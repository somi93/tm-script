import { TmHeroCard }              from '../components/shared/tm-hero-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard }            from '../components/shared/tm-section-card.js';
import { TmSideMenu }               from '../components/shared/tm-side-menu.js';
import { TmUI }                     from '../components/shared/tm-ui.js';

export function initAccountPage(main) {
    if (!main || !main.isConnected) return;

    const STYLE_ID = 'tmvu-account-style';
    const clean = (v) => String(v || '').replace(/\s+/g, ' ').trim();

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();
        const rules = [
            '.tmvu-account-hero{grid-template-columns:minmax(0,1fr)!important}',
            '.tmvu-account-form-stack{display:flex;flex-direction:column;gap:var(--tmu-space-lg);padding:var(--tmu-space-lg)}',
            '.tmvu-account-form-row{display:flex;flex-direction:column;gap:var(--tmu-space-xs)}',
            '.tmvu-account-label{font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-panel-label);text-transform:uppercase;letter-spacing:.04em}',
            '.tmvu-account-form-row .tmu-input{width:100%;max-width:360px}',
            '.tmvu-account-form-row select.tmu-input{width:100%;max-width:360px}',
            '.tmvu-account-form-row textarea.tmu-input{width:100%;max-width:360px;resize:vertical;min-height:60px;line-height:1.6;padding:var(--tmu-space-sm)}',
            '.tmvu-account-actions{padding-top:var(--tmu-space-xs);display:flex;gap:var(--tmu-space-sm);flex-wrap:wrap}',
            '.tmvu-account-note{font-size:var(--tmu-font-xs);color:var(--tmu-text-muted);line-height:1.7;margin:0}',
            '.tmvu-account-checks{display:flex;flex-direction:column;gap:var(--tmu-space-sm)}',
            // club-info
            '.tmvu-account-club-name{font-size:var(--tmu-font-lg);font-weight:700;color:var(--tmu-text-strong);margin:0}',
            '.tmvu-account-logo-wrap{display:flex;justify-content:center;padding:var(--tmu-space-md) 0}',
            '.tmvu-account-logo-wrap .club_logo{max-width:140px;height:auto}',
            '.tmvu-account-kit-wrap{display:flex;gap:var(--tmu-space-xl);flex-wrap:wrap;align-items:flex-start}',
            '.tmvu-account-kit-wrap .kit_shirt,.tmvu-account-kit-wrap .kit_shorts,.tmvu-account-kit-wrap .kit_socks{cursor:pointer;transition:opacity .15s}',
            '.tmvu-account-kit-wrap .kit_shirt:hover,.tmvu-account-kit-wrap .kit_shorts:hover,.tmvu-account-kit-wrap .kit_socks:hover{opacity:.75}',
            '.tmvu-account-fav-list{display:flex;flex-direction:column;gap:0}',
            '.tmvu-account-fav-item{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:var(--tmu-space-sm);padding:var(--tmu-space-xs) 0;border-bottom:1px solid var(--tmu-border-soft-alpha)}',
            '.tmvu-account-fav-item:last-child{border-bottom:none}',
            '.tmvu-account-fav-name{font-size:var(--tmu-font-sm);color:var(--tmu-text-main);text-decoration:none;display:flex;align-items:center;gap:4px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
            '.tmvu-account-fav-stat{font-size:var(--tmu-font-xs);color:var(--tmu-text-muted);white-space:nowrap}',
            '.tmvu-account-desc-table{display:flex;flex-direction:column}',
            '.tmvu-account-desc-row{display:flex;gap:var(--tmu-space-md);padding:var(--tmu-space-sm) 0;border-bottom:1px solid var(--tmu-border-soft-alpha);align-items:baseline}',
            '.tmvu-account-desc-row:last-child{border-bottom:none}',
            '.tmvu-account-desc-label{font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-panel-label);width:120px;flex-shrink:0;text-transform:uppercase;letter-spacing:.04em}',
            '.tmvu-account-desc-value{font-size:var(--tmu-font-sm);color:var(--tmu-text-main)}',
            '.tmvu-account-stadium-host{display:flex;flex-direction:column;align-items:center;gap:var(--tmu-space-md);width:100%}',
            // teams
            '.tmvu-account-team-list{display:flex;flex-direction:column;gap:0}',
            '.tmvu-account-team-item{display:grid;grid-template-columns:1fr auto auto auto;align-items:center;gap:var(--tmu-space-md);padding:var(--tmu-space-sm) 0;border-bottom:1px solid var(--tmu-border-soft-alpha)}',
            '.tmvu-account-team-item:last-child{border-bottom:none}',
            '.tmvu-account-team-name{font-size:var(--tmu-font-sm);font-weight:600;color:var(--tmu-text-main);text-decoration:none}',
            '.tmvu-account-team-expiry{font-size:var(--tmu-font-xs);color:var(--tmu-text-muted);white-space:nowrap}',
            '.tmvu-account-team-badge{font-size:var(--tmu-font-xs);font-weight:700;color:var(--tmu-text-panel-label);text-transform:uppercase;letter-spacing:.04em;white-space:nowrap}',
            // reserve-teams
            '.tmvu-account-reserve-list{display:flex;flex-direction:column;gap:0}',
            '.tmvu-account-reserve-item{display:flex;align-items:center;gap:var(--tmu-space-sm);flex-wrap:wrap;padding:var(--tmu-space-sm) 0;border-bottom:1px solid var(--tmu-border-soft-alpha)}',
            '.tmvu-account-reserve-item:last-child{border-bottom:none}',
            '.tmvu-account-reserve-club{font-size:var(--tmu-font-sm);font-weight:600;color:var(--tmu-text-main);text-decoration:none}',
            '.tmvu-account-reserve-arrow{font-size:var(--tmu-font-xs);color:var(--tmu-text-muted);flex-shrink:0}',
            '.tmvu-account-reserve-expiry{font-size:var(--tmu-font-xs);color:var(--tmu-text-muted);margin-left:auto;white-space:nowrap}',
            '.tmvu-account-reserve-actions{display:flex;gap:var(--tmu-space-xs);align-items:center}',
        ];
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = rules.join('');
        document.head.appendChild(style);
    };

    const makeSelect = (options, id) => {
        const sel = document.createElement('select');
        if (id) sel.id = id;
        sel.className = 'tmu-input tmu-input-tone-overlay tmu-input-density-regular';
        options.forEach(({ value, text, selected }) => {
            const opt = new Option(text, value, false, selected);
            sel.appendChild(opt);
        });
        return sel;
    };

    const makeRow = (labelText, inputEl) => {
        const row = document.createElement('div');
        row.className = 'tmvu-account-form-row';
        if (labelText) {
            const lbl = document.createElement('label');
            lbl.className = 'tmvu-account-label';
            if (inputEl && inputEl.id) lbl.htmlFor = inputEl.id;
            lbl.textContent = labelText;
            row.appendChild(lbl);
        }
        if (inputEl) row.appendChild(inputEl);
        return row;
    };

    const makeNote = (text) => {
        const p = document.createElement('p');
        p.className = 'tmvu-account-note';
        p.textContent = text;
        return p;
    };

    const makeActions = (...btns) => {
        const div = document.createElement('div');
        div.className = 'tmvu-account-actions';
        btns.forEach(b => div.appendChild(b));
        return div;
    };

    const makeCard = (title, buildFn) => {
        const wrap = document.createElement('section');
        const refs = TmSectionCard.mount(wrap, {
            title,
            titleMode: 'body',
            cardVariant: 'flatpanel',
            bodyHtml: '',
        });
        const body = document.createElement('div');
        body.className = 'tmvu-account-form-stack';
        buildFn(body);
        if (refs?.body) refs.body.appendChild(body);
        return wrap;
    };

    const renderDonateProPage = () => {
        const nativeMain = document.querySelector('.main_center') || document.body;
        const col1 = nativeMain.querySelector('.column1');
        const col2 = nativeMain.querySelector('.column2_a, .column2_b, .column2') || nativeMain;
        const col3 = nativeMain.querySelector('.column3_a');

        const navItems = col1
            ? Array.from(col1.querySelectorAll('.content_menu a')).map(a => ({
                href: a.getAttribute('href') || '#',
                label: clean(a.textContent),
            }))
            : [];

        // Transplant TM's actual elements so TM's JS keeps finding them by ID
        const daysInput      = col2.querySelector('#donate_days');
        const clubInput      = col2.querySelector('#donate_club');
        const clubNameSpan   = col2.querySelector('#donate_club_name');
        const calcDiv        = col2.querySelector('#calculation');
        const hiddenClubHref = col2.querySelector('#donate_club_href');
        const hiddenSettings = col2.querySelector('#donate_club_settings');
        const hiddenDaysLeft = col2.querySelector('#donate_days_left');

        // Info content from column3_a
        const calcInfoEl = col3?.querySelector('.box_body .std');

        injectStyles();

        // Hero
        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-account-hero',
            slots: { kicker: 'Account', title: 'Donate Pro' },
        });

        // Donate card
        const donateBtn = TmUI.button({ label: 'Donate', color: 'primary', size: 'sm', shape: 'md' });
        donateBtn.id = 'donate_button';
        donateBtn.onclick = () => { if (typeof pop_donate === 'function') pop_donate(); };

        const donateCard = makeCard('Donate Pro', body => {
            if (daysInput) {
                daysInput.className = 'tmu-input tmu-input-tone-overlay tmu-input-density-regular';
                daysInput.style.cssText = 'width:100%;max-width:120px';
                body.appendChild(makeRow('Days to Donate', daysInput));
            }

            if (clubInput) {
                clubInput.className = 'tmu-input tmu-input-tone-overlay tmu-input-density-regular';
                clubInput.style.cssText = 'width:100%;max-width:360px';
                const clubRow = makeRow('To Club', clubInput);
                if (clubNameSpan) {
                    clubNameSpan.style.cssText = 'font-size:var(--tmu-font-sm);color:var(--tmu-text-main);font-weight:600;margin-top:4px;display:block';
                    clubRow.appendChild(clubNameSpan);
                }
                body.appendChild(clubRow);
            }

            if (calcDiv) {
                calcDiv.style.cssText = 'font-size:var(--tmu-font-sm);color:var(--tmu-text-main);line-height:1.8';
                body.appendChild(calcDiv);
            }

            // Hidden inputs must remain in DOM for TM's JS to read
            [hiddenClubHref, hiddenSettings, hiddenDaysLeft].forEach(el => {
                if (el) body.appendChild(el);
            });

            body.appendChild(makeActions(donateBtn));
        });

        // How it works card (from column3_a)
        let infoCard = null;
        if (calcInfoEl) {
            infoCard = makeCard('How it Works', body => {
                const content = calcInfoEl.cloneNode(true);
                content.style.cssText = 'font-size:var(--tmu-font-sm);color:var(--tmu-text-main);line-height:1.8';
                body.appendChild(content);
            });
        }

        // Assemble
        const mainCol = document.createElement('div');
        mainCol.className = 'tmu-page-section-stack';
        [heroWrap, donateCard, ...(infoCard ? [infoCard] : [])].forEach(el => mainCol.appendChild(el));

        main.classList.add('tmu-page-layout-2col', 'tmu-page-density-regular');
        main.innerHTML = '';
        main.appendChild(mainCol);

        TmSideMenu.mount(main, {
            className: 'tmu-page-sidebar-stack',
            items: navItems,
            currentHref: window.location.pathname.replace(/\/?$/, '/'),
        });
    };

    const renderReserveTeamsPage = () => {
        const nativeMain = document.querySelector('.main_center') || document.body;
        const col1 = nativeMain.querySelector('.column1');
        const col2 = nativeMain.querySelector('.column2_a, .column2_b, .column2') || nativeMain;

        const navItems = col1
            ? Array.from(col1.querySelectorAll('.content_menu a')).map(a => ({
                href: a.getAttribute('href') || '#',
                label: clean(a.textContent),
            }))
            : [];

        // Parse reserve rows (rows with <td> containing a club_link)
        const reserveRows = Array.from(col2.querySelectorAll('tr')).filter(tr =>
            tr.querySelector('td') && tr.querySelector('[club_link]')
        );

        injectStyles();

        // Hero
        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-account-hero',
            slots: { kicker: 'Account', title: 'Reserve Team' },
        });

        // Reserve Teams card
        const reserveCard = makeCard('Reserve Team', body => {
            const list = document.createElement('div');
            list.className = 'tmvu-account-reserve-list';

            reserveRows.forEach(tr => {
                const cells = tr.querySelectorAll('td');
                if (cells.length < 2) return;

                const mainClubLink    = cells[0]?.querySelector('[club_link]');
                const mainClubFlag    = cells[0]?.querySelector('[class*="flag-img"]');
                const reserveClubLink = cells[1]?.querySelector('[club_link]');
                const renameSpan      = cells[1]?.querySelector('[onclick*="pop_reserves_name"]');
                const deleteSpan      = cells[1]?.querySelector('[onclick*="delete_reserve_pop"]');
                const renewLink       = cells[2]?.querySelector('[href*="reserve_renew_pop"]');

                // Expiry: text nodes only (skip button text)
                const expiryText = cells[2]
                    ? Array.from(cells[2].childNodes)
                        .filter(n => n.nodeType === 3)
                        .map(n => n.textContent.trim())
                        .filter(Boolean)
                        .join(' ')
                    : '';

                // Parse reserve club_id from rename onclick
                const renameMatch = (renameSpan?.getAttribute('onclick') || '').match(/pop_reserves_name\((\d+)\)/);
                const reserveClubId = renameMatch ? parseInt(renameMatch[1]) : 0;

                const item = document.createElement('div');
                item.className = 'tmvu-account-reserve-item';

                // Main club name + flag
                if (mainClubLink) {
                    const a = document.createElement('a');
                    a.className = 'tmvu-account-reserve-club';
                    a.href = mainClubLink.getAttribute('href') || '#';
                    a.textContent = clean(mainClubLink.textContent);
                    item.appendChild(a);
                }
                if (mainClubFlag) item.appendChild(mainClubFlag.cloneNode(true));

                if (reserveClubLink) {
                    const arrow = document.createElement('span');
                    arrow.className = 'tmvu-account-reserve-arrow';
                    arrow.textContent = '→';
                    item.appendChild(arrow);

                    const rLink = document.createElement('a');
                    rLink.className = 'tmvu-account-reserve-club';
                    rLink.href = reserveClubLink.getAttribute('href') || '#';
                    rLink.textContent = clean(reserveClubLink.textContent);
                    item.appendChild(rLink);

                    if (expiryText) {
                        const exp = document.createElement('span');
                        exp.className = 'tmvu-account-reserve-expiry';
                        exp.textContent = expiryText;
                        item.appendChild(exp);
                    }

                    // Action buttons
                    const actions = document.createElement('div');
                    actions.className = 'tmvu-account-reserve-actions';

                    if (renewLink) {
                        const btn = TmUI.button({ label: 'Renew', color: 'secondary', size: 'sm', shape: 'md' });
                        btn.onclick = () => { if (typeof reserve_renew_pop === 'function') reserve_renew_pop(); };
                        actions.appendChild(btn);
                    }
                    if (renameSpan && reserveClubId) {
                        const btn = TmUI.button({ label: 'Rename', color: 'secondary', size: 'sm', shape: 'md' });
                        btn.onclick = () => { if (typeof pop_reserves_name === 'function') pop_reserves_name(reserveClubId); };
                        actions.appendChild(btn);
                    }
                    if (deleteSpan) {
                        const btn = TmUI.button({ label: 'Disable', color: 'danger', size: 'sm', shape: 'md' });
                        btn.onclick = () => { if (typeof delete_reserve_pop === 'function') delete_reserve_pop(); };
                        actions.appendChild(btn);
                    }
                    item.appendChild(actions);
                } else {
                    const noTeam = document.createElement('span');
                    noTeam.className = 'tmvu-account-reserve-arrow';
                    noTeam.textContent = '— no reserve team';
                    item.appendChild(noTeam);
                }

                list.appendChild(item);
            });

            if (!reserveRows.length) list.appendChild(makeNote('No teams found.'));
            body.appendChild(list);
        });

        // Determine if a reserve team already exists
        const hasReserve = reserveRows.some(tr => tr.querySelector('td:nth-child(2) [club_link]'));

        // Create Reserve Team card — only shown when no reserve team exists
        const cards = [heroWrap, reserveCard];
        if (!hasReserve) {
            const createBtn = TmUI.button({ label: 'Create Reserve Team', color: 'primary', size: 'sm', shape: 'md' });
            createBtn.onclick = () => { if (typeof create_reserve_pop === 'function') create_reserve_pop(); };
            const createCard = makeCard('Create Reserve Team', body => {
                body.appendChild(makeNote('A Reserve Team gives your young players valuable playing time. Cost: 5 PRO days per month. Teams not renewed within 8 weeks will be inactivated.'));
                body.appendChild(makeActions(createBtn));
            });
            cards.push(createCard);
        }

        // Assemble
        const mainCol = document.createElement('div');
        mainCol.className = 'tmu-page-section-stack';
        cards.forEach(el => mainCol.appendChild(el));

        main.classList.add('tmu-page-layout-2col', 'tmu-page-density-regular');
        main.innerHTML = '';
        main.appendChild(mainCol);

        TmSideMenu.mount(main, {
            className: 'tmu-page-sidebar-stack',
            items: navItems,
            currentHref: window.location.pathname.replace(/\/?$/, '/'),
        });
    };

    const renderTeamsPage = () => {        const nativeMain = document.querySelector('.main_center') || document.body;
        const col1 = nativeMain.querySelector('.column1');
        const col2 = nativeMain.querySelector('.column2_a, .column2_b, .column2') || nativeMain;
        const col3 = nativeMain.querySelector('.column3_a');

        const navItems = col1
            ? Array.from(col1.querySelectorAll('.content_menu a')).map(a => ({
                href: a.getAttribute('href') || '#',
                label: clean(a.textContent),
            }))
            : [];

        // Create Team widgets
        const countrySelect = col2.querySelector('#country');
        const paymentSelect = col2.querySelector('#payment');
        const clubnameInput = col2.querySelector('#clubname');

        // Current Teams rows
        const teamRows = Array.from(col2.querySelectorAll('tr')).filter(tr =>
            tr.querySelector('[club_link]')
        );

        // Limitations list from column3_a
        const aboutOl = col3?.querySelector('ol');

        injectStyles();

        // Hero
        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-account-hero',
            slots: { kicker: 'Account', title: 'Teams' },
        });

        // Current Teams card
        const teamsCard = makeCard('Current Teams', body => {
            const list = document.createElement('div');
            list.className = 'tmvu-account-team-list';
            teamRows.forEach(tr => {
                const link      = tr.querySelector('[club_link]');
                const flagEl    = tr.querySelector('[class*="flag-img"]');
                const cells     = tr.querySelectorAll('td');
                const daysCell  = cells[2];
                const labelCell = cells[3];

                const item = document.createElement('div');
                item.className = 'tmvu-account-team-item';

                if (link) {
                    const a = document.createElement('a');
                    a.className = 'tmvu-account-team-name';
                    a.href = link.getAttribute('href') || '#';
                    a.textContent = clean(link.textContent);
                    item.appendChild(a);
                }
                if (flagEl) item.appendChild(flagEl.cloneNode(true));
                if (daysCell) {
                    const s = document.createElement('span');
                    s.className = 'tmvu-account-team-expiry';
                    s.textContent = clean(daysCell.textContent);
                    item.appendChild(s);
                }
                if (labelCell) {
                    const s = document.createElement('span');
                    s.className = 'tmvu-account-team-badge';
                    s.textContent = clean(labelCell.textContent);
                    item.appendChild(s);
                }
                list.appendChild(item);
            });
            if (!teamRows.length) list.appendChild(makeNote('No secondary teams yet.'));
            body.appendChild(list);
        });

        // Create Team card — our native selects sync to TM's hidden originals
        const createBtn = TmUI.button({ label: 'Create Team', color: 'primary', size: 'sm', shape: 'md' });
        createBtn.onclick = () => { if (typeof pop_create_team === 'function') pop_create_team(); };

        const createCard = makeCard('Create Team', body => {
            body.appendChild(makeNote('A secondary team costs 90 pro days per season. Expanding for several seasons at once gives a discount.'));

            // Country — our native select, syncs to TM's hidden #country on change
            if (countrySelect) {
                const options = Array.from(countrySelect.options).map(o => ({
                    value: o.value, text: o.text, selected: o.selected,
                }));
                const ourCountry = makeSelect(options, 'tmvu-teams-country');
                ourCountry.style.maxWidth = '360px';
                ourCountry.addEventListener('change', () => {
                    countrySelect.value = ourCountry.value;
                    countrySelect.dispatchEvent(new Event('change', { bubbles: true }));
                });
                body.appendChild(makeRow('Country', ourCountry));
            }

            // Club name — move TM's input so get_random_name() can write into it directly
            if (clubnameInput) {
                clubnameInput.className = 'tmu-input tmu-input-tone-overlay tmu-input-density-regular';
                clubnameInput.style.cssText = 'width:100%;max-width:360px';
                body.appendChild(makeRow('Club Name', clubnameInput));
            }

            // Payment — our native select, syncs to TM's hidden #payment
            if (paymentSelect) {
                const options = Array.from(paymentSelect.options).map(o => ({
                    value: o.value, text: o.text, selected: o.selected,
                }));
                const ourPayment = makeSelect(options, 'tmvu-teams-payment');
                ourPayment.style.maxWidth = '360px';
                ourPayment.addEventListener('change', () => {
                    paymentSelect.value = ourPayment.value;
                });
                body.appendChild(makeRow('Payment', ourPayment));
            }

            body.appendChild(makeActions(createBtn));
        });

        // Limitations card (from column3_a)
        let limitsCard = null;
        if (aboutOl) {
            limitsCard = makeCard('Limitations', body => {
                const ol = aboutOl.cloneNode(true);
                ol.style.cssText = 'margin:0;padding-left:var(--tmu-space-lg);font-size:var(--tmu-font-sm);color:var(--tmu-text-main);line-height:1.8';
                body.appendChild(ol);
            });
        }

        // Assemble
        const mainCol = document.createElement('div');
        mainCol.className = 'tmu-page-section-stack';
        [heroWrap, teamsCard, createCard, ...(limitsCard ? [limitsCard] : [])]
            .forEach(el => mainCol.appendChild(el));

        main.classList.add('tmu-page-layout-2col', 'tmu-page-density-regular');
        main.innerHTML = '';
        main.appendChild(mainCol);

        TmSideMenu.mount(main, {
            className: 'tmu-page-sidebar-stack',
            items: navItems,
            currentHref: window.location.pathname.replace(/\/?$/, '/'),
        });
    };

    const renderClubInfoPage = () => {
        const nativeMain = document.querySelector('.main_center') || document.body;
        const col1 = nativeMain.querySelector('.column1');
        const col2 = nativeMain.querySelector('.column2_a, .column2_b, .column2') || nativeMain;

        const navItems = col1
            ? Array.from(col1.querySelectorAll('.content_menu a')).map(a => ({
                href: a.getAttribute('href') || '#',
                label: clean(a.textContent),
            }))
            : [];

        // Extract references BEFORE clearing main
        const clubName    = clean(col2.querySelector('.align_center .large')?.textContent || '');
        const logoImg     = col2.querySelector('.club_logo')?.cloneNode(true);
        const kitBlocks   = Array.from(col2.querySelectorAll('.kit_block'));
        const wingsHost   = col2.querySelector('[onclick*="saveWings"]')?.closest('.std');
        const stadiumHost = col2.querySelector('#stadium_background_img')?.closest('.std');
        const uploadDiv   = col2.querySelector('#upload_logo');
        const favRows     = Array.from(col2.querySelectorAll('tr')).filter(tr => tr.querySelector('[player_link]'));

        const getCell = (cls) => clean(col2.querySelector(`.${cls} td:last-child`)?.textContent || 'n/a');
        const descData = [
            { label: 'Manager Name', value: getCell('man_name') },
            { label: 'Club Town',    value: getCell('club_city') },
            { label: 'Nickname',     value: getCell('club_nick') },
            { label: 'Fanclub',      value: getCell('fanclub') },
            { label: 'Stadium',      value: getCell('stadium') },
        ];

        injectStyles();

        // Hero
        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-account-hero',
            slots: { kicker: 'Account', title: 'Club Info' },
        });

        // Club Name
        const nameBtn = TmUI.button({ label: 'Change Name', color: 'secondary', size: 'sm', shape: 'md' });
        nameBtn.onclick = () => { if (typeof pop_change_club_name === 'function') pop_change_club_name(); };
        const clubNameCard = makeCard('Club Name', body => {
            const nameEl = document.createElement('p');
            nameEl.className = 'tmvu-account-club-name';
            nameEl.textContent = clubName;
            body.appendChild(nameEl);
            body.appendChild(makeActions(nameBtn));
        });

        // Club Logo
        const uploadBtn = TmUI.button({ label: 'Upload New Logo', color: 'secondary', size: 'sm', shape: 'md' });
        uploadBtn.onclick = () => { if (typeof upload_logo_show === 'function') upload_logo_show(); };
        const logoCard = makeCard('Club Logo', body => {
            if (logoImg) {
                const imgWrap = document.createElement('div');
                imgWrap.className = 'tmvu-account-logo-wrap';
                imgWrap.appendChild(logoImg);
                body.appendChild(imgWrap);
            }
            body.appendChild(makeActions(uploadBtn));
            // Move upload form into card so upload_logo_show() finds #upload_logo
            if (uploadDiv) body.appendChild(uploadDiv);
        });

        // Club Colours — move kit_blocks, wire onclick
        const colorsCard = makeCard('Club Colours', body => {
            const wrap = document.createElement('div');
            wrap.className = 'tmvu-account-kit-wrap';
            kitBlocks.forEach(block => {
                block.querySelectorAll('[id^="selected_color"][place]').forEach(el => {
                    const place = el.getAttribute('place');
                    el.setAttribute('onclick', `if(typeof change_color==='function')change_color(${place})`);
                });
                wrap.appendChild(block);
            });
            body.appendChild(wrap);
        });

        // Clubhouse Wings — move (inline onclick="saveWings(n)" preserved)
        const wingsCard = makeCard('Clubhouse Wings', body => {
            if (wingsHost) body.appendChild(wingsHost);
        });

        // Favourite Players
        const favCard = makeCard('Favourite Players', body => {
            if (!favRows.length) return;
            const list = document.createElement('div');
            list.className = 'tmvu-account-fav-list';
            favRows.forEach(tr => {
                const playerLink  = tr.querySelector('[player_link]');
                const statCells   = tr.querySelectorAll('td.align_center');
                const changeAnchor = tr.querySelector('a[href*="pop_change_fav_player"]');

                const item = document.createElement('div');
                item.className = 'tmvu-account-fav-item';

                if (playerLink) {
                    const a = document.createElement('a');
                    a.className = 'tmvu-account-fav-name';
                    a.href = playerLink.getAttribute('href') || '#';
                    const flagImg = playerLink.querySelector('img');
                    if (flagImg) a.appendChild(flagImg.cloneNode(true));
                    a.appendChild(document.createTextNode(clean(playerLink.textContent)));
                    item.appendChild(a);
                }

                statCells.forEach(cell => {
                    const s = document.createElement('span');
                    s.className = 'tmvu-account-fav-stat';
                    s.textContent = clean(cell.textContent);
                    item.appendChild(s);
                });

                if (changeAnchor) {
                    const m = (changeAnchor.getAttribute('href') || '').match(/pop_change_fav_player\((\d+),(\d+)\)/);
                    const btn = TmUI.button({ label: 'Change', color: 'secondary', size: 'sm', shape: 'md' });
                    if (m) {
                        const slot = parseInt(m[1]), pid = parseInt(m[2]);
                        btn.onclick = () => { if (typeof pop_change_fav_player === 'function') pop_change_fav_player(slot, pid); };
                    }
                    item.appendChild(btn);
                }

                list.appendChild(item);
            });
            body.appendChild(list);
        });

        // Club Description — styled display; TM's hidden original serves club_desc_pop()
        const descBtn = TmUI.button({ label: 'Edit', color: 'secondary', size: 'sm', shape: 'md' });
        descBtn.onclick = () => { if (typeof club_desc_pop === 'function') club_desc_pop(); };
        const descCard = makeCard('Club Description', body => {
            const table = document.createElement('div');
            table.className = 'tmvu-account-desc-table';
            descData.forEach(({ label, value }) => {
                const row = document.createElement('div');
                row.className = 'tmvu-account-desc-row';
                const lbl = document.createElement('span');
                lbl.className = 'tmvu-account-desc-label';
                lbl.textContent = label;
                const val = document.createElement('span');
                val.className = 'tmvu-account-desc-value';
                val.textContent = value;
                row.appendChild(lbl);
                row.appendChild(val);
                table.appendChild(row);
            });
            body.appendChild(table);
            body.appendChild(makeActions(descBtn));
        });

        // Stadium Background — move (IDs preserved, radio onchange intact)
        const saveBgBtn = TmUI.button({ label: 'Save', color: 'primary', size: 'sm', shape: 'md' });
        saveBgBtn.onclick = () => { if (typeof save_stadium_background === 'function') save_stadium_background(); };
        const stadiumCard = makeCard('Stadium Background', body => {
            if (stadiumHost) {
                // Remove TM's own save button and status span (we replace them)
                stadiumHost.querySelectorAll('.button, #stadium_bg_saved').forEach(el => el.remove());
                const wrap = document.createElement('div');
                wrap.className = 'tmvu-account-stadium-host';
                wrap.appendChild(stadiumHost);
                body.appendChild(wrap);
            }
            body.appendChild(makeActions(saveBgBtn));
        });

        // Assemble
        const mainCol = document.createElement('div');
        mainCol.className = 'tmu-page-section-stack';
        [heroWrap, clubNameCard, logoCard, colorsCard, wingsCard, favCard, descCard, stadiumCard]
            .forEach(el => mainCol.appendChild(el));

        main.classList.add('tmu-page-layout-2col', 'tmu-page-density-regular');
        main.innerHTML = '';
        main.appendChild(mainCol);

        TmSideMenu.mount(main, {
            className: 'tmu-page-sidebar-stack',
            items: navItems,
            currentHref: window.location.pathname.replace(/\/?$/, '/'),
        });
    };

    const renderPage = () => {
        const nativeMain = document.querySelector('.main_center') || document.body;
        const col1 = nativeMain.querySelector('.column1');
        const col2 = nativeMain.querySelector('.column2_a, .column2_b, .column2') || nativeMain;
        // Verify we're on the account settings page by checking for a known form
        if (!document.getElementById('email_formular') && !document.getElementById('timezone_form') && !document.getElementById('password_formular')) return;

        // ── Snapshot initial values before moving elements ────────────────────
        const navItems = col1
            ? Array.from(col1.querySelectorAll('.content_menu a')).map(a => ({
                href: a.getAttribute('href') || '#',
                label: clean(a.textContent),
            }))
            : [];

        const langSelNative  = nativeMain.querySelector('#language_select');
        const tzSelNative    = nativeMain.querySelector('#timezone');
        const emailNative    = nativeMain.querySelector('#email');
        const advCbNative    = nativeMain.querySelector('#advanced_mode');
        const sigNative      = nativeMain.querySelector('[name="forum_signature"]');

        const langOptions = langSelNative
            ? Array.from(langSelNative.options).map(o => ({ value: o.value, text: o.text, selected: o.selected }))
            : [];
        const tzOptions = tzSelNative
            ? Array.from(tzSelNative.options).map(o => ({ value: o.value, text: o.text, selected: o.selected }))
            : [];
        const emailValue     = emailNative?.value || '';
        const advChecked     = advCbNative?.checked ?? false;
        const sigValue       = sigNative?.value || '';

        const bannerIds = ['banner_top', 'banner_rectangle', 'banner_popup', 'banner_menu', 'banner_bottom', 'newsletter'];
        const bannerLabels = {
            banner_top:       'Top Banner',
            banner_rectangle: 'Upper Right Rectangle',
            banner_popup:     'Rectangles inside pop-ups',
            banner_menu:      'Left Skyscraper',
            banner_bottom:    'Bottom Banner',
            newsletter:       'Email Newsletters',
        };
        const bannerStates = {};
        bannerIds.forEach(id => {
            const el = nativeMain.querySelector(`#${id}`);
            bannerStates[id] = el?.checked ?? false;
        });

        // ── Park TM's original forms so TM's JS can still find them by ID ────
        let park = document.getElementById('tmvu-account-park');
        if (!park) {
            park = document.createElement('div');
            park.id = 'tmvu-account-park';
            park.style.cssText = 'position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none';
            document.body.appendChild(park);
        }

        // Move all forms to park
        Array.from(nativeMain.querySelectorAll('form')).forEach(f => park.appendChild(f));

        // Move standalone hidden elements not already inside a parked form
        [langSelNative, advCbNative,
            ...bannerIds.map(id => nativeMain.querySelector(`#${id}`))
        ].forEach(el => {
            if (el && !el.closest('#tmvu-account-park')) park.appendChild(el);
        });

        // ── Build layout ──────────────────────────────────────────────────────
        injectStyles();

        // Hero
        const heroWrap = document.createElement('section');
        TmHeroCard.mount(heroWrap, {
            heroClass: 'tmvu-account-hero',
            slots: { kicker: 'Account', title: 'Settings' },
        });

        // Language & Time
        const langSel = makeSelect(langOptions, 'tmvu-lang-sel');
        langSel.addEventListener('change', () => {
            const native = document.getElementById('language_select');
            if (native) native.value = langSel.value;
            if (typeof change_language === 'function') change_language();
            else window.location.search = '?language=' + encodeURIComponent(langSel.value);
        });

        const tzSel = makeSelect(tzOptions, 'tmvu-tz-sel');
        const tzSaveBtn = TmUI.button({ label: 'Save Timezone', color: 'primary', size: 'sm', shape: 'md' });
        tzSaveBtn.addEventListener('click', () => {
            const native = document.getElementById('timezone');
            if (native) native.value = tzSel.value;
            if (typeof submit_form === 'function') submit_form('timezone_form');
            else document.getElementById('timezone_form')?.submit();
        });

        const langTimeCard = makeCard('Language & Time', (body) => {
            body.appendChild(makeRow('Language', langSel));
            body.appendChild(makeNote('Trophy Manager offers a wide selection of languages maintained by our Language Teamsters.'));
            body.appendChild(makeRow('Timezone', tzSel));
            body.appendChild(makeActions(tzSaveBtn));
        });

        // Change Email
        const emailInput = TmUI.input({ id: 'tmvu-email', name: 'email', type: 'text',
            tone: 'overlay', density: 'regular', size: 'full', value: emailValue });
        const emailPassInput = TmUI.input({ id: 'tmvu-email-pass', name: 'password', type: 'password',
            tone: 'overlay', density: 'regular', size: 'full', placeholder: 'Current password' });
        const emailSaveBtn = TmUI.button({ label: 'Update Email', color: 'primary', size: 'sm', shape: 'md' });
        emailSaveBtn.addEventListener('click', () => {
            const form = document.getElementById('email_formular');
            if (!form) return;
            const fEmail = form.querySelector('[name="email"]');
            const fPass  = form.querySelector('[name="password"]');
            if (fEmail) fEmail.value = emailInput.value;
            if (fPass)  fPass.value  = emailPassInput.value;
            if (typeof submit_form === 'function') submit_form('email_formular');
            else form.submit();
        });

        const emailCard = makeCard('Change Email', (body) => {
            body.appendChild(makeNote('Your email is used for password recovery and login.'));
            body.appendChild(makeRow('Email Address', emailInput));
            body.appendChild(makeRow('Current Password', emailPassInput));
            body.appendChild(makeActions(emailSaveBtn));
        });

        // Change Password
        const oldPassInput = TmUI.input({ id: 'tmvu-old-pass', name: 'old_password', type: 'password',
            tone: 'overlay', density: 'regular', size: 'full', placeholder: 'Current password' });
        const newPassInput = TmUI.input({ id: 'tmvu-new-pass', name: 'new_password', type: 'password',
            tone: 'overlay', density: 'regular', size: 'full', placeholder: 'New password (min 6 chars)' });
        const newPassConfInput = TmUI.input({ id: 'tmvu-new-pass-conf', name: 'new_password_confirm', type: 'password',
            tone: 'overlay', density: 'regular', size: 'full', placeholder: 'Confirm new password' });
        const passSaveBtn = TmUI.button({ label: 'Update Password', color: 'primary', size: 'sm', shape: 'md' });
        passSaveBtn.addEventListener('click', () => {
            const form = document.getElementById('password_formular');
            if (!form) return;
            const f1 = form.querySelector('[name="password"]');
            const f2 = form.querySelector('[name="new_password"]');
            const f3 = form.querySelector('[name="new_password_confirm"]');
            if (f1) f1.value = oldPassInput.value;
            if (f2) f2.value = newPassInput.value;
            if (f3) f3.value = newPassConfInput.value;
            if (typeof submit_form === 'function') submit_form('password_formular');
            else form.submit();
        });

        const passCard = makeCard('Change Password', (body) => {
            body.appendChild(makeNote('Password must be at least 6 characters long.'));
            body.appendChild(makeRow('Current Password', oldPassInput));
            body.appendChild(makeRow('New Password', newPassInput));
            body.appendChild(makeRow('Confirm New Password', newPassConfInput));
            body.appendChild(makeActions(passSaveBtn));
        });

        // Advanced Mode
        const advField = TmUI.checkboxField({
            id: 'tmvu-advanced-mode',
            label: 'Play in Advanced Mode',
            checked: advChecked,
            onChange: () => {
                const native = document.getElementById('advanced_mode');
                if (native) native.checked = advField.inputEl.checked;
                if (typeof set_advanced_mode === 'function') set_advanced_mode();
            },
        });

        const advCard = makeCard('Advanced Mode', (body) => {
            body.appendChild(makeNote('Advanced mode gives you a more detailed training overview, additional filter options on the transfer list, and Skill Index alongside Recommendation.'));
            body.appendChild(advField);
        });

        // Banner Settings
        const bannerCard = makeCard('Banner Settings', (body) => {
            body.appendChild(makeNote('PRO users can disable banners and email newsletters below.'));
            const checksWrap = document.createElement('div');
            checksWrap.className = 'tmvu-account-checks';
            bannerIds.forEach(id => {
                const field = TmUI.checkboxField({
                    id: 'tmvu-' + id,
                    label: bannerLabels[id],
                    checked: bannerStates[id],
                    onChange: () => {
                        const native = document.getElementById(id);
                        if (native) native.checked = field.inputEl.checked;
                        if (typeof banner_submit === 'function') banner_submit(id);
                    },
                });
                checksWrap.appendChild(field);
            });
            body.appendChild(checksWrap);
        });

        // Forum Signature
        const sigTextarea = document.createElement('textarea');
        sigTextarea.className = 'tmu-input tmu-input-tone-overlay tmu-input-density-regular';
        sigTextarea.name = 'forum_signature';
        sigTextarea.rows = 3;
        sigTextarea.value = sigValue;
        sigTextarea.style.cssText = 'width:100%;max-width:360px;resize:vertical;min-height:60px;line-height:1.6;padding:var(--tmu-space-sm)';

        const sigSaveBtn = TmUI.button({ label: 'Save Signature', color: 'primary', size: 'sm', shape: 'md' });
        sigSaveBtn.addEventListener('click', () => {
            // Find the parked form containing forum_signature
            const origSig = document.querySelector('#tmvu-account-park [name="forum_signature"]');
            const form = origSig?.closest('form');
            if (origSig) origSig.value = sigTextarea.value;
            if (form) {
                if (form.id && typeof submit_form === 'function') submit_form(form.id);
                else form.submit();
            }
        });

        const sigCard = makeCard('Forum Signature', (body) => {
            body.appendChild(makeNote('Your signature appears below your posts in the forum. Maximum 2 lines.'));
            body.appendChild(makeRow('Signature', sigTextarea));
            body.appendChild(makeActions(sigSaveBtn));
        });

        // Disable Account
        const disableBtn = TmUI.button({ label: 'Disable Account', color: 'danger', size: 'sm', shape: 'md' });
        disableBtn.addEventListener('click', () => {
            if (typeof submit_form === 'function') submit_form('inactive_form');
            else document.getElementById('inactive_form')?.submit();
        });

        const disableCard = makeCard('Disable Account', (body) => {
            body.appendChild(makeNote('If you no longer wish to have a Trophy Manager account you can disable it here. This decision cannot be reversed.'));
            body.appendChild(makeActions(disableBtn));
        });

        // ── Assemble ──────────────────────────────────────────────────────────
        const mainCol = document.createElement('div');
        mainCol.className = 'tmu-page-section-stack';
        [heroWrap, langTimeCard, emailCard, passCard, advCard, bannerCard, sigCard, disableCard]
            .forEach(el => mainCol.appendChild(el));

        main.classList.add('tmu-page-layout-2col', 'tmu-page-density-regular');
        main.innerHTML = '';
        main.appendChild(mainCol);

        TmSideMenu.mount(main, {
            className: 'tmu-page-sidebar-stack',
            items: navItems,
            currentHref: window.location.pathname.replace(/\/?$/, '/'),
        });
    };

    // Wait for TM content then route to the right renderer
    const waitForContent = () => {
        const path = window.location.pathname;
        const isClubInfo     = /\/account\/club-info\//i.test(path);
        const isTeams        = /\/account\/teams\//i.test(path);
        const isReserveTeams = /\/account\/reserve-teams\//i.test(path);
        const isDonatePro    = /\/account\/donate-pro\//i.test(path);

        const check = isClubInfo     ? () => document.querySelector('.main_center .box_head')
            : isTeams                ? () => document.querySelector('#country') || document.querySelector('#clubname')
            : isReserveTeams         ? () => document.querySelector('.main_center .column2_a .box_body')
            : isDonatePro            ? () => document.querySelector('#donate_days')
            : () => document.getElementById('email_formular') || document.getElementById('timezone_form');

        const run = isClubInfo    ? renderClubInfoPage
            : isTeams             ? renderTeamsPage
            : isReserveTeams      ? renderReserveTeamsPage
            : isDonatePro         ? renderDonateProPage
            : renderPage;

        if (check()) { run(); return; }
        const observer = new MutationObserver(() => {
            if (check()) { observer.disconnect(); run(); }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { observer.disconnect(); run(); }, 6000);
    };

    waitForContent();
}
