import { TmHeroCard } from '../components/shared/tm-hero-card.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmSideMenu } from '../components/shared/tm-side-menu.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmUtils } from '../lib/tm-utils.js';

(function () {
    'use strict';

    if (!/^\/scouts\/hire\/?$/i.test(window.location.pathname)) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const STYLE_ID = 'tmvu-scouts-hire-style';

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const metricHtml = (opts) => TmUI.metric(opts);
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

    const formatCurrency = (value) => Number(value || 0).toLocaleString('en-US');

    const parseMenu = () => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
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

    const parseCandidates = () => {
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

    const summarize = (candidates) => {
        const count = candidates.length;
        const avgOverall = count ? Number((candidates.reduce((sum, item) => sum + item.overall, 0) / count).toFixed(1)) : 0;
        const avgAge = count ? Number((candidates.reduce((sum, item) => sum + item.age, 0) / count).toFixed(1)) : 0;
        const bestOverall = candidates.reduce((best, item) => !best || item.overall > best.overall ? item : best, null);
        const bestYouth = candidates.reduce((best, item) => !best || item.youths > best.youths ? item : best, null);
        const cheapest = candidates.reduce((best, item) => !best || item.yearlyCost < best.yearlyCost ? item : best, null);
        return { count, avgOverall, avgAge, bestOverall, bestYouth, cheapest };
    };

    const renderCandidateName = (item) => `
        <div class="tmvu-scouts-hire-name-cell">
            <div class="tmvu-scouts-hire-name-row">
                <strong class="tmvu-scouts-hire-name">${escapeHtml(item.fullName)}</strong>
            </div>
            <div class="tmvu-scouts-hire-meta">${escapeHtml(item.age)} yrs • Wage ${escapeHtml(item.wageLabel)} • Fee ${escapeHtml(item.signOnFeeLabel)}</div>
        </div>
    `;

    const renderHighlightList = (items) => items.map(item => `
        <div class="tmvu-scouts-hire-highlight">
            <div class="tmvu-scouts-hire-highlight-head">
                <strong>${escapeHtml(item.label)}</strong>
                <span>${escapeHtml(item.value)}</span>
            </div>
            <div class="tmvu-scouts-hire-highlight-body">${item.copy}</div>
        </div>
    `).join('');

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;
        injectTmPageLayoutStyles();

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-scouts-hire-page {
                --tmu-page-rail-width: 320px;
            }

            .tmvu-scouts-hire-copy {
                color: var(--tmu-text-main);
                font-size: 12px;
                line-height: 1.65;
                max-width: 72ch;
            }

            .tmvu-scouts-hire-highlight {
                padding: var(--tmu-space-md);
                border-radius: var(--tmu-space-md);
                border: 1px solid var(--tmu-border-soft-alpha);
                background: var(--tmu-surface-dark-mid);
            }

            .tmvu-scouts-hire-highlight-head {
                display: flex;
                align-items: baseline;
                justify-content: space-between;
                gap: var(--tmu-space-md);
                color: var(--tmu-text-strong);
                font-size: 12px;
            }

            .tmvu-scouts-hire-highlight-head span {
                color: var(--tmu-text-strong);
                font-weight: 800;
            }

            .tmvu-scouts-hire-highlight-body {
                margin-top: var(--tmu-space-sm);
                color: var(--tmu-text-muted);
                font-size: 11px;
                line-height: 1.5;
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
                font-size: 13px;
                font-weight: 800;
            }

            .tmvu-scouts-hire-meta {
                margin-top: var(--tmu-space-xs);
                color: var(--tmu-text-muted);
                font-size: 11px;
                line-height: 1.45;
            }

            .tmvu-scouts-hire-overall {
                color: var(--tmu-text-strong);
                font-size: 12px;
                font-weight: 800;
            }

            .tmvu-scouts-hire-overall-sub {
                margin-top: var(--tmu-space-xs);
                color: var(--tmu-text-muted);
                font-size: 10px;
            }

            .tmvu-scouts-hire-hire {
                justify-content: center;
                min-width: 88px;
            }

            .tmvu-scouts-hire-note {
                color: var(--tmu-text-muted);
                font-size: 11px;
                line-height: 1.6;
            }

            .tmvu-scouts-hire-table-card .tmu-tbl tbody td {
                vertical-align: middle;
            }

            .tmvu-scouts-hire-table-card .tmu-tbl thead th.c,
            .tmvu-scouts-hire-table-card .tmu-tbl tbody td.c {
                text-align: center;
            }

            @media (max-width: 1180px) {
                .tmvu-scouts-hire-side {
                    grid-column: 2;
                }
            }

            @media (max-width: 860px) {
                .tmvu-main.tmvu-scouts-hire-page {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
    };

    const renderHero = (summary) => {
        const host = document.createElement('section');
        TmHeroCard.mount(host, {
            heroClass: 'tmvu-scouts-hire-hero',
            slots: {
                kicker: 'Scouts',
                title: 'Hire Scouts',
                main: `
                    <div class="tmvu-scouts-hire-copy">Browse scouts currently seeking employment in your division, compare their focus areas, and jump straight into hiring without the old legacy table shell.</div>
                `,
                actions: `
                    ${TmHeroCard.button({ label: 'Open Scout Reports', href: '/scouts/' })}
                    ${TmHeroCard.button({ label: 'Staff Wages', href: '/finances/wages/' })}
                `,
            },
        });
        return host.firstElementChild || host;
    };

    const renderCandidatesTable = (candidates) => {
        const host = document.createElement('section');
        const refs = TmSectionCard.mount(host, {
            hostClass: 'tmvu-scouts-hire-table-card',
            title: 'Scout Market',
            icon: '🧭',
            subtitle: `${candidates.length} scouts currently available in your division.`,
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

    const renderInsightsCard = (summary) => {
        const host = document.createElement('section');
        TmSectionCard.mount(host, {
            title: 'Shortlist',
            icon: '⭐',
            subtitle: 'Fast reads on the strongest and cheapest hires in the current market.',
            bodyHtml: `
                <div class="tmvu-scouts-hire-side-stack tmu-stack tmu-stack-density-tight">
                    ${renderHighlightList([
                {
                    label: 'Best Overall',
                    value: summary.bestOverall ? String(summary.bestOverall.overall) : '-',
                    copy: summary.bestOverall ? `${escapeHtml(summary.bestOverall.fullName)} • Wage ${escapeHtml(summary.bestOverall.wageLabel)} • Fee ${escapeHtml(summary.bestOverall.signOnFeeLabel)}` : 'No scout data available.',
                },
                {
                    label: 'Best Youth Eye',
                    value: summary.bestYouth ? String(summary.bestYouth.youths) : '-',
                    copy: summary.bestYouth ? `${escapeHtml(summary.bestYouth.fullName)} • Development ${escapeHtml(String(summary.bestYouth.development))}` : 'No scout data available.',
                },
                {
                    label: 'Lowest Year-One Cost',
                    value: summary.cheapest ? formatCurrency(summary.cheapest.yearlyCost) : '-',
                    copy: summary.cheapest ? `${escapeHtml(summary.cheapest.fullName)} • Wage ${escapeHtml(summary.cheapest.wageLabel)} • Fee ${escapeHtml(summary.cheapest.signOnFeeLabel)}` : 'No scout data available.',
                },
            ])}
                </div>
            `,
        });
        return host.firstElementChild || host;
    };

    const renderNotesCard = () => {
        const host = document.createElement('section');
        TmSectionCard.mount(host, {
            title: 'Hiring Notes',
            icon: '📝',
            bodyHtml: `
                <div class="tmvu-scouts-hire-side-stack tmu-stack tmu-stack-density-tight">
                    ${metricHtml({ label: 'Seniors', value: 'Match-ready reads', note: 'Prioritize this when you need immediate transfer targeting.', layout: 'row', tone: 'muted', size: 'sm' })}
                    ${metricHtml({ label: 'Youths', value: 'Academy upside', note: 'Useful when long-term development matters more than instant certainty.', layout: 'row', tone: 'muted', size: 'sm' })}
                    <div class="tmvu-scouts-hire-note">Hire actions still use TrophyManager\'s native confirmation flow, so the branded page keeps existing game behavior while replacing the old presentation layer.</div>
                </div>
            `,
        });
        return host.firstElementChild || host;
    };

    const render = () => {
        injectStyles();

        const candidates = parseCandidates();
        if (!candidates.length) return;

        const summary = summarize(candidates);

        main.classList.add('tmvu-scouts-hire-page', 'tmu-page-layout-3rail', 'tmu-page-density-regular');
        main.innerHTML = '';

        TmSideMenu.mount(main, {
            id: 'tmvu-scouts-hire-menu',
            className: 'tmu-page-sidebar-stack',
            items: parseMenu(),
            currentHref: '/scouts/hire/',
        });

        const mainColumn = document.createElement('div');
        mainColumn.className = 'tmvu-scouts-hire-main tmu-page-section-stack';

        const sideColumn = document.createElement('aside');
        sideColumn.className = 'tmvu-scouts-hire-side tmu-page-rail-stack';

        mainColumn.appendChild(renderHero(summary));
        mainColumn.appendChild(renderCandidatesTable(candidates));

        sideColumn.appendChild(renderInsightsCard(summary));
        sideColumn.appendChild(renderNotesCard());

        main.appendChild(mainColumn);
        main.appendChild(sideColumn);
    };

    render();
})();