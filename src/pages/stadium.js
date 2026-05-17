import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard }           from '../components/shared/tm-section-card.js';
import { TmUI }                    from '../components/shared/tm-ui.js';

export function initStadiumPage(main) {
    if (!main || !main.isConnected) return;

    const STYLE_ID = 'tmvu-s4';
    const clean  = (v) => String(v || '').replace(/\s+/g, ' ').trim();
    const numFmt = (n) => typeof window.number_format === 'function'
        ? window.number_format(n) : Number(n).toLocaleString();

    // ── State ──────────────────────────────────────────────────────────
    let detailEl     = null;
    let listWrap     = null;
    let renderTimer  = null;
    let detailObs    = null;
    let activeKey    = null;
    let stadiumDraft = null;

    // ── Styles ─────────────────────────────────────────────────────────
    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();
        const s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
/* image */
.tmvu-s4-imgwrap{overflow:hidden;border-radius:8px;line-height:0}
.tmvu-s4-imgwrap img,.tmvu-s4-imgwrap #view{display:block;max-width:100%;height:auto}

/* outer panel */
.tmvu-s4-fac{display:flex;min-height:540px}

/* ── list ── */
.tmvu-s4-list{flex:0 0 50%;min-width:0;overflow-y:auto;border-right:1px solid var(--tmu-border-soft-alpha)}
.tmvu-s4-item{
    display:grid;grid-template-columns:40px 1fr auto;align-items:center;
    gap:0 8px;padding:8px 10px 8px 7px;width:100%;cursor:pointer;
    background:none;border:none;border-left:3px solid transparent;text-align:left;
    border-bottom:1px solid var(--tmu-border-faint);transition:background .12s,border-color .12s
}
.tmvu-s4-item:last-child{border-bottom:none}
.tmvu-s4-item:hover{background:var(--tmu-surface-tab-hover)}
.tmvu-s4-item.is-act{background:var(--tmu-surface-tab-active);border-left-color:var(--tmu-success)}
.tmvu-s4-icon{
    width:36px;height:36px;grid-column:1;grid-row:1/3;
    background-size:contain;background-repeat:no-repeat;background-position:center
}
.tmvu-s4-name{
    font-size:13px;font-weight:500;color:var(--tmu-text-main);line-height:1.25;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;grid-column:2;grid-row:1
}
.tmvu-s4-item.is-act .tmvu-s4-name{color:var(--tmu-text-strong);font-weight:700}
.tmvu-s4-sub{
    font-size:11px;color:var(--tmu-text-muted);line-height:1.2;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis
}
.tmvu-s4-lv{
    font-size:11px;color:var(--tmu-text-muted);grid-column:2;grid-row:2;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;margin-top:2px
}
.tmvu-s4-item.is-act .tmvu-s4-lv{color:var(--tmu-success)}
.tmvu-s4-dots{display:flex;align-items:center;gap:3px;grid-column:3;grid-row:1/3;flex-shrink:0;background:rgba(0,0,0,.35);border-radius:999px;padding:5px 8px}

/* ── detail ── */
.tmvu-s4-detail{flex:1;min-width:0;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:16px}

/* header */
.tmvu-s4-hdr{display:flex;gap:14px;align-items:flex-start}
.tmvu-s4-fimg{flex-shrink:0;width:72px;height:72px;background-size:contain;background-repeat:no-repeat;background-position:center top}
.tmvu-s4-htxt{display:flex;flex-direction:column;gap:4px;padding-top:4px}
.tmvu-s4-h2{font-size:20px;font-weight:800;color:var(--tmu-text-strong);line-height:1.15}
.tmvu-s4-lvbadge{
    display:inline-flex;align-items:center;gap:5px;
    font-size:11px;font-weight:600;color:var(--tmu-text-muted);margin-top:5px
}
.tmvu-s4-lvbadge-cur{color:var(--tmu-success);font-weight:700}
.tmvu-s4-building{font-size:11px;font-weight:600;color:var(--tmu-warning);margin-top:4px}

/* description */
.tmvu-s4-desc{font-size:13px;color:var(--tmu-text-muted);line-height:1.75;padding-bottom:14px;border-bottom:1px solid var(--tmu-border-faint)}

/* upgrade levels */
.tmvu-s4-lvl-hdr{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--tmu-text-panel-label);margin-bottom:6px}
.tmvu-s4-lvls{display:flex;flex-direction:column;gap:2px}
.tmvu-s4-lvl-row{
    display:grid;grid-template-columns:64px 1fr auto;
    align-items:start;gap:0 12px;
    padding:7px 10px;border-radius:6px;border:1px solid transparent
}
.tmvu-s4-lvl-row.cur{background:rgba(72,199,116,.09);border-color:rgba(72,199,116,.25)}
.tmvu-s4-lvl-badge{font-size:12px;font-weight:700;color:var(--tmu-text-muted);white-space:nowrap}
.tmvu-s4-lvl-row.cur .tmvu-s4-lvl-badge{color:var(--tmu-success)}
.tmvu-s4-lvl-eff{font-size:12px;color:var(--tmu-text-muted);line-height:1.5}
.tmvu-s4-lvl-row.cur .tmvu-s4-lvl-eff{color:var(--tmu-text-main)}
.tmvu-s4-lvl-cost{font-size:11px;color:var(--tmu-text-muted);text-align:right;line-height:1.7}

