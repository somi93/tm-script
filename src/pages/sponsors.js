import { TmPageHero } from '../components/shared/tm-page-hero.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmUtils } from '../lib/tm-utils.js';
import { TmCountdownBlock } from '../components/shared/tm-countdown-block.js';

'use strict';

const STYLE_ID = 'tmvu-sponsors-style';
let refreshTimer = 0;
let sponsorObserver = null;

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const metricHtml = (opts) => TmUI.metric(opts);
const parseMoney = (value) => TmUtils.parseNum(cleanText(value));
const formatMoney = (value) => Number(value || 0).toLocaleString('en-US');
const titleize = (value) => cleanText(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const actionButton = (label, onClick) => TmUI.button({
    label,
    color: 'secondary',
    size: 'sm',
    cls: 'tmvu-sponsors-action',
    onClick,
});

const iconForMenu = (label) => {
    if (/finance/i.test(label)) return '💰';
    if (/sponsor/i.test(label)) return '🤝';
    if (/maintenance/i.test(label)) return '🏗';
    if (/wages/i.test(label)) return '💸';
    if (/players/i.test(label)) return '👥';
    if (/scouts/i.test(label)) return '🧭';
    return '•';
};

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    injectTmPageLayoutStyles();

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
            .tmvu-sponsors-note {
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-sm);
                line-height: 1.55;
            }

            .tmvu-sponsors-goals {
                --tmu-card-grid-min: 240px;
            }

            .tmvu-sponsors-fullwidth {
                width: 100%;
            }

            .tmvu-sponsors-group {
                border: 1px solid var(--tmu-border-soft-alpha);
                border-radius: var(--tmu-space-md);
                background: var(--tmu-card-bg);
                padding: var(--tmu-space-md);
            }

            .tmvu-sponsors-group-head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: var(--tmu-space-md);
                margin-bottom: var(--tmu-space-md);
            }

            .tmvu-sponsors-group-title {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 800;
            }

            .tmvu-sponsors-group-meta {
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
                font-weight: 700;
            }

            .tmvu-sponsors-option-list {
                display: flex;
                flex-direction: column;
                gap: var(--tmu-space-sm);
            }

            .tmvu-sponsors-option {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: var(--tmu-space-md);
                align-items: start;
                width: 100%;
                border: 1px solid var(--tmu-border-soft-alpha);
                border-radius: var(--tmu-space-md);
                background: rgba(255,255,255,.03);
                color: var(--tmu-text-strong);
                cursor: pointer;
                padding: var(--tmu-space-md);
                text-align: left;
                transition: border-color .16s ease, background .16s ease, transform .16s ease;
            }

            .tmvu-sponsors-option:hover {
                border-color: var(--tmu-border-success);
                background: rgba(255,255,255,.05);
                transform: translateY(-1px);
            }

            .tmvu-sponsors-option.is-selected {
                border-color: var(--tmu-border-success);
                background: rgba(255,255,255,.06);
                box-shadow: inset 0 0 0 1px var(--tmu-border-success);
            }

            .tmvu-sponsors-option-name {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 800;
            }

            .tmvu-sponsors-option-note {
                margin-top: var(--tmu-space-xs);
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
                line-height: 1.45;
            }

            .tmvu-sponsors-option-bonus {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 800;
                font-variant-numeric: tabular-nums;
                white-space: nowrap;
            }

            .tmvu-sponsors-option-media {
                display: flex;
                align-items: center;
                gap: var(--tmu-space-md);
            }

            .tmvu-sponsors-option-logo {
                width: 52px;
                height: 52px;
                border-radius: var(--tmu-space-md);
                object-fit: cover;
                background: var(--tmu-border-contrast);
                flex: 0 0 auto;
            }

            .tmvu-sponsors-goal-actions {
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-sm);
                margin-top: var(--tmu-space-lg);
            }

            .tmvu-sponsors-offer {
                border: 1px solid var(--tmu-border-soft-alpha);
                border-radius: var(--tmu-space-lg);
                background: var(--tmu-card-bg);
                overflow: hidden;
            }

            .tmvu-sponsors-offer-top {
                display: grid;
                grid-template-columns: minmax(0, 1fr);
                gap: 0;
            }

            .tmvu-sponsors-offer-image {
                width: 100%;
                height: 160px;
                border-radius: 0;
                object-fit: cover;
                background: var(--tmu-border-contrast);
            }

            .tmvu-sponsors-offer-body {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto auto;
                gap: var(--tmu-space-lg);
                align-items: end;
                padding: var(--tmu-space-lg);
            }

            .tmvu-sponsors-offer-label {
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-sponsors-offer-title {
                margin-top: var(--tmu-space-xs);
                color: var(--tmu-text-inverse);
                font-size: var(--tmu-font-lg);
                font-weight: 900;
                line-height: 1.15;
            }

            .tmvu-sponsors-offer-contract {
                margin-top: var(--tmu-space-sm);
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                line-height: 1.5;
            }

            .tmvu-sponsors-offer-amount {
                margin-top: var(--tmu-space-md);
                color: var(--tmu-text-inverse);
                font-size: var(--tmu-font-2xl);
                font-weight: 900;
                font-variant-numeric: tabular-nums;
            }

            .tmvu-sponsors-offer-expiry {
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                font-weight: 700;
                white-space: nowrap;
                text-align: right;
            }

            .tmvu-sponsors-offer-meta {
                --tmu-card-grid-min: 140px;
                padding: 0 var(--tmu-space-lg) var(--tmu-space-lg);
            }

            .tmvu-sponsors-offer-meta-item {
                border: 1px solid var(--tmu-border-soft-alpha);
                border-radius: var(--tmu-space-md);
                background: rgba(255,255,255,.03);
                padding: var(--tmu-space-md);
            }

            .tmvu-sponsors-offer-meta-name {
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-sponsors-offer-meta-value {
                margin-top: var(--tmu-space-sm);
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 700;
                line-height: 1.45;
            }

            .tmvu-sponsors-action-row {
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-sm);
                padding: 0 var(--tmu-space-lg) var(--tmu-space-lg);
            }

            .tmvu-sponsors-action {
                min-height: 34px;
                padding: 0 var(--tmu-space-lg);
                border: 1px solid var(--tmu-border-embedded);
                border-radius: var(--tmu-space-sm);
                background: var(--tmu-surface-accent-soft);
                color: var(--tmu-text-strong);
                cursor: pointer;
                font-size: var(--tmu-font-sm);
                font-weight: 800;
                transition: background .16s ease, border-color .16s ease;
            }

            .tmvu-sponsors-action:hover {
                background: var(--tmu-success-fill-strong);
                border-color: var(--tmu-border-success);
            }

            .tmvu-sponsors-summary-item {
                display: grid;
                grid-template-columns: minmax(0, 1fr) auto;
                gap: var(--tmu-space-md);
                align-items: center;
                border: 1px solid var(--tmu-border-soft-alpha);
                border-radius: var(--tmu-space-md);
                background: rgba(255,255,255,.03);
                padding: var(--tmu-space-md);
            }

            .tmvu-sponsors-summary-name {
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                letter-spacing: .04em;
                text-transform: uppercase;
            }

            .tmvu-sponsors-summary-value {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 800;
                font-variant-numeric: tabular-nums;
                text-align: right;
            }

            .tmvu-sponsors-engine {
                position: absolute;
                left: -99999px;
                top: 0;
                width: 1px;
                height: 1px;
                overflow: hidden;
                opacity: 0;
                pointer-events: none;
            }
        `;

    document.head.appendChild(style);
};

const parseMenu = (sourceRoot) => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap((node) => {
    if (node.tagName === 'HR') return [{ type: 'separator' }];
    if (node.tagName !== 'A') return [];

    const label = cleanText(node.textContent);
    return [{
        type: 'link',
        href: node.getAttribute('href') || '#',
        label,
        icon: iconForMenu(label),
        isSelected: node.classList.contains('selected'),
    }];
});

const engineHost = document.createElement('div');
engineHost.className = 'tmvu-sponsors-engine';
engineHost.setAttribute('aria-hidden', 'true');

const getNativeGoalsBox = () => engineHost.querySelector('#sponsor_goals')?.closest('.box') || null;
const getNativeSponsorField = () => engineHost.querySelector('#sponsor_field');

const getLabelForInput = (root, input) => {
    if (!root || !input?.id) return null;
    const escapedId = window.CSS?.escape ? window.CSS.escape(input.id) : input.id;
    return root.querySelector(`label[for="${escapedId}"]`);
};

const extractOptionNote = (row, optionLabel, bonusText) => {
    if (!row) return '';

    const texts = Array.from(row.querySelectorAll('th, td'))
        .map((cell) => cleanText(cell.textContent))
        .filter(Boolean)
        .filter((text) => text !== optionLabel && text !== bonusText);

    return texts.join(' | ');
};

const findOptionImage = (radio, labelNode) => {
    const visited = new Set();
    const seeds = [labelNode, radio];

    for (const seed of seeds) {
        let node = seed;
        while (node && !visited.has(node)) {
            visited.add(node);
            node = node.nextElementSibling;
            if (!node) break;
            if (node.tagName === 'IMG') return node;
            if (node.tagName === 'INPUT' || node.tagName === 'LABEL') break;
        }
    }

    return null;
};

const parseGoalGroups = (box) => {
    if (!box) return [];

    return Array.from(box.querySelectorAll('h3')).map((heading) => {
        const title = cleanText(heading.textContent);
        let section = heading.nextElementSibling;

        while (section && !section.matches('.std, form, table')) {
            if (section.matches('h3')) return null;
            section = section.nextElementSibling;
        }

        if (!section) return null;
        const radios = Array.from(section.querySelectorAll('input[type="radio"]'));
        if (!radios.length) return null;

        return {
            key: radios[0].name || title.toLowerCase().replace(/\W+/g, '-'),
            title: title || titleize(radios[0].name),
            options: radios.map((radio) => {
                const row = radio.closest('tr') || radio.parentElement;
                const labelNode = getLabelForInput(section, radio) || getLabelForInput(box, radio) || row?.querySelector('label');
                const optionLabel = cleanText(labelNode?.textContent || radio.value || radio.name);
                const bonusNode = row?.querySelector('td.align_right, .align_right');
                const bonusText = cleanText(bonusNode?.textContent || '0');
                const imageNode = findOptionImage(radio, labelNode);

                return {
                    id: radio.id || '',
                    name: optionLabel || titleize(radio.name),
                    bonus: parseMoney(bonusText),
                    bonusText: bonusText || '0',
                    note: extractOptionNote(row, optionLabel, bonusText),
                    checked: radio.checked,
                    imageSrc: imageNode?.getAttribute('src') || '',
                };
            }),
        };
    }).filter(Boolean);
};

const parseGoalActions = (box) => parseOfferActions(box || document.createElement('div'));

const parseOfferActions = (node) => {
    const seen = new Set();
    return Array.from(node.querySelectorAll('.msgbuttons .button_border, .msgbuttons button, .msgbuttons input[type="button"], .msgbuttons input[type="submit"], a.button_border'))
        .map((element) => {
            const label = cleanText(element.value || element.textContent || element.getAttribute('title') || 'Action');
            const key = `${label}|${element.getAttribute('onclick') || ''}`;
            if (!label || seen.has(key)) return null;
            seen.add(key);
            return { label, element };
        })
        .filter(Boolean);
};

const parseOfferState = (host) => {
    if (!host) {
        return {
            status: 'missing',
            message: 'Sponsor data is unavailable on this page.',
            offers: [],
        };
    }

    const hostText = cleanText(host.textContent);
    if (host.querySelector('.loading_animation') || /loading/i.test(hostText)) {
        return {
            status: 'loading',
            message: 'Refreshing sponsor offer...',
            offers: [],
        };
    }

    const candidates = Array.from(host.children).filter((node) => node.nodeType === 1);
    const nodes = candidates.length ? candidates : [host];
    const offers = nodes.map((node) => {
        const image = node.querySelector('img');
        const moneyNode = node.querySelector('.large.bold, .very_large .coin_big, .coin_big, .coin');
        const title = cleanText(node.querySelector('h1, h2, h3, strong, b')?.textContent || 'Sponsor Offer');
        const paragraphs = Array.from(node.querySelectorAll('p, li'))
            .map((item) => cleanText(item.textContent))
            .filter(Boolean);
        const detailSet = new Set();
        const details = paragraphs.filter((text) => {
            if (detailSet.has(text)) return false;
            detailSet.add(text);
            return true;
        });
        const contract = details[0] || '';
        const expires = details.find((text) => /expire|week|season|day/i.test(text)) || '';
        const meta = details.filter((text) => text !== contract && text !== expires);
        const actions = parseOfferActions(node);
        const amount = parseMoney(moneyNode?.textContent || '0');
        const fallbackText = cleanText(node.textContent);

        if (!amount && !contract && !image && !actions.length && !fallbackText) return null;

        return {
            title,
            contract,
            expires,
            meta,
            amount,
            imageSrc: image?.getAttribute('src') || '',
            actions,
            rawText: fallbackText,
        };
    }).filter(Boolean);

    if (!offers.length) {
        return {
            status: 'empty',
            message: hostText || 'No sponsor offer is available yet.',
            offers: [],
        };
    }

    return {
        status: 'ready',
        message: '',
        offers,
    };
};

const getViewState = () => {
    const goalsBox = getNativeGoalsBox();
    const goalGroups = parseGoalGroups(goalsBox);
    const sponsorGroup = goalGroups.find((group) => /select sponsor/i.test(group.title) || group.key === 'spoon') || null;
    const targetGroups = goalGroups.filter((group) => group !== sponsorGroup);
    const selectedGoals = targetGroups
        .map((group) => group.options.find((option) => option.checked))
        .filter(Boolean);
    const selectedBonusTotal = selectedGoals.reduce((sum, option) => sum + option.bonus, 0);
    const offerState = parseOfferState(getNativeSponsorField());
    const primaryOffer = offerState.offers[0] || null;
    const goalActions = parseGoalActions(goalsBox);

    return {
        goalGroups: targetGroups,
        sponsorGroup,
        goalActions,
        selectedGoals,
        selectedBonusTotal,
        offerState,
        primaryOffer,
    };
};

const queueSponsorRefresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
        if (typeof window.check_sponsor === 'function') {
            window.check_sponsor();
        }
    }, 30);
};

const triggerNativeAction = (element) => {
    if (!element) return;
    element.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
    }));
};

const selectNativeGoal = (radioId) => {
    if (!radioId) return;
    const box = getNativeGoalsBox();
    if (!box) return;
    const escapedId = window.CSS?.escape ? window.CSS.escape(radioId) : radioId;
    const input = box.querySelector(`#${escapedId}`);
    if (!input || input.checked) return;

    input.checked = true;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    triggerNativeAction(input);
    queueSponsorRefresh();
    renderPage();
};

