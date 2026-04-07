import { TmHeroCard } from './tm-hero-card.js';
import { TmSectionCard } from './tm-section-card.js';
import { TmTable } from './tm-table.js';
import { TmTournamentPage } from './tm-tournament-page.js';
import { TmTournamentCards } from './tm-tournament-cards.js';
import { TmUI } from './tm-ui.js';
import { TmInternationalCupService } from '../../services/international-cup.js';

export function mountInternationalCupCoefficientsPage(main) {
    if (!main) main = document.querySelector('.tmvu-main, .main_center');
    if (!main) return;

    const sourceRoot = (document.querySelector('.main_center') || main).cloneNode(true);
    const STYLE_ID = 'tmvu-international-cup-coefficients-style';
    const CURRENT_SEASON = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
    const coefficientTierBreakIndexes = [];
    let activeCoefficientGroup = null;
    const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
    const htmlOf = (node) => node ? node.outerHTML : '';
    const COEFFICIENT_GROUPS = [
        { slug: 'fita', label: 'FITA (Global)', overviewIds: ['1', '2', '3', '4', '5', '6'], matchIds: [], aliases: ['fita', 'global', 'world', 'globalno'], hasQualificationTiers: false },
        { slug: 'ueta', label: 'UETA', overviewIds: ['1', '2'], matchIds: ['1', '2'], aliases: ['ueta'], hasQualificationTiers: true },
        { slug: 'row', label: 'ROW', overviewIds: ['3', '4'], matchIds: ['3', '4'], aliases: ['row', 'fita row'], hasQualificationTiers: true },
        { slug: 'fata', label: 'FATA', overviewIds: ['5', '6'], matchIds: ['5', '6'], aliases: ['fata', 'liberty', 'americana'], hasQualificationTiers: true },
    ];
    const findCoefficientGroup = (value) => {
        const normalized = cleanText(value).toLowerCase();
        if (!normalized) return null;
        return COEFFICIENT_GROUPS.find(group => normalized === group.slug
            || group.matchIds.includes(normalized)
            || normalized.includes(group.slug)
            || normalized.includes(group.label.toLowerCase())
            || group.aliases.some(alias => normalized.includes(alias)));
    };
    const getCountryKeyFromNode = (node) => {
        if (!node) return '';
        const countryAnchor = node.matches?.('a.country_link[href*="/national-teams/"], a[href*="/national-teams/"]')
            ? node
            : node.querySelector?.('a.country_link[href*="/national-teams/"], a[href*="/national-teams/"]');
        const href = countryAnchor?.getAttribute('href') || '';
        const code = href.match(/\/national-teams\/([^/]+)\//)?.[1] || '';
        return TmInternationalCupService.normalizeCountryKey(code || countryAnchor?.textContent || node.textContent || '');
    };
    const escapeHtml = (value) => String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const renderFlag = (country) => {
        if (typeof window.get_flag === 'function' && country) return window.get_flag(country);
        if (!country) return '';
        return `<span class="tmvu-icup-flag-fallback">${escapeHtml(String(country).toUpperCase())}</span>`;
    };
    const isDebugEnabled = () => {
        try {
            return /(?:\?|&)tmvuIcDebug=1(?:&|$)/.test(window.location.search)
                || window.localStorage?.getItem('tmvu.icup.debug') === '1';
        } catch {
            return false;
        }
    };
    const debugLog = (...args) => {
        if (!isDebugEnabled()) return;
        console.debug('[TMVU][International Cup Coefficients]', ...args);
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
            .tmvu-main.tmvu-icup-page.tmvu-icup-page-coefficients {
                display: grid !important;
                grid-template-columns: 184px minmax(0, 1fr);
                gap: var(--tmu-space-lg);
                align-items: start;
            }

            .tmvu-main.tmvu-icup-page.tmvu-icup-page-coefficients .tmvu-icup-side {
                grid-column: 1 / -1;
            }

            .tmvu-icup-main,
            .tmvu-icup-side {
                min-width: 0;
                display: flex;
                flex-direction: column;
                gap: var(--tmu-space-lg);
            }

            .tmvu-icup-stage,
            .tmvu-icup-side-body {
                display: flex;
                flex-direction: column;
                gap: var(--tmu-space-md);
            }

            .tmvu-icup-flag-fallback {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 18px;
                height: 18px;
                padding: 0 var(--tmu-space-xs);
                border-radius: 999px;
                background: var(--tmu-success-fill-hover);
                color: var(--tmu-text-strong);
                font-size: var(--tmu-font-xs);
                font-weight: 800;
                line-height: 1;
                vertical-align: middle;
            }

            .tmvu-icup-coeff .tmu-tabs {
                margin-bottom: var(--tmu-space-md);
            }

            .tmvu-icup-tab-panel[hidden] {
                display: none !important;
            }

            .tmvu-icup-tab-panel-copy {
                margin-bottom: var(--tmu-space-md);
                color: var(--tmu-text-main);
                font-size: var(--tmu-font-sm);
                line-height: 1.6;
            }

            .tmvu-icup-table-shell {
                overflow-x: auto;
                border-radius: var(--tmu-space-md);
                border: 1px solid var(--tmu-border-contrast);
            }

            .tmvu-icup-coeff table:not(.tsa-table) {
                min-width: 0;
                table-layout: fixed;
                border-collapse: collapse;
            }

            .tmvu-icup-coeff table:not(.tsa-table) th,
            .tmvu-icup-coeff table:not(.tsa-table) td {
                padding: var(--tmu-space-sm) var(--tmu-space-xs);
                font-size: var(--tmu-font-xs);
                white-space: nowrap;
                border-bottom: 1px solid var(--tmu-border-contrast);
            }

            .tmvu-icup-coeff table:not(.tsa-table) thead th {
                border-bottom: 1px solid var(--tmu-border-input-overlay);
            }

            .tmvu-icup-coeff table:not(.tsa-table) tbody tr:last-child td {
                border-bottom: none;
            }

            .tmvu-icup-coeff table:not(.tsa-table) th:first-child,
            .tmvu-icup-coeff table:not(.tsa-table) td:first-child {
                width: 32px;
                text-align: center;
            }

            .tmvu-icup-coeff table:not(.tsa-table) th:nth-child(2),
            .tmvu-icup-coeff table:not(.tsa-table) td:nth-child(2) {
                width: 135px;
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

            .tmvu-icup-coeff th.tmvu-icup-sortable {
                cursor: pointer;
                user-select: none;
            }

            .tmvu-icup-coeff th.tmvu-icup-sortable:hover {
                color: var(--tmu-text-strong);
            }

            .tmvu-icup-coeff th.tmvu-icup-sortable::after {
                content: '⇅';
                margin-left: var(--tmu-space-sm);
                color: var(--tmu-text-muted);
                font-size: var(--tmu-font-xs);
            }

            .tmvu-icup-coeff th.tmvu-icup-sortable[data-sort-direction="asc"]::after {
                content: '↑';
                color: var(--tmu-text-strong);
            }

            .tmvu-icup-coeff th.tmvu-icup-sortable[data-sort-direction="desc"]::after {
                content: '↓';
                color: var(--tmu-text-strong);
            }

            .tmvu-icup-coeff-current {
                font-variant-numeric: tabular-nums;
            }

            .tmvu-icup-coeff table:not(.tsa-table) tr.tmvu-icup-coeff-break td {
                border-top: 2px solid var(--tmu-border-success);
            }

            .tmvu-icup-coeff .tmu-tbl {
                min-width: 0;
                table-layout: fixed;
                margin-bottom: 0;
            }

            .tmvu-icup-coeff .tmu-tbl.tmvu-icup-clubs-table {
                width: max-content;
                min-width: 100%;
                table-layout: auto;
            }

            .tmvu-icup-coeff .tmu-tbl.tmvu-icup-per-year-table th:nth-child(2),
            .tmvu-icup-coeff .tmu-tbl.tmvu-icup-per-year-table td:nth-child(2) {
                min-width: 220px;
            }

            .tmvu-icup-coeff .tmu-tbl thead th,
            .tmvu-icup-coeff .tmu-tbl tbody td {
                font-size: var(--tmu-font-xs);
                padding: var(--tmu-space-sm) var(--tmu-space-xs);
                white-space: nowrap;
            }

            .tmvu-icup-coeff .tmu-tbl thead th {
                color: var(--tmu-text-strong);
                border-bottom-color: var(--tmu-border-input-overlay);
                text-transform: none;
                letter-spacing: 0;
            }

            .tmvu-icup-coeff .tmu-tbl tbody td {
                border-bottom-color: var(--tmu-border-contrast);
            }

            .tmvu-icup-coeff .tmu-tbl thead .tmu-grp-row th {
                color: var(--tmu-text-strong);
                border-bottom-color: var(--tmu-border-input-overlay);
                border-right-color: var(--tmu-border-contrast);
                background: var(--tmu-surface-overlay);
            }

            .tmvu-icup-coeff .tmu-tbl th:first-child,
            .tmvu-icup-coeff .tmu-tbl td:first-child {
                width: 32px;
                text-align: center;
            }

            .tmvu-icup-coeff .tmu-tbl th:nth-child(2),
            .tmvu-icup-coeff .tmu-tbl td:nth-child(2) {
                min-width: 170px;
                text-align: left;
            }

            .tmvu-icup-coeff .tmu-tbl td:nth-child(2) {
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .tmvu-icup-coeff .tmu-tbl tbody tr.tmvu-icup-coeff-break td {
                border-top: 2px solid var(--tmu-border-success);
            }
        `;
        document.head.appendChild(style);
    };

    const parseMenu = (tournamentState) => Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];
        const label = cleanText(node.textContent);
        const href = node.getAttribute('href') || '#';
        const resolvedHref = /coeff/i.test(label)
            ? `/international-cup/coefficients/${tournamentState.selectedId}/`
            : href;
        let icon = '🏆';
        if (/coeff/i.test(label)) icon = '∑';
        else if (/stat/i.test(label)) icon = '📊';
        return [{ type: 'link', href: resolvedHref, label, icon, isSelected: node.classList.contains('selected') }];
    });

    const parseTournamentState = (tournamentName) => {
        const coefficientToken = window.location.pathname.match(/^\/international-cup\/coefficients\/([^/]+)\/?$/i)?.[1]?.toLowerCase() || '';
        const selectedMenuLink = sourceRoot.querySelector('.column1 .content_menu a.selected');
        const selectedGroup = findCoefficientGroup(coefficientToken)
            || findCoefficientGroup(tournamentName)
            || findCoefficientGroup(selectedMenuLink?.getAttribute('href') || '')
            || COEFFICIENT_GROUPS[0];
        const coefficientOptions = COEFFICIENT_GROUPS.map(group => ({
            id: group.slug,
            label: group.label,
            overviewIds: group.overviewIds.slice(),
        }));
        const selectedId = selectedGroup?.slug || coefficientOptions[0]?.id || '';
        const overviewIds = selectedGroup?.overviewIds?.slice() || [];
        activeCoefficientGroup = selectedGroup || null;
        debugLog('Parsed tournament options', { coefficientOptions, coefficientToken, selectedId, overviewIds });
        return { options: coefficientOptions, selectedId, overviewIds };
    };

    const parseHeader = () => {
        const box = sourceRoot.querySelector('.column2_a > .box');
        const subHeader = box?.querySelector('.box_sub_header');
        const tournamentName = cleanText(subHeader?.querySelector('.large')?.textContent || 'International Cup');
        return { box, tournamentName };
    };

    const normalizeCoefficientTable = (table, label) => {
        if (!table) return '';
        const clone = table.cloneNode(true);
        clone.dataset.tmvuTableLabel = label;
        const dataRows = Array.from(clone.querySelectorAll('tbody tr'))
            .map(row => ({ row, cells: Array.from(row.querySelectorAll('td')) }))
            .filter(({ cells }) => cells.length);

        const applyTierBreaks = (breakIndexes) => {
            breakIndexes.forEach(index => {
                if (!dataRows[index]) return;
                dataRows[index].row.dataset.tmvuBreakBefore = '1';
                dataRows[index].row.classList.add('tmvu-icup-coeff-break');
            });
        };

        const shouldApplyQualificationTiers = activeCoefficientGroup?.hasQualificationTiers !== false;

        if (/country/i.test(label)) {
            coefficientTierBreakIndexes.length = 0;
            let previousQualifies = '';

            dataRows.forEach(({ cells }, index) => {
                const countryCell = cells[1];
                const countryAnchor = countryCell?.querySelector('a.country_link[href*="/national-teams/"]');
                const href = countryAnchor?.getAttribute('href') || '';
                const code = href.match(/\/national-teams\/([^/]+)\//)?.[1] || '';
                const qualifies = cleanText(cells[2]?.textContent || '');

                if (shouldApplyQualificationTiers && index > 0 && qualifies && previousQualifies && qualifies !== previousQualifies) {
                    coefficientTierBreakIndexes.push(index);
                }

                if (countryCell && code && !countryCell.querySelector('.tmvu-icup-flag-fallback')) {
                    countryCell.insertAdjacentHTML('afterbegin', `${renderFlag(code)} `);
                }
                countryAnchor?.remove();
                previousQualifies = qualifies || previousQualifies;
            });

            if (shouldApplyQualificationTiers) {
                applyTierBreaks(coefficientTierBreakIndexes);
            }
        } else if (/per year/i.test(label) && shouldApplyQualificationTiers && coefficientTierBreakIndexes.length) {
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
                bodyHtml: `${paragraphs ? `<div class="tmvu-icup-tab-panel-copy">${paragraphs}</div>` : ''}${tables}`,
            };
        }).filter(panel => panel.bodyHtml);
    };

    const openTournamentDialog = async ({ options, selectedId }) => {
        const selected = await TmUI.modal({
            icon: '🏆',
            title: 'Change Tournament',
            message: 'Pick the coefficient group you want to open.',
            buttons: options.map(option => ({
                value: option.id,
                label: option.label,
                sub: option.id === selectedId ? 'Current selection' : '',
                style: option.id === selectedId ? 'primary' : 'secondary',
            })).concat([{ value: 'cancel', label: 'Cancel', style: 'danger' }]),
        });

        if (!selected || selected === 'cancel' || selected === selectedId) return;
        window.location.href = `/international-cup/coefficients/${selected}/`;
    };

    const renderHero = (header, tournamentState) => {
        const wrap = document.createElement('section');
        const tournamentLabel = tournamentState.options.find(option => option.id === tournamentState.selectedId)?.label || header.tournamentName;
        TmHeroCard.mount(wrap, {
            slots: {
                kicker: 'International Competition',
                title: escapeHtml(tournamentLabel),
                actions: TmHeroCard.button({
                    id: 'tmvu-icup-change',
                    label: 'Change tournament',
                }),
            },
        });

        wrap.onclick = (event) => {
            if (!event.target.closest('#tmvu-icup-change')) return;
            openTournamentDialog(tournamentState);
        };
        return wrap;
    };

    const renderCoefficientsCard = (panels) => {
        const host = document.createElement('section');
        const tabsNode = TmUI.tabs({
            items: panels.map(panel => ({ key: panel.id, label: panel.label })),
            active: panels[0]?.id,
            color: 'primary',
            stretch: true,
        });
        tabsNode.setAttribute('role', 'tablist');
        tabsNode.setAttribute('aria-label', 'Coefficient views');
        tabsNode.querySelectorAll('.tmu-tab').forEach(tab => {
            tab.setAttribute('role', 'tab');
            tab.setAttribute('data-tab-target', tab.dataset.tab || '');
        });
        TmSectionCard.mount(host, {
            title: 'Coefficients',
            icon: '∑',
            cardVariant: 'soft',
            hostClass: 'tmvu-icup-host',
            bodyClass: 'tmvu-icup-stage tmvu-icup-coeff',
            bodyHtml: `
                ${htmlOf(tabsNode)}
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
                tab.classList.toggle('active', isActive);
                tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
            panelsById.forEach((panel, panelId) => {
                panel.hidden = panelId !== targetId;
            });
        };
        host.onclick = (event) => {
            const tab = event.target.closest('[data-tab-target]');
            if (!tab || !host.contains(tab)) return;
            activateTab(tab.getAttribute('data-tab-target'));
        };
        if (tabs[0]) activateTab(tabs[0].getAttribute('data-tab-target'));
        return host;
    };

    const parseCellSortValue = (cell) => {
        const text = cleanText(cell?.textContent || '');
        if (!text || text === '—') return { type: 'empty', value: '' };
        const normalizedNumber = text.replace(/,/g, '');
        if (/^-?\d+(?:\.\d+)?$/.test(normalizedNumber)) {
            return { type: 'number', value: Number(normalizedNumber) };
        }
        return { type: 'text', value: text.toLowerCase() };
    };

    const getCellAlign = (cell) => {
        if (!cell) return 'l';
        if (cell.classList.contains('align_right') || cell.classList.contains('r')) return 'r';
        if (cell.classList.contains('align_center') || cell.classList.contains('c')) return 'c';
        return 'l';
    };

    const buildHeaderMatrix = (headerRows) => {
        const matrix = [];
        let totalColumns = 0;

        headerRows.forEach((row, rowIndex) => {
            if (!matrix[rowIndex]) matrix[rowIndex] = [];
            let columnIndex = 0;

            Array.from(row.querySelectorAll('th')).forEach(cell => {
                while (matrix[rowIndex][columnIndex]) columnIndex += 1;

                const colspan = Number(cell.getAttribute('colspan') || '1') || 1;
                const rowspan = Number(cell.getAttribute('rowspan') || '1') || 1;

                for (let rowOffset = 0; rowOffset < rowspan; rowOffset += 1) {
                    if (!matrix[rowIndex + rowOffset]) matrix[rowIndex + rowOffset] = [];
                    for (let columnOffset = 0; columnOffset < colspan; columnOffset += 1) {
                        matrix[rowIndex + rowOffset][columnIndex + columnOffset] = {
                            cell,
                            isOrigin: rowOffset === 0 && columnOffset === 0,
                            rowIndex,
                            colspan,
                            rowspan,
                        };
                    }
                }

                columnIndex += colspan;
                totalColumns = Math.max(totalColumns, columnIndex);
            });
        });

        return { matrix, totalColumns };
    };

    const buildGroupHeaderRows = (matrix, totalColumns) => {
        if (!matrix.length) return [];

        return matrix.slice(0, -1).map((rowEntries, rowIndex) => {
            const cells = [];
            let pendingBlankColspan = 0;
            const flushPendingBlankCells = () => {
                while (pendingBlankColspan > 0) {
                    cells.push({ label: '', colspan: 1 });
                    pendingBlankColspan -= 1;
                }
            };

            for (let columnIndex = 0; columnIndex < totalColumns; columnIndex += 1) {
                const entry = rowEntries?.[columnIndex];
                if (!entry?.isOrigin) continue;

                const isRowspanLeadCell = entry.rowspan > 1 && rowIndex < matrix.length - 1;
                if (isRowspanLeadCell) {
                    pendingBlankColspan += entry.colspan;
                    continue;
                }

                if (pendingBlankColspan > 0) {
                    flushPendingBlankCells();
                }

                cells.push({
                    label: cleanText(entry.cell.textContent),
                    colspan: entry.colspan,
                    rowspan: entry.rowspan,
                });
            }

            if (pendingBlankColspan > 0) {
                flushPendingBlankCells();
            }

            return cells.length ? { cls: 'tmu-grp-row', cells } : null;
        }).filter(Boolean);
    };

    const buildSortableTableFromNative = (table) => {
        if (!table) return null;
        const tableLabel = cleanText(table.dataset.tmvuTableLabel || '');
        const headerRows = Array.from(table.querySelectorAll('tr')).filter(row => row.querySelectorAll('th').length);
        if (!headerRows.length) return null;

        const { matrix, totalColumns } = buildHeaderMatrix(headerRows);
        if (!totalColumns) return null;

        const leafHeaders = Array.from({ length: totalColumns }, (_, columnIndex) => {
            for (let rowIndex = matrix.length - 1; rowIndex >= 0; rowIndex -= 1) {
                const entry = matrix[rowIndex]?.[columnIndex];
                if (!entry) continue;
                const { cell } = entry;
                return {
                    label: cleanText(cell.textContent),
                    align: getCellAlign(cell),
                };
            }
            return { label: '', align: 'l' };
        });
        const shouldPrependIndex = leafHeaders[0]?.label === '#';
        const headerOffset = shouldPrependIndex ? 1 : 0;

        const groupHeaders = buildGroupHeaderRows(matrix, totalColumns);

        const headers = leafHeaders.slice(headerOffset).map((header, index) => ({
            key: `col${index}`,
            label: header.label,
            align: header.align,
            sortable: !!header.label,
            width: index === 0 ? '170px' : '',
            render: (_, item) => item.__html[index] || '',
        }));

        const yearColumnIndexes = headers
            .map((header, index) => ({ index, label: header.label }))
            .filter(({ label }) => /^\d+$/.test(label))
            .map(({ index }) => index);
        const rangeColumnIndexes = headers
            .map((header, index) => ({ index, label: header.label }))
            .filter(({ label }) => /^\d+\s*-\s*\d+$/.test(label))
            .map(({ index }) => index);
        const currentWindowIndex = rangeColumnIndexes[0] ?? -1;
        const rollingWindowIndex = rangeColumnIndexes[1] ?? -1;
        const formatTableNumber = (value) => Number.isFinite(value) ? value.toFixed(3) : '—';
        const bodyRows = Array.from(table.querySelectorAll('tbody tr'))
            .map(row => ({ row, cells: Array.from(row.querySelectorAll('td')) }))
            .filter(({ cells }) => cells.length);
        const breakRowIndexes = new Set(
            bodyRows
                .map(({ row }, rowIndex) => row.dataset.tmvuBreakBefore === '1' || row.classList.contains('tmvu-icup-coeff-break') ? rowIndex : -1)
                .filter(index => index > 0)
        );

        const items = bodyRows.map(({ cells }, rowIndex) => {
            const item = {
                __html: [],
                __rowIndex: rowIndex,
            };

            cells.slice(headerOffset).forEach((cell, index) => {
                const key = `col${index}`;
                const parsed = parseCellSortValue(cell);
                item[key] = parsed.type === 'number' ? parsed.value : parsed.value;
                item.__html[index] = cell.innerHTML;
            });

            if (yearColumnIndexes.length >= 2) {
                const yearValues = yearColumnIndexes.map(index => {
                    const value = Number(item[`col${index}`]);
                    return Number.isFinite(value) ? value : 0;
                });

                if (currentWindowIndex >= 0 && !cleanText(item.__html[currentWindowIndex] || '')) {
                    const currentWindowValue = yearValues.slice(0, -1).reduce((sum, value) => sum + value, 0);
                    item[`col${currentWindowIndex}`] = currentWindowValue;
                    item.__html[currentWindowIndex] = formatTableNumber(currentWindowValue);
                }

                if (rollingWindowIndex >= 0 && !cleanText(item.__html[rollingWindowIndex] || '')) {
                    const rollingWindowValue = yearValues.slice(1).reduce((sum, value) => sum + value, 0);
                    item[`col${rollingWindowIndex}`] = rollingWindowValue;
                    item.__html[rollingWindowIndex] = formatTableNumber(rollingWindowValue);
                }
            }

            return item;
        });

        const defaultSortKey = (() => {
            if (/country/i.test(tableLabel)) {
                return headers.find(header => /coefficient/i.test(header.label))?.key || null;
            }
            if (/per year/i.test(tableLabel)) {
                return headers.find(header => /^83\s*-\s*87$/.test(header.label))?.key || null;
            }
            if (/clubs/i.test(tableLabel)) {
                return headers.find(header => /points/i.test(header.label))?.key || null;
            }
            return null;
        })();
        const tableClass = [
            /clubs/i.test(tableLabel) ? 'tmvu-icup-clubs-table' : '',
            /per year/i.test(tableLabel) ? 'tmvu-icup-per-year-table' : '',
        ].filter(Boolean).join(' ');

        return TmTable.table({
            headers,
            items,
            groupHeaders,
            sortKey: defaultSortKey,
            sortDir: defaultSortKey ? -1 : 1,
            cls: tableClass,
            prependIndex: shouldPrependIndex,
            rowCls: (_, sortedIndex) => breakRowIndexes.has(sortedIndex) ? 'tmvu-icup-coeff-break' : '',
        });
    };

    const upgradeCoefficientTables = (root) => {
        root.querySelectorAll('.tmvu-icup-table-shell').forEach(shell => {
            if (shell.dataset.tmvuTableUpgraded === '1') return;
            const nativeTable = shell.querySelector('table:not(.tmu-tbl):not(.tsa-table)');
            if (!nativeTable) return;
            const sortableTable = buildSortableTableFromNative(nativeTable);
            if (!sortableTable) return;
            shell.innerHTML = '';
            shell.appendChild(sortableTable);
            shell.dataset.tmvuTableUpgraded = '1';
        });
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
            const countryKey = getCountryKeyFromNode(countryCell);
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
    };

    const hydrateCurrentSeasonCoefficientData = async ({ root, box, tournamentIds = [] }) => {
        if (!root || !box) return;
        if (tournamentIds?.length) {
            const countryPoints = await TmInternationalCupService.calculateCurrentSeasonCountryPoints({ tournamentIds });
            if (!Object.keys(countryPoints || {}).length) {
                console.warn('[TMVU][International Cup] Current-season coefficient calculation returned no country data.', {
                    tournamentIds,
                });
            }
            hydratePerYearCurrentSeasonColumn({ root, countryPoints });
        }
        upgradeCoefficientTables(root);
    };

    const parseSidePanel = () => {
        const box = sourceRoot.querySelector('.column3_a .box');
        if (!box) return null;
        const title = cleanText(box.querySelector('.box_head h2')?.textContent || 'Tournament Notes');
        const body = stripShadow(box.querySelector('.box_body'));
        return {
            title,
            winners: [],
            html: body ? body.innerHTML : '',
        };
    };

    const renderSidePanel = (panel) => TmTournamentCards.renderHistoryCard({
        historyItems: panel.winners || [],
        paragraphs: [panel.html],
    }, {
        title: panel.title,
        icon: '🏁',
    });

    injectStyles();
    TmTournamentCards.injectStyles();

    const header = parseHeader();
    if (!header.box) return;

    const coefficientPanels = parseCoefficientTabs(header.box);
    const sidePanel = parseSidePanel();
    const tournamentState = parseTournamentState(header.tournamentName);
    const emptySideNote = sidePanel ? null : TmUI.noticeElement('Tournament side information was not available on the source page.', {
        tag: 'section',
        tone: 'muted',
    });

    TmTournamentPage.mount(main, {
        pageClass: 'tmvu-icup-page tmvu-icup-page-coefficients',
        navId: 'tmvu-icup-nav',
        navClass: 'tmvu-icup-nav',
        menuItems: parseMenu(tournamentState),
        currentHref: `/international-cup/coefficients/${tournamentState.selectedId}/`,
        mainClass: 'tmvu-icup-main',
        sideClass: 'tmvu-icup-side',
        mainNodes: [renderHero(header, tournamentState), renderCoefficientsCard(coefficientPanels)],
        sideNodes: [sidePanel ? renderSidePanel(sidePanel) : null, emptySideNote],
        season: CURRENT_SEASON,
    });

    hydrateCurrentSeasonCoefficientData({ root: main, box: header.box, tournamentIds: tournamentState.overviewIds });
}