/* stadium capacity */
.tmvu-s4-seats{display:flex;flex-direction:column;align-items:center;padding:16px 0 12px;gap:4px;border-bottom:1px solid var(--tmu-border-faint)}
.tmvu-s4-seats-num{font-size:32px;font-weight:800;color:var(--tmu-text-strong);line-height:1;font-variant-numeric:tabular-nums}
.tmvu-s4-seats-sub{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--tmu-text-muted)}
.tmvu-s4-adj{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}
.tmvu-s4-adj-btn{
    padding:8px 2px;border-radius:6px;border:1px solid var(--tmu-border-soft-alpha);
    background:var(--tmu-surface-tab);font-size:12px;font-weight:700;
    cursor:pointer;transition:background .12s,border-color .12s;white-space:nowrap;text-align:center
}
.tmvu-s4-adj-btn:hover{background:var(--tmu-surface-tab-hover);border-color:var(--tmu-border-soft)}
.tmvu-s4-adj-btn.pos{color:var(--tmu-success)}
.tmvu-s4-adj-btn.neg{color:var(--tmu-danger)}

/* buttons */
.tmvu-s4-btns{display:flex;gap:8px;flex-wrap:nowrap;padding-top:14px;margin-top:4px;border-top:1px solid var(--tmu-border-faint)}
.tmvu-s4-btns > *{flex:0 0 calc(50% - 4px) !important;justify-content:center}
        `;
        document.head.appendChild(s);
    };

    // ── Dots (inline styles — immune to TM global CSS overrides) ───────
    const DOT_ON  = 'display:inline-block;width:20px;height:20px;border-radius:50%;background:var(--tmu-success);flex-shrink:0';
    const DOT_OFF = 'display:inline-block;width:20px;height:20px;border-radius:50%;background:rgba(255,255,255,.14);flex-shrink:0';
    const makeDots = (cur, max) =>
        Array.from({ length: max }, (_, i) =>
            `<span style="${i < cur ? DOT_ON : DOT_OFF}"></span>`
        ).join('');

    // ── facility_data accessor ──────────────────────────────────────────
    const fd = () => window.facility_data || {};

    // ── Facility list data (from facility_data) ─────────────────────────
    const getFacilities = () =>
        Object.keys(fd()).map(key => {
            const val = fd()[key];
            return {
                key,
                name:     val.title || key,
                lvlNum:   val.level  || 0,
                maxLevel: (val.level_cost?.length || 1) - 1,
                isSeats:  key === 'stadium',
                building: !!val.building,
            };
        });

    // ── Detail data for one facility (from facility_data) ───────────────
    const getDetail = (key) => {
        const val = fd()[key];
        if (!val) return null;
        const level        = val.level || 0;
        const maxLevel     = (val.level_cost?.length || 1) - 1;
        const building     = !!val.building;
        const downgradeable = !!val.downgradeable;
        const isStadium    = key === 'stadium';

        // Build the 2–3 relevant level rows (prev / current / next)
        const levelRows = [];
        if (!isStadium) {
            if (downgradeable && level > 0) {
                levelRows.push({
                    label: `Level ${level - 1}`,
                    eff:   String(val.level_effect?.[level - 1] || ''),
                    costParts: [
                        `Maintenance ${numFmt(val.maintenance?.[level - 2] || 0)} per week`,
                        'Downgrade cost: 0',
                    ],
                    isCur: false,
                });
            }
            levelRows.push({
                label: `Level ${level}`,
                eff:   `${val.level_effect?.[level] || ''} ${val.entity || ''}`.trim(),
                costParts: [
                    `Maintenance ${numFmt(val.maintenance?.[level - 1] || 0)} per week`,
                ],
                isCur: true,
            });
            if (level < maxLevel) {
                levelRows.push({
                    label: `Level ${level + 1}`,
                    eff:   String(val.level_effect?.[level + 1] || ''),
                    costParts: [
                        `Maintenance ${numFmt(val.maintenance?.[level] || 0)} per week`,
                        `Construction cost: ${numFmt(val.level_cost?.[level + 1] || 0)}`,
                    ],
                    isCur: false,
                });
            }
        }

        return {
            key, isStadium, level, maxLevel, building, downgradeable,
            title:   val.title,
            fimgUrl: `/pics/facilities/icons/${key}.png`,
            desc:    String(val.details || ''),
            levelRows,
        };
    };

    // ── Render detail panel ─────────────────────────────────────────────
    function renderDetail() {
        if (!detailEl || !activeKey) return;
        const d = getDetail(activeKey);
        if (!d) return;
        detailEl.innerHTML = '';

        // Header: large icon + title (+ building badge)
        const hdr = document.createElement('div');
        hdr.className = 'tmvu-s4-hdr';
        const fi = document.createElement('div');
        fi.className = 'tmvu-s4-fimg';
        fi.style.backgroundImage = `url(${d.fimgUrl})`;
        hdr.appendChild(fi);
        const ht = document.createElement('div');
        ht.className = 'tmvu-s4-htxt';
        const h2 = document.createElement('div');
        h2.className = 'tmvu-s4-h2';
        h2.textContent = d.title;
        ht.appendChild(h2);
        if (!d.isStadium) {
            const badge = document.createElement('div');
            badge.className = 'tmvu-s4-lvbadge';
            badge.innerHTML = d.building
                ? `<span class="tmvu-s4-building">Currently building…</span>`
                : `<span class="tmvu-s4-lvbadge-cur">${d.level}</span><span>of ${d.maxLevel}</span>`;
            ht.appendChild(badge);
        }
        hdr.appendChild(ht);
        detailEl.appendChild(hdr);

        // Description
        if (d.desc) {
            const de = document.createElement('div');
            de.className = 'tmvu-s4-desc';
            de.textContent = d.desc;
            detailEl.appendChild(de);
        }

        // Stadium capacity controls
        if (d.isStadium) {
            if (stadiumDraft === null) stadiumDraft = d.level;

            const counter = document.createElement('div');
            counter.className = 'tmvu-s4-seats';
            const seatsNum = document.createElement('div');
            seatsNum.className = 'tmvu-s4-seats-num';
            seatsNum.textContent = numFmt(stadiumDraft);
            const seatsSub = document.createElement('div');
            seatsSub.className = 'tmvu-s4-seats-sub';
            const delta0 = stadiumDraft - d.level;
            seatsSub.textContent = delta0 === 0 ? 'current seats'
                : (delta0 > 0 ? `+${numFmt(delta0)}` : numFmt(delta0)) + ' from current';
            counter.appendChild(seatsNum);
            counter.appendChild(seatsSub);
            detailEl.appendChild(counter);

            const adj = document.createElement('div');
            adj.className = 'tmvu-s4-adj';

            const bw = document.createElement('div');
            bw.style.cssText = 'padding-top:14px;margin-top:4px;border-top:1px solid var(--tmu-border-faint)';

            const showAdjust = () => {
                bw.innerHTML = '';
                const selectBtn = TmUI.button({ label: 'Select Amount of Seats', color: 'primary', size: 'xl', shape: 'md' });
                selectBtn.style.cssText = 'width:100%;justify-content:center';
                selectBtn.disabled = stadiumDraft === d.level;
                selectBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (stadiumDraft === d.level) return;
                    showConfirm();
                });
                bw.appendChild(selectBtn);
            };

            const showConfirm = () => {
                bw.innerHTML = '';
                const msg = document.createElement('div');
                msg.style.cssText = 'font-size:12px;font-weight:700;color:var(--tmu-text-main);margin-bottom:8px;text-align:center';
                const delta = stadiumDraft - d.level;
                msg.textContent = `Resize to ${numFmt(stadiumDraft)} seats (${delta > 0 ? '+' : ''}${numFmt(delta)})?`;
                bw.appendChild(msg);
                const row = document.createElement('div');
                row.style.cssText = 'display:flex;gap:8px';
                const cancelBtn = TmUI.button({ label: 'Cancel', color: 'secondary', size: 'xl', shape: 'md' });
                const confirmBtn = TmUI.button({ label: 'Confirm resize', color: 'primary', size: 'xl', shape: 'md' });
                cancelBtn.style.cssText = 'flex:1;justify-content:center';
                confirmBtn.style.cssText = 'flex:1;justify-content:center';
                cancelBtn.addEventListener('click', (e) => { e.stopPropagation(); showAdjust(); });
                confirmBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    window.upgrade?.('stadium', stadiumDraft - d.level);
                });
                row.appendChild(cancelBtn);
                row.appendChild(confirmBtn);
                bw.appendChild(row);
            };

            [-1000, -100, -10, 10, 100, 1000].forEach(delta => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'tmvu-s4-adj-btn' + (delta > 0 ? ' pos' : ' neg');
                btn.textContent = (delta > 0 ? '+' : '') + delta.toLocaleString();
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    stadiumDraft = Math.max(1000, stadiumDraft + delta);
                    const d2 = stadiumDraft - d.level;
                    seatsNum.textContent = numFmt(stadiumDraft);
                    seatsSub.textContent = d2 === 0 ? 'current seats'
                        : (d2 > 0 ? `+${numFmt(d2)}` : numFmt(d2)) + ' from current';
                    showAdjust();
                });
                adj.appendChild(btn);
            });

            detailEl.appendChild(adj);
            showAdjust();
            detailEl.appendChild(bw);
            return;
        }

        // Upgrade level rows
        if (d.levelRows.length) {
            const sec = document.createElement('div');
            const lhdr = document.createElement('div');
            lhdr.className = 'tmvu-s4-lvl-hdr';
            lhdr.textContent = 'Upgrade levels';
            sec.appendChild(lhdr);
            const lvls = document.createElement('div');
            lvls.className = 'tmvu-s4-lvls';
            d.levelRows.forEach(r => {
                const row = document.createElement('div');
                row.className = 'tmvu-s4-lvl-row' + (r.isCur ? ' cur' : '');
                row.innerHTML =
                    `<div class="tmvu-s4-lvl-badge">${r.label}</div>` +
                    `<div class="tmvu-s4-lvl-eff">${r.eff}</div>` +
                    `<div class="tmvu-s4-lvl-cost">${r.costParts.map(p => `<div>${p}</div>`).join('')}</div>`;
                lvls.appendChild(row);
            });
            sec.appendChild(lvls);
            detailEl.appendChild(sec);
        }

        // Upgrade / Downgrade buttons
        if (!d.isStadium && !d.building) {
            const bw = document.createElement('div');
            bw.className = 'tmvu-s4-btns';
            if (d.downgradeable && d.level > 0) {
                const btn = TmUI.button({ label: 'Downgrade', color: 'secondary', size: 'xl', shape: 'md' });
                btn.addEventListener('click', () => window.downgrade?.(d.key, d.level - 1));
                bw.appendChild(btn);
            }
            if (d.level < d.maxLevel) {
                const btn = TmUI.button({ label: 'Upgrade', color: 'primary', size: 'xl', shape: 'md' });
                btn.addEventListener('click', () => window.upgrade?.(d.key, d.level + 1));
                bw.appendChild(btn);
            }
            if (bw.children.length) detailEl.appendChild(bw);
        }
    }

    // ── Refresh dots in list after upgrade/downgrade ────────────────────
    const refreshList = () => {
        if (!listWrap) return;
        const facilityData = fd();
        listWrap.querySelectorAll('.tmvu-s4-item').forEach(item => {
            const key = item.dataset.key;
            const val = facilityData[key];
            if (!val) return;
            if (key === 'stadium') {
                const sub = item.querySelector('.tmvu-s4-sub');
                if (sub) sub.textContent = `${numFmt(val.level)} seats.`;
            } else {
                const dotsEl = item.querySelector('.tmvu-s4-dots');
                if (dotsEl) dotsEl.innerHTML = makeDots(val.level, (val.level_cost?.length || 1) - 1);
            }
        });
    };

    // ── Navigation ─────────────────────────────────────────────────────
    const selectFacility = (key) => {
        if (key !== activeKey) stadiumDraft = null;
        activeKey = key;
        listWrap?.querySelectorAll('.tmvu-s4-item').forEach(el =>
            el.classList.toggle('is-act', el.dataset.key === key)
        );
        renderDetail();
    };

    const scheduleRender = () => {
        clearTimeout(renderTimer);
        renderTimer = setTimeout(() => { renderDetail(); refreshList(); }, 150);
    };

    // Watch for TM rebuilding .facility_details (happens after ajax_return)
    // and for #image_map src change (happens via show_stadium_image after success)
    const watchDetail = () => {
        if (detailObs) return;
        detailObs = new MutationObserver(scheduleRender);
        const fdEl = document.querySelector('.facility_details');
        if (fdEl) detailObs.observe(fdEl, { childList: true, subtree: true });
        const imgEl = document.getElementById('image_map');
        if (imgEl) detailObs.observe(imgEl, { attributes: true, attributeFilter: ['src'] });
    };

    // ── Build facility list ─────────────────────────────────────────────
    const buildList = (facilities) => {
        listWrap = document.createElement('div');
        listWrap.className = 'tmvu-s4-list';

        facilities.forEach(fac => {
            const item = document.createElement('button');
            item.type = 'button';
            item.dataset.key = fac.key;
            item.className = 'tmvu-s4-item' + (fac.key === activeKey ? ' is-act' : '');

            let rightHtml = '';
            if (fac.isSeats) {
                rightHtml = `<div class="tmvu-s4-sub" style="grid-column:3;grid-row:1/3">${numFmt(fac.lvlNum)} seats.</div>`;
            } else if (fac.maxLevel > 0) {
                rightHtml = `<div class="tmvu-s4-dots">${makeDots(fac.lvlNum, fac.maxLevel)}</div>`;
            }

            // Sub-text: level position for upgradeable, nothing for seats row
            let subHtml = '';
            if (!fac.isSeats && fac.maxLevel > 0) {
                const lvText = fac.maxLevel === 1
                    ? (fac.lvlNum > 0 ? 'Built' : 'Not built')
                    : `Lv ${fac.lvlNum} / ${fac.maxLevel}`;
                subHtml = `<div class="tmvu-s4-lv">${lvText}</div>`;
            }

            item.innerHTML =
                `<div class="tmvu-s4-icon" style="background-image:url('/pics/facilities/icons/${fac.key}_20px.png')"></div>` +
                `<div class="tmvu-s4-name">${fac.name}</div>` +
                subHtml +
                rightHtml;

            item.addEventListener('click', () => selectFacility(fac.key));
            listWrap.appendChild(item);
        });

        return listWrap;
    };

    // ── Main render ─────────────────────────────────────────────────────
    const render = () => {
        const stadiumVal = fd()['stadium'];
        const stadName   = stadiumVal?.title || 'Stadium';

        const mc       = document.querySelector('.main_center') || document.body;
        const rawTitle = clean(mc.querySelector('.box_head h2')?.textContent || '');
        const sep      = rawTitle.indexOf('\u00bb');
        const clubName = sep >= 0 ? clean(rawTitle.slice(0, sep)) : '';

        const viewEl = document.getElementById('view');
        if (!viewEl) return;

        // Initial active key — use TM's current active pane if available
        if (!activeKey) {
            const candidate = window.active_pane || window.hash?.get?.('page') || 'stadium';
            activeKey = fd()[candidate] ? candidate : Object.keys(fd())[0] || 'stadium';
        }

        const facilities = getFacilities();
        injectStyles();

        // Stadium image (full width, border-radius)
        const imgWrap = document.createElement('div');
        imgWrap.className = 'tmvu-s4-imgwrap';
        imgWrap.appendChild(viewEl);

        // Facilities card — our HTML, our layout
        const facHost = document.createElement('div');
        const facCard = TmSectionCard.mount(facHost, { title: 'Facilities', flush: true });
        if (facCard?.body) {
            const panel = document.createElement('div');
            panel.className = 'tmvu-s4-fac';
            panel.appendChild(buildList(facilities));
            detailEl = document.createElement('div');
            detailEl.className = 'tmvu-s4-detail';
            panel.appendChild(detailEl);
            facCard.body.appendChild(panel);
        }

        const stack = document.createElement('div');
        stack.className = 'tmu-page-section-stack';
        [imgWrap, facHost].forEach(el => stack.appendChild(el));

        main.innerHTML = '';
        main.appendChild(stack);

        renderDetail();
        watchDetail();
    };

    // ── Wait for facility_data and #view ────────────────────────────────
    const waitForContent = () => {
        const ready = () => document.getElementById('view') && window.facility_data;
        if (ready()) { render(); return; }
        let done = false;
        const finish = () => { if (done) return; done = true; obs.disconnect(); render(); };
        const obs = new MutationObserver(() => { if (ready()) finish(); });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => { if (!done && document.getElementById('view')) finish(); }, 3000);
    };

    waitForContent();
}