const createCard = (title, icon) => {
    const card = document.createElement('tm-card');
    card.setAttribute('data-title', title);
    card.setAttribute('data-icon', icon);
    return card;
};

let heroSideRef = null;
let heroCountdown = null;
let heroOfferKey = null;

// Read the native page's live countdown DOM — no need for our own interval math.
const readNativeCountdown = () => {
    const cd = getNativeSponsorField()?.querySelector('.countdown');
    if (!cd) return null;
    const days = parseInt(cd.querySelector('.days')?.textContent || '0', 10);
    const hours = (cd.querySelector('.hours')?.textContent || '00').trim();
    const mins = (cd.querySelector('.minutes')?.textContent || '00').trim();
    const secs = (cd.querySelector('.seconds')?.textContent || '00').trim();
    const total = (isNaN(days) ? 0 : days) * 86400
        + parseInt(hours, 10) * 3600
        + parseInt(mins, 10) * 60
        + parseInt(secs, 10);
    if (total <= 0) return null;
    return days > 0 ? `${days}d ${hours}h` : `${hours}:${mins}:${secs}`;
};

const updateOfferDisplay = () => {
    if (!heroSideRef) return;

    const state = getViewState();
    const offer = state.primaryOffer;

    // MutationObserver fires every second (countdown text changes) — skip remount
    // when only the timer digits changed, not the offer itself.
    const key = offer ? `${offer.title}|${offer.amount}|${offer.contract}` : 'empty';
    if (key === heroOfferKey && heroCountdown) return;
    heroOfferKey = key;

    heroCountdown?.destroy();
    heroCountdown = null;

    const title = offer ? (offer.title || offer.contract || 'Active Contract') : 'No Active Sponsor';
    const offerActions = (offer?.actions || []).map((a) => ({
        label: a.label,
        onClick: () => { triggerNativeAction(a.element); queueSponsorRefresh(); },
    }));

    heroCountdown = TmCountdownBlock.mount(heroSideRef, {
        title,
        // Reads live from native DOM each tick; returns null when expired → actions shown.
        getDisplayText: offer ? readNativeCountdown : null,
        actions: offerActions,
    });
};

