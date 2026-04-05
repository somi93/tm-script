import { TmPageHero } from '../components/shared/tm-page-hero.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmUtils } from '../lib/tm-utils.js';

'use strict';

const STYLE_ID = 'tmvu-scouts-hire-style';

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
const buttonHtml = (opts) => TmUI.button(opts).outerHTML;
const skillHtml = (value) => TmUI.skillBadge(value);

const parseMoneyText = (value) => {
    const text = cleanText(value);
    const number = parseFloat(text.replace(/,/g, '').match(/[\d.]+/)?.[0] || '0');
    if (!Number.isFinite(number)) return 0;
    if (/\bmil\b/i.test(text)) return Math.round(number * 1000000);
    if (/\bk\b/i.test(text)) return Math.round(number * 1000);
    return Math.round(number);
};

const parseSkillCell = (cell) => {
    const img = cell?.querySelector('img[alt], img[title]');
    const raw = img?.getAttribute('alt') || img?.getAttribute('title') || cleanText(cell?.textContent);
    return parseInt(raw || '0', 10) || 0;
};

const parseMenu = (sourceRoot) => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
    if (node.tagName === 'HR') return [{ type: 'separator' }];
    if (node.tagName !== 'A') return [];
    const label = cleanText(node.textContent);
    let icon = '🧭';
    if (/hire/i.test(label)) icon = '➕';
    else if (/wage/i.test(label)) icon = '💰';
    return [{
        type: 'link',
        href: node.getAttribute('href') || '#',
        label,
        icon,
        isSelected: node.classList.contains('selected'),
    }];
});

const parseCandidates = (sourceRoot) => {
    const rows = Array.from(sourceRoot.querySelectorAll('.column2_b .std table tr')).slice(1);

    return rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        if (cells.length < 9) return null;

        const heading = cleanText(cells[0].querySelector('span')?.textContent || cells[0].textContent);
        const nameMatch = heading.match(/^(.*?)\((\d+)\s*Years?\)$/i);
        const metaText = cleanText(cells[0].querySelector('.subtle')?.textContent || '');
        const wageParts = metaText.split(/,\s*Sign-on fee:\s*/i);
        let hireHref = '';
        let countryHref = '';
        for (const cell of cells) {
            if (!hireHref) hireHref = cell.querySelector('a[href*="hire_scout_pop"]')?.getAttribute('href') || '';
            if (!countryHref) countryHref = cell.querySelector('a.country_link[href*="/national-teams/"]')?.getAttribute('href') || '';
            if (hireHref && countryHref) break;
        }
        const countryCode = countryHref.match(/\/national-teams\/([^/]+)\//i)?.[1] || '';
        const id = hireHref.match(/,(\d+)\)\s*$/)?.[1] || '';

        const seniors = parseSkillCell(cells[1]);
        const youths = parseSkillCell(cells[2]);
        const physical = parseSkillCell(cells[3]);
        const tactical = parseSkillCell(cells[4]);
        const technical = parseSkillCell(cells[5]);
        const development = parseSkillCell(cells[6]);
        const psychology = parseSkillCell(cells[7]);
        const overall = Number(((seniors + youths + physical + tactical + technical + development + psychology) / 7).toFixed(1));
        const wageLabel = cleanText(wageParts[0].replace(/^Wage:\s*/i, '') || '0');
        const signOnFeeLabel = cleanText(wageParts[1] || '0');
        const wageValue = TmUtils.parseNum(wageLabel);
        const signOnFeeValue = parseMoneyText(signOnFeeLabel);

        return {
            id,
            fullName: cleanText(nameMatch?.[1] || heading),
            age: parseInt(nameMatch?.[2] || '0', 10) || 0,
            countryCode,
            wageLabel,
            signOnFeeLabel,
            wageValue,
            signOnFeeValue,
            yearlyCost: (wageValue * 52) + signOnFeeValue,
            seniors,
            youths,
            physical,
            tactical,
            technical,
            development,
            psychology,
            overall,
            hireHref,
        };
    }).filter(Boolean);
};

