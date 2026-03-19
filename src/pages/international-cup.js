import { TmMatchHoverCard } from '../components/shared/tm-match-hover-card.js';
import { TmSectionCard } from '../components/shared/tm-section-card.js';
import { TmStandingsParser } from '../components/shared/tm-standings-parser.js';
import { TmStandingsTable } from '../components/shared/tm-standings-table.js';
import { TmTournamentPage } from '../components/shared/tm-tournament-page.js';
import { TmTournamentCards } from '../components/shared/tm-tournament-cards.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmInternationalCupService } from '../services/international-cup.js';

(function () {
    'use strict';

    if (!/^\/international-cup(?:\/coefficients)?(?:\/[^/]+)?\/?$/i.test(window.location.pathname)) return;

    const main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = main.cloneNode(true);
    const STYLE_ID = 'tmvu-international-cup-style';
    const CURRENT_SEASON = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
    const PAGE_MODE = /^\/international-cup\/coefficients(?:\/|$)/i.test(window.location.pathname) ? 'coefficients' : 'overview';
    const buildTournamentPath = (selectedId) => PAGE_MODE === 'coefficients'
        ? `/international-cup/coefficients/${selectedId}/`
        : `/international-cup/${selectedId}/`;
    const coefficientTierBreakIndexes = [];

    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const isCoefficientDebugEnabled = () => {
        try {
            return /(?:\?|&)tmvuIcDebug=1(?:&|$)/.test(window.location.search)
                || window.localStorage?.getItem('tmvu.icup.debug') === '1';
        } catch {
            return false;
        }
    };
    const coefficientDebugLog = (...args) => {
        if (!isCoefficientDebugEnabled()) return;
        console.debug('[TMVU][International Cup]', ...args);
    };
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const htmlOf = (node) => node ? node.outerHTML : '';
    const renderFlag = (country) => {
        if (typeof window.get_flag === 'function' && country) return window.get_flag(country);
        if (!country) return '';
        return `<span class="tmvu-icup-flag-fallback">${escapeHtml(String(country).toUpperCase())}</span>`;
    };

    const stripShadow = (root) => {
        if (!root) return null;
        const clone = root.cloneNode(true);
        clone.querySelectorAll('.box_shadow').forEach(node => node.remove());
        return clone;
    };

    const injectStyles = () => {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .tmvu-main.tmvu-icup-page {
                display: grid !important;
                grid-template-columns: 184px minmax(0, .95fr) 360px;
                gap: 16px;
                align-items: start;
            }

            .tmvu-main.tmvu-icup-page.tmvu-icup-page-coefficients {
                grid-template-columns: 184px minmax(0, 1fr);
            }

            .tmvu-main.tmvu-icup-page.tmvu-icup-page-coefficients .tmvu-icup-side {
                grid-column: 1 / -1;
            }

            .tmvu-icup-main,
            .tmvu-icup-side {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }

            .tmvu-icup-hero {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(220px, .52fr);
                gap: 18px;
                padding: 20px;
                border-radius: 16px;
                border: 1px solid rgba(90,126,42,.24);
                background:
                    radial-gradient(circle at top left, rgba(128,224,72,.1), rgba(128,224,72,0) 36%),
                    linear-gradient(135deg, rgba(19,34,11,.96), rgba(10,18,6,.92));
                box-shadow: 0 12px 28px rgba(0,0,0,.16);
            }

            .tmvu-icup-kicker,
            .tmvu-icup-stat-label,
            .tmvu-icup-meta-label,
            .tmvu-icup-stage .small {
                color: #7fa669;
                font-size: 10px;
                font-weight: 800;
                letter-spacing: .08em;
                text-transform: uppercase;
            }

            .tmvu-icup-title {
                color: #eef8e8;
                font-size: 30px;
                font-weight: 900;
                line-height: 1.02;
            }

            .tmvu-icup-subtitle {
                margin-top: 8px;
                color: #d9edcc;
                font-size: 15px;
                font-weight: 700;
                line-height: 1.3;
            }

            .tmvu-icup-copy {
                margin-top: 10px;
                color: #a2c089;
                font-size: 12px;
                line-height: 1.65;
                max-width: 72ch;
            }

            .tmvu-icup-actions {
                margin-top: 14px;
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }

            .tmvu-icup-btn,
            .tmvu-icup-stage .button,
            .tmvu-icup-stage .faux_link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 32px;
                padding: 0 12px;
                border-radius: 999px;
                border: 1px solid rgba(90,126,42,.3);
                background: rgba(42,74,28,.32);
                color: #e8f5d8;
                font-size: 11px;
                font-weight: 700;
                text-decoration: none;
                cursor: pointer;
            }

            .tmvu-icup-btn:hover,
            .tmvu-icup-stage .button:hover,
            .tmvu-icup-stage .faux_link:hover {
                background: rgba(108,192,64,.14);
                color: #fff;
                text-decoration: none;
            }

            .tmvu-icup-summary {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 14px;
            }

            .tmvu-icup-stat,
            .tmvu-icup-meta-card {
                padding: 12px 14px;
                border-radius: 14px;
                border: 1px solid rgba(90,126,42,.18);
                background: rgba(12,24,9,.34);
            }

            .tmvu-icup-stat {
                min-width: 110px;
            }

            .tmvu-icup-stat-value,
            .tmvu-icup-meta-value {
                margin-top: 4px;
                color: #eef8e8;
                font-size: 18px;
                font-weight: 900;
                line-height: 1.2;
            }

            .tmvu-icup-meta-copy {
                margin-top: 8px;
                color: #a2c089;
                font-size: 11px;
                line-height: 1.6;
            }

            .tmvu-icup-host .tmu-card {
                background: #16270f;
                border: 1px solid #28451d;
                border-radius: 12px;
                box-shadow: 0 0 9px #192a19;
            }

            .tmvu-icup-stage,
            .tmvu-icup-side-body {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }

            .tmvu-icup-stage h3,
            .tmvu-icup-side-body h3 {
                margin: 0;
                color: #e8f5d8;
                font-size: 14px;
                line-height: 1.35;
            }

            .tmvu-icup-stage .std,
            .tmvu-icup-side-body .std {
                color: #d6e8ca;
                font-size: 12px;
                line-height: 1.6;
            }

            .tmvu-icup-stage .std p,
            .tmvu-icup-side-body .std p {
                margin: 0 0 10px;
            }

            .tmvu-icup-stage .std p:last-child,
            .tmvu-icup-side-body .std p:last-child {
                margin-bottom: 0;
            }

            .tmvu-icup-stage a,
            .tmvu-icup-side-body a {
                color: #eef8e8;
                text-decoration: none;
            }

            .tmvu-icup-stage a:hover,
            .tmvu-icup-side-body a:hover {
                text-decoration: underline;
            }

            .tmvu-icup-stage table:not(.tsa-table),
            .tmvu-icup-side-body table:not(.tsa-table) {
                width: 100%;
                border-collapse: collapse;
                border-spacing: 0;
                overflow: hidden;
                border-radius: 10px;
                background: rgba(12,24,9,.28);
                border: 1px solid rgba(61,104,40,.18);
            }

            .tmvu-icup-stage table:not(.tsa-table) th,
            .tmvu-icup-stage table:not(.tsa-table) td,
            .tmvu-icup-side-body table:not(.tsa-table) th,
            .tmvu-icup-side-body table:not(.tsa-table) td {
                padding: 9px 8px;
                color: #d7ebc9;
                font-size: 12px;
                border: 0;
                border-bottom: 1px solid rgba(61,104,40,.14);
            }

            .tmvu-icup-stage table:not(.tsa-table) th,
            .tmvu-icup-side-body table:not(.tsa-table) th {
                background: rgba(42,74,28,.42);
                color: #eef8e8;
                font-weight: 800;
            }

            .tmvu-icup-stage table:not(.tsa-table) tr:last-child td,
            .tmvu-icup-side-body table:not(.tsa-table) tr:last-child td {
                border-bottom: none;
            }

            .tmvu-icup-stage table:not(.tsa-table) tr:nth-child(even) td,
            .tmvu-icup-side-body table:not(.tsa-table) tr:nth-child(even) td {
                background: rgba(255,255,255,.02);
            }

            .tmvu-icup-stage table:not(.tsa-table) tr.promotion th,
            .tmvu-icup-stage table:not(.tsa-table) tr.promotion_playoff th {
                background: rgba(108,192,64,.18);
            }

            .tmvu-icup-stage .match_list {
                list-style: none;
                padding: 0;
                margin: 0;
                border: 1px solid rgba(61,104,40,.18);
                border-radius: 10px;
                overflow: hidden;
            }

            .tmvu-icup-stage .match_list li {
                position: relative;
                display: grid;
                grid-template-columns: 62px minmax(0, 1fr) 62px minmax(0, 1fr);
                gap: 10px;
                align-items: center;
                padding: 10px 12px;
                margin: 0;
                line-height: 1.35;
                white-space: normal;
                border-bottom: 1px solid rgba(61,104,40,.14);
                background: rgba(12,24,9,.28);
            }

            .tmvu-icup-stage .match_list li:last-child {
                border-bottom: none;
            }

            .tmvu-icup-stage .match_list .match_date {
                position: static;
                display: inline-flex;
                align-items: center;
                justify-content: flex-start;
                width: auto;
            }

            .tmvu-icup-stage .match_list .matchtype {
                display: none;
            }

            .tmvu-icup-stage .match_list .hometeam,
            .tmvu-icup-stage .match_list .awayteam {
                width: auto;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                min-width: 0;
                overflow: hidden;
            }

            .tmvu-icup-stage .match_list .hometeam {
                justify-content: flex-end;
                text-align: right;
            }

            .tmvu-icup-stage .match_list .awayteam {
                justify-content: flex-start;
                text-align: left;
            }

            .tmvu-icup-stage .match_list .match_result {
                width: auto;
                text-align: center;
                font-size: 13px;
                font-weight: 800;
                color: #eef8e8;
            }

            .tmvu-icup-stage .match_list .match_result a {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 44px;
                padding: 4px 8px;
                border-radius: 999px;
                background: rgba(42,74,28,.32);
            }

            .tmvu-icup-note {
                padding: 10px 12px;
                background: rgba(42,74,28,.24);
                border: 1px solid rgba(61,104,40,.26);
                border-radius: 8px;
                color: #a8cb95;
                line-height: 1.55;
            }

            .tmvu-icup-flag-fallback {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 18px;
                height: 18px;
                padding: 0 4px;
                border-radius: 999px;
                background: rgba(127,166,105,.18);
                color: #eef8e8;
                font-size: 10px;
                font-weight: 800;
                line-height: 1;
                vertical-align: middle;
            }

            .tmvu-icup-tabs {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 12px;
            }

            .tmvu-icup-tab {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                min-height: 36px;
                padding: 0 14px;
                border: 1px solid rgba(90,126,42,.26);
                border-radius: 999px;
                background: rgba(18,34,12,.54);
                color: #cfe4be;
                font-size: 12px;
                font-weight: 800;
                cursor: pointer;
                transition: background .18s ease, border-color .18s ease, color .18s ease;
            }

            .tmvu-icup-tab:hover {
                background: rgba(42,74,28,.45);
                color: #eef8e8;
            }

            .tmvu-icup-tab.is-active {
                border-color: rgba(128,224,72,.34);
                background: linear-gradient(135deg, rgba(83,137,48,.42), rgba(32,58,20,.76));
                color: #fff;
                box-shadow: inset 0 0 0 1px rgba(128,224,72,.08);
            }

            .tmvu-icup-tab-panel[hidden] {
                display: none !important;
            }

            .tmvu-icup-tab-panel-copy {
                margin-bottom: 12px;
                color: #a8cb95;
                font-size: 12px;
                line-height: 1.6;
            }

            .tmvu-icup-table-shell {
                overflow-x: auto;
                border-radius: 10px;
            }

            .tmvu-icup-coeff table:not(.tsa-table) {
                min-width: 0;
                table-layout: fixed;
            }

            .tmvu-icup-coeff table:not(.tsa-table) th,
            .tmvu-icup-coeff table:not(.tsa-table) td {
                padding: 7px 5px;
                font-size: 11px;
                white-space: nowrap;
            }

            .tmvu-icup-coeff table:not(.tsa-table) th:first-child,
            .tmvu-icup-coeff table:not(.tsa-table) td:first-child {
                width: 32px;
                text-align: center;
            }

            .tmvu-icup-coeff table:not(.tsa-table) th:nth-child(2),
            .tmvu-icup-coeff table:not(.tsa-table) td:nth-child(2) {
                width: 170px;
                text-align: left;
            }

            .tmvu-icup-coeff table:not(.tsa-table) td:nth-child(2) {
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .tmvu-icup-coeff .align_center {
                text-align: center !important;
            }

            .tmvu-icup-coeff .align_right {
                text-align: right !important;
            }

            .tmvu-icup-coeff td > .country_link,
            .tmvu-icup-coeff td > a[club_link],
            .tmvu-icup-coeff td > a[href*="/club/"] {
                vertical-align: middle;
            }

            .tmvu-icup-coeff td ib[class*="flag-img-"],
            .tmvu-icup-coeff td span[class*="flag-img-"],
            .tmvu-icup-coeff td img {
                vertical-align: middle;
                margin-right: 4px;
            }

            .tmvu-icup-coeff-current {
                font-variant-numeric: tabular-nums;
            }

            .tmvu-icup-coeff-current.is-loading {
                color: #8aac72;
            }

            .tmvu-icup-coeff table:not(.tsa-table) tr.tmvu-icup-coeff-break td {
                border-top: 2px solid rgba(128,224,72,.34);
            }

            @media (max-width: 1220px) {
                .tmvu-main.tmvu-icup-page {
                    grid-template-columns: 184px minmax(0, 1fr);
                }

                .tmvu-icup-side {
                    grid-column: 1 / -1;
                }
            }

            @media (max-width: 860px) {
                .tmvu-main.tmvu-icup-page {
                    grid-template-columns: 1fr;
                }

                .tmvu-icup-hero {
                    grid-template-columns: 1fr;
                }

                .tmvu-icup-stage .match_list li {
                    grid-template-columns: 58px 1fr;
                }

                .tmvu-icup-stage .match_list .match_result {
                    grid-column: 1 / -1;
                    justify-self: center;
                }

                .tmvu-icup-tab {
                    width: 100%;
                    justify-content: space-between;
                }

            }
        `;

        document.head.appendChild(style);
    };

    const parseMenu = () => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];
        const label = cleanText(node.textContent);
        const href = node.getAttribute('href') || '#';
        let icon = '🏆';
        if (/coeff/i.test(label)) icon = '∑';
        else if (/stat/i.test(label)) icon = '📊';
        return [{ type: 'link', href, label, icon, isSelected: node.classList.contains('selected') }];
    });

    const parseTournamentState = () => {
        const overviewOptions = Array.from(sourceRoot.querySelectorAll('#change_league option')).map(option => ({
            id: String(option.value || ''),
            label: cleanText(option.textContent),
        })).filter(option => option.id && option.label);

        const coefficientSlug = window.location.pathname.match(/^\/international-cup\/coefficients\/([^/]+)\/?$/i)?.[1]?.toLowerCase() || '';
        const normalizeCoefficientKey = (value) => cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ')[0] || '';
        const coefficientOptions = Array.from(new Map(
            overviewOptions
                .map(option => {
                    const key = normalizeCoefficientKey(option.label);
                    return key ? [key, { id: key, label: key.toUpperCase() }] : null;
                })
                .filter(Boolean)
        ).values());

        const selectedId = window.location.pathname.match(/^\/international-cup\/(\d+)\/?$/i)?.[1]
            || overviewOptions.find(option => option.label === cleanText(sourceRoot.querySelector('.box_sub_header .large')?.textContent))?.id
            || (PAGE_MODE === 'coefficients' ? coefficientSlug : overviewOptions[0]?.id)
            || '';

        const overviewIds = PAGE_MODE === 'coefficients'
            ? overviewOptions
                .filter(option => normalizeCoefficientKey(option.label) === (coefficientSlug || normalizeCoefficientKey(sourceRoot.querySelector('.box_sub_header .large')?.textContent || '')))
                .map(option => option.id)
            : (selectedId ? [selectedId] : []);

        return {
            options: PAGE_MODE === 'coefficients' ? coefficientOptions : overviewOptions,
            selectedId,
            overviewIds,
        };
    };

    const parseHeader = () => {
        const box = sourceRoot.querySelector('.column2_a > .box');
        const subHeader = box?.querySelector('.box_sub_header');
        const tournamentName = cleanText(subHeader?.querySelector('.large')?.textContent || 'International Cup');
        const firstStage = cleanText(box?.querySelector('.box_body h3')?.textContent || '');
        const sections = Array.from(box?.querySelectorAll('.box_body > h3') || []);

        return {
            box,
            tournamentName,
            firstStage,
            sectionCount: sections.length,
        };
    };

    const normalizeCoefficientTable = (table, label) => {
        if (!table) return '';
        const clone = table.cloneNode(true);
        const dataRows = Array.from(clone.querySelectorAll('tbody tr')).filter(row => row.querySelectorAll('td').length);

        const applyTierBreaks = (breakIndexes) => {
            breakIndexes.forEach(index => {
                dataRows[index]?.classList.add('tmvu-icup-coeff-break');
            });
        };

        if (/country/i.test(label)) {
            coefficientTierBreakIndexes.length = 0;
            let previousQualifies = '';

            dataRows.forEach((row, index) => {
                const cells = row.querySelectorAll('td');
                const countryCell = cells[1];
                const countryAnchor = countryCell?.querySelector('a.country_link[href*="/national-teams/"]');
                const href = countryAnchor?.getAttribute('href') || '';
                const code = href.match(/\/national-teams\/([^/]+)\//)?.[1] || '';
                const qualifies = cleanText(cells[2]?.textContent || '');

                if (index > 0 && qualifies && previousQualifies && qualifies !== previousQualifies) {
                    coefficientTierBreakIndexes.push(index);
                }

                if (countryCell && code && !countryCell.querySelector('.tmvu-icup-flag-fallback')) {
                    countryCell.insertAdjacentHTML('afterbegin', `${renderFlag(code)} `);
                }
                countryAnchor?.remove();
                previousQualifies = qualifies || previousQualifies;
            });

            applyTierBreaks(coefficientTierBreakIndexes);
        } else if (/per year/i.test(label) && coefficientTierBreakIndexes.length) {
            applyTierBreaks(coefficientTierBreakIndexes);
        }

        return clone.outerHTML;
    };

    const parseCoefficientTabs = (box) => {
        const labels = new Map();
        box?.querySelectorAll('.tabs [set_active]').forEach(tab => {
            labels.set(tab.getAttribute('set_active'), cleanText(tab.textContent) || 'Tab');
        });

        return Array.from(box?.querySelectorAll('.tab_container > div[id]') || []).map((panel, index) => {
            const label = labels.get(panel.id) || `Tab ${index + 1}`;
            const paragraphs = Array.from(panel.querySelectorAll(':scope > .std > p')).map(node => `<p>${node.innerHTML}</p>`).join('');
            const tables = Array.from(panel.querySelectorAll('table')).map(table => `
                <div class="tmvu-icup-table-shell">${normalizeCoefficientTable(table, label)}</div>
            `).join('');
            return {
                id: panel.id,
                label,
                descriptionHtml: paragraphs,
                bodyHtml: `${paragraphs ? `<div class="tmvu-icup-tab-panel-copy">${paragraphs}</div>` : ''}${tables}`,
            };
        }).filter(panel => panel.bodyHtml);
    };

    const parseCoefficientClubCountryMap = (box) => {
        const labels = new Map();
        box?.querySelectorAll('.tabs [set_active]').forEach(tab => {
            labels.set(tab.getAttribute('set_active'), cleanText(tab.textContent) || 'Tab');
        });

        const clubsPanel = Array.from(box?.querySelectorAll('.tab_container > div[id]') || []).find(panel => /clubs/i.test(labels.get(panel.id) || ''));
        const clubCountryMap = {};
        if (!clubsPanel) return clubCountryMap;

        Array.from(clubsPanel.querySelectorAll('tbody tr')).forEach(row => {
            const clubAnchor = row.querySelector('a[club_link], a[href*="/club/"]');
            const cells = Array.from(row.querySelectorAll('td'));
            const countryCell = cells.find(cell => cell.querySelector('a.country_link[href*="/national-teams/"], a[href*="/national-teams/"]'))
                || cells.find(cell => cell.querySelector('.country_link, img[src*="flags/"]'))
                || cells.find(cell => !cell.querySelector('a[club_link], a[href*="/club/"]'))
                || null;
            const countryAnchor = countryCell?.querySelector('a.country_link[href*="/national-teams/"], a[href*="/national-teams/"]');
            const clubId = clubAnchor ? extractClubId(clubAnchor) : '';
            const countryLabel = countryAnchor?.textContent || countryCell?.textContent || '';
            const countryKey = TmInternationalCupService.normalizeCountryKey(countryLabel);
            if (clubId && countryKey) clubCountryMap[clubId] = countryKey;
        });

        coefficientDebugLog('club country map', {
            clubsPanelId: clubsPanel.id || '',
            mappedClubs: Object.keys(clubCountryMap).length,
            sample: Object.entries(clubCountryMap).slice(0, 6),
        });

        return clubCountryMap;
    };

    const parseContentSections = (box) => {
        const body = box?.querySelector('.box_body');
        if (!body) return [];

        const sections = [];
        let current = null;

        Array.from(body.children).forEach(node => {
            if (node.classList.contains('box_shadow') || node.classList.contains('box_sub_header') || node.id === 'change_league') return;
            if (node.tagName === 'H3') {
                current = { title: cleanText(node.textContent), nodes: [] };
                sections.push(current);
                return;
            }
            if (!current) return;
            current.nodes.push(stripShadow(node));
        });

        return sections.filter(section => section.nodes.length);
    };

    const extractClubId = (node) => {
        if (!node) return '';
        const explicit = node.getAttribute('club_link');
        if (explicit) return String(explicit);
        const href = node.getAttribute('href') || '';
        const match = href.match(/\/club\/(\d+)\//);
        return match ? match[1] : '';
    };

    const extractMatchId = (node) => {
        if (!node) return '';
        const explicit = node.getAttribute('match_link');
        if (explicit) return String(explicit);
        const href = node.getAttribute('href') || '';
        const match = href.match(/\/matches\/(\d+)\//);
        return match ? match[1] : '';
    };

    const parseMatchListItem = (item) => {
        const homeAnchor = item.querySelector('.hometeam a[club_link], .hometeam a[href*="/club/"]');
        const awayAnchor = item.querySelector('.awayteam a[club_link], .awayteam a[href*="/club/"]');
        if (!homeAnchor || !awayAnchor) return null;

        const matchDateNode = item.querySelector('.match_date');
        const scoreAnchor = item.querySelector('.match_result a[match_link], .match_result a[href*="/matches/"]');
        const scoreText = cleanText(item.querySelector('.match_result')?.textContent || '—');
        const matchId = extractMatchId(scoreAnchor);
        const scoreHref = matchId ? `/matches/${matchId}/` : '';
        const dateLabel = cleanText(
            matchDateNode?.getAttribute('tooltip')
            || matchDateNode?.getAttribute('title')
            || matchDateNode?.textContent
            || ''
        );

        return {
            roundLabel: dateLabel,
            dateLabel,
            matchId,
            scoreText,
            scoreHref,
            isPlayed: /^\d+\s*-\s*\d+$/.test(scoreText),
            isHighlight: false,
            home: {
                id: extractClubId(homeAnchor),
                name: cleanText(homeAnchor.textContent),
                href: homeAnchor.getAttribute('href') || '#',
            },
            away: {
                id: extractClubId(awayAnchor),
                name: cleanText(awayAnchor.textContent),
                href: awayAnchor.getAttribute('href') || '#',
            },
        };
    };

    const parseSidePanel = () => {
        const box = sourceRoot.querySelector('.column3_a .box');
        if (!box) return null;
        const title = cleanText(box.querySelector('.box_head h2')?.textContent || 'Tournament Notes');
        const body = stripShadow(box.querySelector('.box_body'));
        const winners = Array.from(body?.querySelectorAll('.align_center[style*="display: inline-block"]') || []).map(node => {
            const clubAnchor = node.querySelector('a[club_link], a[href*="/club/"]');
            const clone = node.cloneNode(true);
            clone.querySelectorAll('img, a[club_link], a[href*="/club/"]').forEach(el => el.remove());
            return {
                imageSrc: node.querySelector('img')?.getAttribute('src') || '',
                clubHtml: clubAnchor?.outerHTML || '',
                leagueText: cleanText(clone.textContent || ''),
            };
        });
        body?.querySelectorAll('.align_center[style*="display: inline-block"]').forEach(node => node.remove());
        return {
            title,
            winners,
            html: body ? body.innerHTML : '',
        };
    };

    const getSectionIcon = (title) => {
        if (/semi|quarter|final/i.test(title)) return '⚔';
        if (/group stage/i.test(title)) return '🌐';
        if (/qualification/i.test(title)) return '🛫';
        return '📋';
    };

    const buildMatchGroups = (nodes) => {
        const allMatches = nodes.flatMap(node => {
            if (!node || node.tagName !== 'UL' || !node.classList.contains('match_list')) return [];
            return Array.from(node.querySelectorAll('li')).map(parseMatchListItem).filter(Boolean);
        });

        return allMatches.reduce((groups, match) => {
            const boundaryKey = match.dateLabel || match.roundLabel || '';
            const lastGroup = groups[groups.length - 1];
            if (lastGroup && lastGroup.boundaryKey === boundaryKey) {
                lastGroup.matches.push(match);
                return groups;
            }
            groups.push({
                label: `Match day ${groups.length + 1}${boundaryKey ? ` · ${boundaryKey}` : ''}`,
                boundaryKey,
                matches: [match],
            });
            return groups;
        }, []);
    };

    const renderStandingsTable = (table) => {
        const groups = TmStandingsParser.parseNativeGroupedTable(table);
        if (groups.length > 1 || (groups.length === 1 && groups[0].title)) {
            return TmStandingsTable.buildGroupedHtml({ groups });
        }
        const rows = TmStandingsParser.parseNativeTable(table);
        if (!rows.length) return '';
        return `<div class="tmvu-standings-wrap">${TmStandingsTable.buildHtml({ rows })}</div>`;
    };

    const openTournamentDialog = async ({ options, selectedId }) => {
        const selected = await TmUI.modal({
            icon: '🏆',
            title: 'Change Tournament',
            message: 'Pick the tournament you want to open.',
            buttons: options.map(option => ({
                value: option.id,
                label: option.label,
                sub: option.id === selectedId ? 'Current selection' : '',
                style: option.id === selectedId ? 'primary' : 'secondary',
            })).concat([{ value: 'cancel', label: 'Cancel', style: 'danger' }]),
        });

        if (!selected || selected === 'cancel' || selected === selectedId) return;
        window.location.href = buildTournamentPath(selected);
    };

    const renderHero = (header, tournamentState, coefficients = []) => {
        const wrap = document.createElement('section');
        const tournamentLabel = tournamentState.options.find(option => option.id === tournamentState.selectedId)?.label || header.tournamentName;
        TmUI.render(wrap, `
            <div class="tmvu-icup-hero">
                <div>
                    <div class="tmvu-icup-kicker">International Competition</div>
                    <div class="tmvu-icup-title">${escapeHtml(tournamentLabel)}</div>
                    <div class="tmvu-icup-subtitle">${PAGE_MODE === 'coefficients' ? 'Country access, season trends and club ranking in one view.' : 'Continental bracket, groups, qualifiers and archive in one view.'}</div>
                    <div class="tmvu-icup-actions">
                        <button type="button" class="tmvu-icup-btn" id="tmvu-icup-change">Change tournament</button>
                    </div>
                </div>
            </div>
        `);

        wrap.querySelector('#tmvu-icup-change')?.addEventListener('click', () => openTournamentDialog(tournamentState));
        return wrap;
    };

    const renderCoefficientsCard = (panels) => {
        const host = document.createElement('section');

        TmSectionCard.mount(host, {
            title: 'Coefficients',
            icon: '∑',
            hostClass: 'tmvu-icup-host',
            bodyClass: 'tmvu-icup-stage tmvu-icup-coeff',
            bodyHtml: `
                <div class="tmvu-icup-tabs" role="tablist" aria-label="Coefficient views">
                    ${panels.map((panel, index) => `
                        <button
                            type="button"
                            class="tmvu-icup-tab${index === 0 ? ' is-active' : ''}"
                            data-tab-target="${escapeHtml(panel.id)}"
                            role="tab"
                            aria-selected="${index === 0 ? 'true' : 'false'}"
                        >
                            <span>${escapeHtml(panel.label)}</span>
                        </button>
                    `).join('')}
                </div>
                <div class="tmvu-icup-tab-panels">
                    ${panels.map((panel, index) => `
                        <section class="tmvu-icup-tab-panel" data-tab-panel="${escapeHtml(panel.id)}"${index === 0 ? '' : ' hidden'}>
                            ${panel.bodyHtml}
                        </section>
                    `).join('')}
                </div>
            `,
        });

        const tabs = Array.from(host.querySelectorAll('[data-tab-target]'));
        const panelsById = new Map(Array.from(host.querySelectorAll('[data-tab-panel]')).map(panel => [panel.getAttribute('data-tab-panel'), panel]));

        const activateTab = (targetId) => {
            tabs.forEach(tab => {
                const isActive = tab.getAttribute('data-tab-target') === targetId;
                tab.classList.toggle('is-active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });

            panelsById.forEach((panel, panelId) => {
                panel.hidden = panelId !== targetId;
            });
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => activateTab(tab.getAttribute('data-tab-target')));
        });

        if (tabs[0]) activateTab(tabs[0].getAttribute('data-tab-target'));
        return host;
    };

    const formatCoefficientValue = (value) => Number.isFinite(value) ? value.toFixed(3) : '—';

    const findCoefficientPanel = (root, labelPattern) => {
        const tab = Array.from(root.querySelectorAll('[data-tab-target]')).find(node => labelPattern.test(cleanText(node.textContent)));
        const panelId = tab?.getAttribute('data-tab-target') || '';
        return panelId ? root.querySelector(`[data-tab-panel="${panelId}"]`) : null;
    };

    const hydratePerYearCurrentSeasonColumn = ({ root, countryPoints }) => {
        const perYearPanel = findCoefficientPanel(root, /per year/i);
        const perYearTable = perYearPanel?.querySelector('table');
        if (!perYearTable) return;

        const allRows = Array.from(perYearTable.querySelectorAll('tr'));
        const seasonGroupHeader = Array.from(perYearTable.querySelectorAll('th')).find(node => /season/i.test(cleanText(node.textContent)));
        const numericHeaderRow = allRows.find(row => Array.from(row.querySelectorAll('th')).some(node => /^\d+$/.test(cleanText(node.textContent))));
        const seasonHeaders = Array.from(numericHeaderRow?.querySelectorAll('th') || []).filter(node => /^\d+$/.test(cleanText(node.textContent)));
        const totalHeader = Array.from(perYearTable.querySelectorAll('th')).find(node => /total|\d+\s*-\s*\d+/i.test(cleanText(node.textContent)));
        const nextSeason = CURRENT_SEASON ? String(CURRENT_SEASON) : (seasonHeaders.length ? String(Math.max(...seasonHeaders.map(node => Number(cleanText(node.textContent)) || 0)) + 1) : 'Current');
        const currentStart = seasonHeaders[0] ? cleanText(seasonHeaders[0].textContent) : '';
        const currentEnd = seasonHeaders.length ? cleanText(seasonHeaders[seasonHeaders.length - 1].textContent) : '';
        const rollingStart = seasonHeaders[1] ? cleanText(seasonHeaders[1].textContent) : '';
        const currentLabel = currentStart && currentEnd ? `${currentStart}-${currentEnd}` : 'Current';
        const rollingLabel = rollingStart && /^\d+$/.test(nextSeason) ? `${rollingStart}-${nextSeason}` : 'Recent 5';

        if (seasonGroupHeader && !seasonGroupHeader.dataset.tmvuCurrentSeasonGroup) {
            seasonGroupHeader.colSpan = seasonHeaders.length + 3;
            seasonGroupHeader.dataset.tmvuCurrentSeasonGroup = '1';
        }

        if (numericHeaderRow && !numericHeaderRow.querySelector('[data-tmvu-current-season-year]')) {
            const yearHeader = document.createElement('th');
            yearHeader.dataset.tmvuCurrentSeasonYear = '1';
            yearHeader.className = 'align_right';
            yearHeader.textContent = nextSeason;
            numericHeaderRow.appendChild(yearHeader);
        }

        if (totalHeader) {
            totalHeader.textContent = currentLabel;
            if (!totalHeader.dataset.tmvuCurrentWindowHeader) {
                totalHeader.dataset.tmvuCurrentWindowHeader = '1';
                totalHeader.removeAttribute('rowspan');
                numericHeaderRow?.appendChild(totalHeader);
            }
        }

        if (numericHeaderRow && !numericHeaderRow.querySelector('[data-tmvu-next-window-total]')) {
            const rollingHeader = document.createElement('th');
            rollingHeader.dataset.tmvuNextWindowTotal = '1';
            rollingHeader.className = 'align_right';
            rollingHeader.textContent = rollingLabel;
            numericHeaderRow.appendChild(rollingHeader);
        }

        Array.from(perYearTable.querySelectorAll('tbody tr')).forEach(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            if (!cells.length || row.querySelector('[data-tmvu-current-season-cell]')) return;

            const countryCell = cells[1];
            const totalCell = cells[cells.length - 1];
            const seasonCells = cells.slice(2, -1);
            const seasonValues = seasonCells.map(cell => parseFloat(cleanText(cell.textContent)) || 0);
            const countryKey = TmInternationalCupService.normalizeCountryKey(countryCell?.textContent || '');
            const currentValue = countryPoints[countryKey]?.average;
            const currentCell = document.createElement('td');
            currentCell.dataset.tmvuCurrentSeasonCell = '1';
            currentCell.className = 'align_right tmvu-icup-coeff-current';
            currentCell.textContent = formatCoefficientValue(currentValue);
            totalCell.before(currentCell);

            const nextWindowTotalCell = document.createElement('td');
            nextWindowTotalCell.dataset.tmvuNextWindowTotalCell = '1';
            nextWindowTotalCell.className = 'align_right tmvu-icup-coeff-current';
            nextWindowTotalCell.textContent = '—';
            totalCell.after(nextWindowTotalCell);

            if (Number.isFinite(currentValue)) {
                const rollingTotal = seasonValues.slice(1).reduce((sum, value) => sum + value, 0) + currentValue;
                nextWindowTotalCell.textContent = formatCoefficientValue(rollingTotal);
                nextWindowTotalCell.title = rollingLabel;
            }
        });

        coefficientDebugLog('per year hydrated', {
            countries: Object.keys(countryPoints || {}).length,
            sample: Object.entries(countryPoints || {}).slice(0, 6),
        });
    };

    const hydrateCurrentSeasonCoefficientData = async ({ root, box, tournamentId }) => {
        if (!root || !box || !tournamentId) return;
        const clubCountryMap = parseCoefficientClubCountryMap(box);
        const countryPoints = await TmInternationalCupService.calculateCurrentSeasonCountryPoints({ tournamentId, clubCountryMap });
        if (!Object.keys(countryPoints || {}).length) {
            console.warn('[TMVU][International Cup] Current-season coefficient calculation returned no country data.', {
                tournamentId,
                mappedClubs: Object.keys(clubCountryMap).length,
                debugHint: 'Set localStorage["tmvu.icup.debug"] = "1" or add ?tmvuIcDebug=1 for detailed logs.',
            });
        }
        hydratePerYearCurrentSeasonColumn({ root, countryPoints });
    };

    const renderSection = (section) => {
        const host = document.createElement('section');
        const matchGroups = buildMatchGroups(section.nodes);

        if (matchGroups.length === section.nodes.filter(Boolean).length) {
            if (matchGroups.length > 1) {
                return TmTournamentCards.renderGroupedFixturesCard({
                    title: section.title,
                    groups: matchGroups,
                }, {
                    season: CURRENT_SEASON,
                    icon: getSectionIcon(section.title),
                });
            }
            const merged = matchGroups.flatMap(group => group.matches);
            return TmTournamentCards.renderDrawCard({ title: section.title, rows: merged }, { season: CURRENT_SEASON, icon: getSectionIcon(section.title) });
        }

        let renderedGroupedFixtures = false;
        const bodyHtml = section.nodes.map(node => {
            if (!node) return '';
            if (node.tagName === 'UL' && node.classList.contains('match_list')) {
                if (matchGroups.length > 1) {
                    if (renderedGroupedFixtures) return '';
                    renderedGroupedFixtures = true;
                    return TmTournamentCards.buildGroupedFixtureList(matchGroups, { season: CURRENT_SEASON });
                }
                const matches = Array.from(node.querySelectorAll('li')).map(parseMatchListItem).filter(Boolean);
                return matches.length ? TmTournamentCards.buildFixtureList(matches, { season: CURRENT_SEASON }) : htmlOf(node);
            }
            if (node.tagName === 'TABLE') {
                return renderStandingsTable(node) || htmlOf(node);
            }
            const table = node.querySelector?.('table');
            if (table && node.children.length === 1) {
                return renderStandingsTable(table) || htmlOf(node);
            }
            return htmlOf(node);
        }).join('');
        TmSectionCard.mount(host, {
            title: section.title,
            icon: getSectionIcon(section.title),
            hostClass: 'tmvu-icup-host',
            bodyClass: 'tmvu-icup-stage',
            bodyHtml,
        });
        return host;
    };

    const renderSidePanel = (panel) => {
        return TmTournamentCards.renderHistoryCard({
            historyItems: panel.winners || [],
            paragraphs: [panel.html],
        }, {
            title: panel.title,
            icon: '🏁',
        });
    };

    const render = () => {
        injectStyles();
        TmStandingsTable.injectStyles();
        TmTournamentCards.injectStyles();
        TmMatchHoverCard.injectStyles();

        const header = parseHeader();
        if (!header.box) return;

        const sections = PAGE_MODE === 'coefficients' ? [] : parseContentSections(header.box);
        const coefficientPanels = PAGE_MODE === 'coefficients' ? parseCoefficientTabs(header.box) : [];
        const sidePanel = parseSidePanel();
        const tournamentState = parseTournamentState();

        const emptySideNote = (() => {
            if (sidePanel) return null;
            const note = document.createElement('section');
            note.className = 'tmvu-icup-note';
            note.textContent = 'Tournament side information was not available on the source page.';
            return note;
        })();

        TmTournamentPage.mount(main, {
            pageClass: PAGE_MODE === 'coefficients' ? 'tmvu-icup-page tmvu-icup-page-coefficients' : 'tmvu-icup-page',
            navId: 'tmvu-icup-nav',
            navClass: 'tmvu-icup-nav',
            menuItems: parseMenu(),
            currentHref: window.location.pathname,
            mainClass: 'tmvu-icup-main',
            sideClass: 'tmvu-icup-side',
            mainNodes: PAGE_MODE === 'coefficients'
                ? [renderHero(header, tournamentState, coefficientPanels), renderCoefficientsCard(coefficientPanels)]
                : [renderHero(header, tournamentState), ...sections.map(renderSection)],
            sideNodes: [sidePanel ? renderSidePanel(sidePanel) : null, emptySideNote],
            season: CURRENT_SEASON,
        });

        if (PAGE_MODE === 'coefficients') {
            hydrateCurrentSeasonCoefficientData({ root: main, box: header.box, tournamentIds: tournamentState.overviewIds });
        }
    };

    render();
})();