const renderHero = () => {
    const wrap = document.createElement('section');
    TmPageHero.mount(wrap, {
        slots: {
            kicker: 'Finances',
            title: 'Sponsors',
            side: '<div data-ref="offer-side" class="tmvu-fin-balance-hero"></div>',
        },
    });
    const card = wrap.firstElementChild || wrap;
    heroSideRef = card.querySelector('[data-ref="offer-side"]');
    return card;
};

const renderGoalsCard = (state) => {
    const card = createCard('Sponsor Targets', '🎯');

    if (!state.goalGroups.length) {
        card.insertAdjacentHTML('beforeend', TmUI.info('Sponsor targets are not available on this page.'));
        return card;
    }

    const info = document.createElement('div');
    info.className = 'tmvu-sponsors-note';
    info.textContent = 'Choose one target per group for the season bonus structure.';
    card.appendChild(info);

    const groups = document.createElement('div');
    groups.className = 'tmvu-sponsors-goals tmu-page-card-grid tmu-card-grid-density-regular';

    state.goalGroups.forEach((group) => {
        const groupEl = document.createElement('section');
        groupEl.className = 'tmvu-sponsors-group';

        const selected = group.options.find((option) => option.checked);
        const header = document.createElement('div');
        header.className = 'tmvu-sponsors-group-head';
        header.innerHTML = `
                <div class="tmvu-sponsors-group-title">${escapeHtml(group.title)}</div>
                <div class="tmvu-sponsors-group-meta">${escapeHtml(selected ? formatMoney(selected.bonus) : 'No bonus')}</div>
            `;
        groupEl.appendChild(header);

        const list = document.createElement('div');
        list.className = 'tmvu-sponsors-option-list';
        list.onclick = (event) => {
            const button = event.target.closest('.tmvu-sponsors-option[data-sponsor-option-id]');
            if (!button || !list.contains(button)) return;
            selectNativeGoal(button.dataset.sponsorOptionId);
        };

        group.options.forEach((option) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = `tmvu-sponsors-option${option.checked ? ' is-selected' : ''}`;
            button.dataset.sponsorOptionId = option.id;
            button.innerHTML = `
                    <div class="tmvu-sponsors-option-media">
                        ${option.imageSrc ? `<img class="tmvu-sponsors-option-logo" src="${escapeHtml(option.imageSrc)}" alt="">` : ''}
                        <div>
                            <div class="tmvu-sponsors-option-name">${escapeHtml(option.name)}</div>
                            ${option.note ? `<div class="tmvu-sponsors-option-note">${escapeHtml(option.note)}</div>` : ''}
                        </div>
                    </div>
                    <div class="tmvu-sponsors-option-bonus">${escapeHtml(option.bonus ? formatMoney(option.bonus) : '-')}</div>
                `;
            list.appendChild(button);
        });

        groupEl.appendChild(list);
        groups.appendChild(groupEl);
    });

    card.appendChild(groups);

    return card;
};