const renderCandidateName = (item) => `
        <div class="tmvu-scouts-hire-name-cell">
            <div class="tmvu-scouts-hire-name-row">
                <strong class="tmvu-scouts-hire-name">${escapeHtml(item.fullName)}</strong>
            </div>
            <div class="tmvu-scouts-hire-meta">${escapeHtml(item.age)} yrs • Wage ${escapeHtml(item.wageLabel)} • Fee ${escapeHtml(item.signOnFeeLabel)}</div>
        </div>
    `;

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    injectTmPageLayoutStyles();

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
            .tmvu-scouts-hire-page {
                --tmu-page-rail-width: 320px;
            }

            .tmvu-scouts-hire-hero-actions {
                display: flex;
                flex-wrap: wrap;
                gap: var(--tmu-space-sm);
            }

            .tmvu-scouts-hire-copy {
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                line-height: 1.65;
                max-width: 72ch;
            }

            .tmvu-scouts-hire-name-cell {
                min-width: 0;
            }

            .tmvu-scouts-hire-name-row {
                display: flex;
                align-items: center;
                gap: var(--tmu-space-sm);
                min-width: 0;
            }

            .tmvu-scouts-hire-name {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 800;
            }

            .tmvu-scouts-hire-meta {
                margin-top: var(--tmu-space-xs);
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
                line-height: 1.45;
            }

            .tmvu-scouts-hire-overall {
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-sm);
                font-weight: 800;
            }

            .tmvu-scouts-hire-overall-sub {
                margin-top: var(--tmu-space-xs);
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
            }

            .tmvu-scouts-hire-hire {
                justify-content: center;
                min-width: 88px;
            }

            .tmvu-scouts-hire-table-card .tmu-tbl tbody td {
                vertical-align: middle;
            }

            .tmvu-scouts-hire-table-card .tmu-tbl thead th.c,
            .tmvu-scouts-hire-table-card .tmu-tbl tbody td.c {
                text-align: center;
            }
        `;

    document.head.appendChild(style);
};

const renderHero = () => {
    const host = document.createElement('section');
    const refs = TmPageHero.mount(host, {
        slots: {
            kicker: 'Scouts',
            title: 'Hire Scouts',
            side: '<div data-ref="hero-actions" class="tmvu-scouts-hire-hero-actions"></div>',
        },
    });
    const actionsEl = refs.hero?.querySelector('[data-ref="hero-actions"]');
    if (actionsEl) {
        actionsEl.appendChild(TmUI.button({ label: 'Scout Reports', href: '/scouts/', color: 'secondary', size: 'sm' }));
        actionsEl.appendChild(TmUI.button({ label: 'Staff Wages', href: '/finances/wages/', color: 'secondary', size: 'sm' }));
    }
    return host.firstElementChild || host;
};

const renderCandidatesTable = (candidates) => {
    const host = document.createElement('section');
    const refs = TmSectionCard.mount(host, {
        hostClass: 'tmvu-scouts-hire-table-card',
        title: 'Scout Market',
        icon: '🧭',
        bodyClass: 'tmvu-scouts-hire-table-body',
    });

    const candidatesById = new Map(candidates.map(item => [String(item.id), item]));
    const table = TmTable.table({
        cls: 'tmvu-scouts-hire-table',
        items: candidates,
        sortKey: 'overall',
        sortDir: -1,
        emptyText: 'No scouts are currently available in your division.',
        headers: [
            { key: 'fullName', label: 'Scout', width: '300px', render: (_, item) => renderCandidateName(item) },
            { key: 'seniors', label: 'Sen', align: 'c', width: '48px', render: value => skillHtml(value) },
            { key: 'youths', label: 'Yth', align: 'c', width: '48px', render: value => skillHtml(value) },
            { key: 'physical', label: 'Phy', align: 'c', width: '48px', render: value => skillHtml(value) },
            { key: 'tactical', label: 'Tac', align: 'c', width: '48px', render: value => skillHtml(value) },
            { key: 'technical', label: 'Tec', align: 'c', width: '48px', render: value => skillHtml(value) },
            { key: 'development', label: 'Dev', align: 'c', width: '48px', render: value => skillHtml(value) },
            { key: 'psychology', label: 'Psy', align: 'c', width: '48px', render: value => skillHtml(value) },
            {
                key: 'overall',
                label: 'Overall',
                align: 'c',
                width: '88px',
                render: value => `<div class="tmvu-scouts-hire-overall">${escapeHtml(String(value))}</div>`,
            },
            {
                key: 'yearlyCost',
                label: 'Action',
                align: 'r',
                kind: 'action',
                sortable: false,
                width: '108px',
                render: (_, item) => buttonHtml({
                    label: 'Hire',
                    color: 'primary',
                    size: 'sm',
                    cls: 'tmvu-scouts-hire-hire',
                    attrs: { 'data-scout-hire': item.id || '' },
                }),
            },
        ],
    });

    table.addEventListener('click', event => {
        const trigger = event.target.closest('[data-scout-hire]');
        if (!trigger) return;
        const candidate = candidatesById.get(cleanText(trigger.getAttribute('data-scout-hire')));
        if (!candidate) return;
        event.preventDefault();
        if (typeof window.hire_scout_pop === 'function') {
            window.hire_scout_pop(candidate.fullName, candidate.signOnFeeLabel, Number(candidate.id));
            return;
        }
        if (candidate.hireHref) window.location.href = candidate.hireHref;
    });

    refs.body.appendChild(table);
    return host.firstElementChild || host;
};

const render = (main, sourceRoot) => {
    injectStyles();

    const candidates = parseCandidates(sourceRoot);
    if (!candidates.length) return;

    main.classList.add('tmvu-scouts-hire-page', 'tmu-page-layout-2col', 'tmu-page-density-regular');
    main.innerHTML = '';

    TmSideMenu.mount(main, {
        id: 'tmvu-scouts-hire-menu',
        className: 'tmu-page-sidebar-stack',
        items: parseMenu(sourceRoot),
        currentHref: '/scouts/hire/',
    });

    const mainColumn = document.createElement('div');
    mainColumn.className = 'tmvu-scouts-hire-main tmu-page-section-stack';

    mainColumn.appendChild(renderHero());
    mainColumn.appendChild(renderCandidatesTable(candidates));

    main.appendChild(mainColumn);
};

const boot = (main, sourceRoot) => {
    render(main, sourceRoot);
    return true;
};

export function initScoutsHirePage(main) {
    const sourceRoot = document.querySelector('.main_center');
    if (!main || !sourceRoot) return;
    if (!sourceRoot.querySelector('.column1 .content_menu, .column2_b .std table')) return;
    boot(main, sourceRoot);
}