const renderSponsorPickerCard = (state) => {
    if (!state.sponsorGroup) return null;

    const card = createCard('Select Sponsor', '🏁');
    card.classList.add('tmvu-sponsors-fullwidth');

    const info = document.createElement('div');
    info.className = 'tmvu-sponsors-note';
    info.textContent = 'Pick the sponsor brand, then confirm with the native action below.';
    card.appendChild(info);

    const picker = document.createElement('div');
    picker.className = 'tmvu-sponsors-picker tmu-page-card-grid tmu-card-grid-density-regular';
    picker.onclick = (event) => {
        const button = event.target.closest('.tmvu-sponsors-option[data-sponsor-option-id]');
        if (!button || !picker.contains(button)) return;
        selectNativeGoal(button.dataset.sponsorOptionId);
    };

    state.sponsorGroup.options.forEach((option) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `tmvu-sponsors-option${option.checked ? ' is-selected' : ''}`;
        button.dataset.sponsorOptionId = option.id;
        button.innerHTML = `
                <div class="tmvu-sponsors-option-media">
                    ${option.imageSrc ? `<img class="tmvu-sponsors-option-logo" src="${escapeHtml(option.imageSrc)}" alt="">` : ''}
                    <div>
                        <div class="tmvu-sponsors-option-name">${escapeHtml(option.name)}</div>
                    </div>
                </div>
                <div class="tmvu-sponsors-option-bonus">${option.checked ? 'Selected' : ''}</div>
            `;
        picker.appendChild(button);
    });

    card.appendChild(picker);

    if (state.goalActions.length) {
        const actionRow = document.createElement('div');
        actionRow.className = 'tmvu-sponsors-goal-actions';

        state.goalActions.forEach((action) => {
            actionRow.appendChild(actionButton(action.label, () => triggerNativeAction(action.element)));
        });

        card.appendChild(actionRow);
    }

    return card;
};

const renderOfferCard = (state) => {
    const card = createCard('Sponsor Offer', '🤝');
    card.classList.add('tmvu-sponsors-fullwidth');
    const stack = document.createElement('div');
    stack.className = 'tmvu-sponsors-offer-stack tmu-stack tmu-stack-density-regular';

    if (state.offerState.status !== 'ready') {
        const statusMessage = state.offerState.message || 'No sponsor offer is available yet.';
        if (state.offerState.status === 'loading') stack.insertAdjacentHTML('beforeend', TmUI.loading(statusMessage, true));
        else if (state.offerState.status === 'empty') stack.insertAdjacentHTML('beforeend', TmUI.empty(statusMessage, true));
        else stack.insertAdjacentHTML('beforeend', TmUI.info(statusMessage, true));

        if (typeof window.check_sponsor === 'function') {
            stack.appendChild(actionButton('Refresh Offer', () => queueSponsorRefresh()));
        }

        card.appendChild(stack);
        return card;
    }

    state.offerState.offers.forEach((offer) => {
        const offerEl = document.createElement('article');
        offerEl.className = 'tmvu-sponsors-offer';
        const expiryText = offer.expires || '-';
        offerEl.innerHTML = `
                <div class="tmvu-sponsors-offer-top">
                    <div>${offer.imageSrc ? `<img class="tmvu-sponsors-offer-image" src="${escapeHtml(offer.imageSrc)}" alt="Sponsor">` : ''}</div>
                    <div class="tmvu-sponsors-offer-body">
                        <div>
                            <div class="tmvu-sponsors-offer-label">Live Sponsor Output</div>
                            <div class="tmvu-sponsors-offer-title">${escapeHtml(offer.title || 'Sponsor Offer')}</div>
                            ${offer.contract ? `<div class="tmvu-sponsors-offer-contract">${escapeHtml(offer.contract)}</div>` : ''}
                        </div>
                        <div class="tmvu-sponsors-offer-amount">${escapeHtml(formatMoney(offer.amount))}</div>
                        <div class="tmvu-sponsors-offer-expiry">${escapeHtml(expiryText)}</div>
                    </div>
                </div>
            `;

        const meta = document.createElement('div');
        meta.className = 'tmvu-sponsors-offer-meta tmu-page-card-grid tmu-card-grid-density-compact';
        const metaItems = [
            ...offer.meta.map((item, index) => ({ label: `Detail ${index + 1}`, value: item })),
        ].filter((item) => {
            const value = cleanText(item.value);
            return value && value !== offer.contract && value !== offer.expires && value !== formatMoney(offer.amount);
        });

        metaItems.forEach((item) => {
            const cell = document.createElement('div');
            cell.className = 'tmvu-sponsors-offer-meta-item';
            cell.innerHTML = `
                    <div class="tmvu-sponsors-offer-meta-name">${escapeHtml(item.label)}</div>
                    <div class="tmvu-sponsors-offer-meta-value">${escapeHtml(item.value)}</div>
                `;
            meta.appendChild(cell);
        });

        if (meta.childElementCount) offerEl.appendChild(meta);

        const actionRow = document.createElement('div');
        actionRow.className = 'tmvu-sponsors-action-row';

        offer.actions.forEach((action) => {
            actionRow.appendChild(actionButton(action.label, () => triggerNativeAction(action.element)));
        });

        if (typeof window.check_sponsor === 'function') {
            actionRow.appendChild(actionButton('Refresh Offer', () => queueSponsorRefresh()));
        }

        if (actionRow.childElementCount) offerEl.appendChild(actionRow);
        stack.appendChild(offerEl);
    });

    card.appendChild(stack);
    return card;
};

const renderSnapshotCard = (state) => {
    const card = createCard('Deal Snapshot', '📌');
    const list = document.createElement('div');
    list.className = 'tmvu-sponsors-summary-list tmu-stack tmu-stack-density-tight';

    const items = [
        { label: 'Offer Value', value: state.primaryOffer ? formatMoney(state.primaryOffer.amount) : '0' },
        { label: 'Selected Bonus Total', value: formatMoney(state.selectedBonusTotal) },
        { label: 'Active Targets', value: String(state.selectedGoals.length) },
        { label: 'Expiry', value: state.primaryOffer?.expires || '-' },
    ];

    items.forEach((item) => {
        const row = document.createElement('div');
        row.className = 'tmvu-sponsors-summary-item';
        row.innerHTML = `
                <div class="tmvu-sponsors-summary-name">${escapeHtml(item.label)}</div>
                <div class="tmvu-sponsors-summary-value">${escapeHtml(item.value)}</div>
            `;
        list.appendChild(row);
    });

    card.appendChild(list);
    return card;
};

const renderSelectedGoalsCard = (state) => {
    const card = createCard('Selected Targets', '💼');

    if (!state.selectedGoals.length) {
        card.insertAdjacentHTML('beforeend', TmUI.empty('No sponsor targets are currently selected.'));
        return card;
    }

    const list = document.createElement('div');
    list.className = 'tmvu-sponsors-summary-list tmu-stack tmu-stack-density-tight';

    state.goalGroups.forEach((group) => {
        const selected = group.options.find((option) => option.checked);
        if (!selected) return;

        const row = document.createElement('div');
        row.className = 'tmvu-sponsors-summary-item';
        row.innerHTML = `
                <div>
                    <div class="tmvu-sponsors-summary-name">${escapeHtml(group.title)}</div>
                    <div class="tmvu-sponsors-note">${escapeHtml(selected.name)}</div>
                </div>
                <div class="tmvu-sponsors-summary-value">${escapeHtml(formatMoney(selected.bonus))}</div>
            `;
        list.appendChild(row);
    });

    card.appendChild(list);
    return card;
};

const mainCol = document.createElement('div');
mainCol.className = 'tmvu-sponsors-main tmu-page-section-stack';

const sideCol = document.createElement('aside');
sideCol.className = 'tmvu-sponsors-side tmu-page-rail-stack';

function renderPage() {
    const state = getViewState();
    const hero = renderHero();
    mainCol.replaceChildren(
        hero,
        renderGoalsCard(state),
        ...(state.sponsorGroup ? [renderSponsorPickerCard(state)] : []),
    );
    updateOfferDisplay();
}

const bindObservers = () => {
    const sponsorField = getNativeSponsorField();
    const goalsBox = getNativeGoalsBox();

    if (goalsBox && !goalsBox._tmvuSponsorsGoalsBound) {
        goalsBox._tmvuSponsorsGoalsBound = true;
        goalsBox.addEventListener('change', renderPage);
    }

    if (sponsorObserver) sponsorObserver.disconnect();
    if (!sponsorField) return;

    sponsorObserver = new MutationObserver(() => updateOfferDisplay());
    sponsorObserver.observe(sponsorField, {
        childList: true,
        subtree: true,
        characterData: true,
    });
};

const render = (main, sourceRoot) => {
    injectStyles();

    main.classList.add('tmvu-sponsors-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
    main.replaceChildren();

    TmSideMenu.mount(main, {
        id: 'tmvu-sponsors-side-menu',
        className: 'tmu-page-sidebar-stack',
        items: parseMenu(sourceRoot),
        currentHref: '/sponsors/',
    });

    main.appendChild(mainCol);
    main.appendChild(engineHost);

    bindObservers();
    renderPage();
    queueSponsorRefresh();
};

export function initSponsorsPage(main) {
    const sourceRoot = document.querySelector('.main_center');
    if (!main || !sourceRoot) return;

    const liveFinanceColumn = sourceRoot.querySelector(':scope > .column2_a') || sourceRoot.querySelector('.column2_a');
    if (!liveFinanceColumn) return;
    if (!liveFinanceColumn.querySelector('#sponsor_field, #sponsor_goals')) return;

    if (liveFinanceColumn.parentElement !== engineHost) {
        engineHost.replaceChildren();
        engineHost.appendChild(liveFinanceColumn);
    }

    render(main, sourceRoot);
}
