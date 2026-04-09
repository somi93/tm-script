import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { mountNationalTeamsSideMenu } from '../components/national-teams/tm-national-teams-side-menu.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { TmNationalTeamsService } from '../services/national-teams.js';

const STYLE_ID = 'tmvu-national-teams-election-style';

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const toNumber = (value) => Number.parseInt(String(value || ''), 10);
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const extractCountryCode = (root) => root
    ?.querySelector('.content_menu a[href^="/national-teams/"]')
    ?.getAttribute('href')
    ?.match(/\/national-teams\/([a-z]{2,3})\//i)?.[1]?.toLowerCase() || '';

const makeFlagHtml = (suffix) => suffix ? `<ib class="flag-img-${escapeHtml(String(suffix).toLowerCase())}"></ib>` : '';

const parseActionCall = (onclick, actionName) => {
    const pattern = actionName === 'nomination_respond'
        ? /nomination_respond\(\s*['"]([^'"]+)['"]\s*,\s*(\d+)\s*,\s*(?:true|false)\s*\)/i
        : /election_vote\(\s*(\d+)\s*,\s*(?:true|false)\s*\)/i;
    const match = String(onclick || '').match(pattern);
    if (!match) return null;
    return actionName === 'nomination_respond'
        ? { country: match[1], response: toNumber(match[2]) }
        : { clubId: toNumber(match[1]) };
};

const normalizeElectionSuggestions = (clubs) => {
    if (!clubs) return [];

    const normalizeItem = (rawValue, rawLabel) => {
        if (rawValue == null && rawLabel == null) return null;
        if (Array.isArray(rawValue)) {
            const [id, label, countrySuffix] = rawValue;
            return {
                id: toNumber(id),
                label: cleanText(label || id),
                countrySuffix: cleanText(countrySuffix || ''),
            };
        }
        if (typeof rawValue === 'object') {
            const id = toNumber(rawValue.value ?? rawValue.id ?? rawValue.club_id ?? rawLabel);
            return {
                id,
                label: cleanText(rawValue.label ?? rawValue.name ?? rawValue.club_name ?? rawLabel ?? id),
                countrySuffix: cleanText(rawValue.country_suffix ?? rawValue.country ?? rawValue.flag ?? ''),
            };
        }
        return {
            id: toNumber(rawValue),
            label: cleanText(rawLabel ?? rawValue),
            countrySuffix: '',
        };
    };

    const normalized = Array.isArray(clubs)
        ? clubs.map(item => normalizeItem(item))
        : Object.entries(clubs).map(([value, label]) => normalizeItem(value, label));

    return normalized.filter(item => item?.id && item.label);
};

const refreshElectionPage = () => {
    if (typeof window.page_refresh === 'function') {
        window.page_refresh();
        return;
    }
    window.location.reload();
};

const showErrorModal = (message) => TmUI.modal({
    title: 'National coach election',
    message: escapeHtml(message || 'Request failed.'),
    buttons: [{ label: 'OK', value: 'ok', style: 'primary', size: 'lg' }],
});

const handleNominationSelection = async (clubId) => {
    if (!clubId) return;
    const data = await TmNationalTeamsService.fetchElectionNomination(clubId);
    if (!data?.success) {
        await showErrorModal(data?.error || 'Could not load nomination details.');
        return;
    }

    const choice = await TmUI.modal({
        title: 'Submit Nomination',
        message: `Nominate <strong>${escapeHtml(data.club_name || `Club #${clubId}`)}</strong> for <strong>${makeFlagHtml(data.country_suffix)} ${escapeHtml(data.country || '')}</strong>?`,
        buttons: [
            { label: 'Nominate', value: 'confirm', style: 'primary', size: 'lg' },
            { label: 'Cancel', value: 'cancel', style: 'secondary', size: 'lg' },
        ],
    });
    if (choice !== 'confirm') return;

    const result = await TmNationalTeamsService.addElectionNomination(clubId);
    if (!result?.success) {
        await showErrorModal(result?.error || 'Nomination failed.');
        return;
    }

    await TmUI.modal({
        title: 'Submit Nomination',
        message: `${escapeHtml(result.club_name || data.club_name || `Club #${clubId}`)} was nominated successfully.`,
        buttons: [{ label: 'OK', value: 'ok', style: 'primary', size: 'lg' }],
    });
    refreshElectionPage();
};

const handleNominationResponse = async ({ country, response }) => {
    if (!country || !response) return;
    const accept = response === 1;
    const choice = await TmUI.modal({
        title: 'National coach election',
        message: `${accept ? 'Accept' : 'Reject'} nomination for <strong>${escapeHtml(country.toUpperCase())}</strong>?`,
        buttons: [
            { label: accept ? 'Accept' : 'Reject', value: 'confirm', style: accept ? 'primary' : 'danger', size: 'lg' },
            { label: 'Cancel', value: 'cancel', style: 'secondary', size: 'lg' },
        ],
    });
    if (choice !== 'confirm') return;

    const result = await TmNationalTeamsService.respondToElectionNomination(country, response);
    if (!result?.success) {
        await showErrorModal(result?.error || 'Response failed.');
        return;
    }

    await TmUI.modal({
        title: 'National coach election',
        message: accept ? 'Nomination accepted.' : 'Nomination rejected.',
        buttons: [{ label: 'OK', value: 'ok', style: 'primary', size: 'lg' }],
    });
    refreshElectionPage();
};

const handleVote = async (clubId) => {
    if (!clubId) return;
    const data = await TmNationalTeamsService.fetchElectionVote(clubId);
    if (!data?.success) {
        await showErrorModal(data?.error || 'Could not load vote details.');
        return;
    }

    const choice = await TmUI.modal({
        title: 'Vote',
        message: `Vote for <strong>${escapeHtml(data.club_name || `Club #${clubId}`)}</strong> ${makeFlagHtml(data.country)}?`,
        buttons: [
            { label: 'Vote', value: 'confirm', style: 'primary', size: 'lg' },
            { label: 'Cancel', value: 'cancel', style: 'secondary', size: 'lg' },
        ],
    });
    if (choice !== 'confirm') return;

    const result = await TmNationalTeamsService.addElectionVote(clubId);
    if (!result?.success) {
        await showErrorModal(result?.error || 'Vote failed.');
        return;
    }

    await TmUI.modal({
        title: 'Vote',
        message: 'Your vote has been registered.',
        buttons: [{ label: 'OK', value: 'ok', style: 'primary', size: 'lg' }],
    });
    refreshElectionPage();
};

const cloneBody = (body) => {
    if (!body) return null;
    const clone = body.cloneNode(true);
    clone.querySelector('.box_shadow')?.remove();
    return clone;
};

const parseRulesSections = (body) => {
    const clone = cloneBody(body);
    if (!clone) return [];

    const sections = [];
    const leadParts = [];
    for (const node of Array.from(clone.childNodes)) {
        if (node.nodeType === Node.ELEMENT_NODE && ['UL', 'H3'].includes(node.nodeName)) break;
        if (node.nodeType === Node.TEXT_NODE || node.nodeType === Node.ELEMENT_NODE) {
            const text = cleanText(node.textContent || '');
            if (text) leadParts.push(text);
        }
    }
    const leadText = cleanText(leadParts.join(' '));
    const leadList = Array.from(clone.querySelectorAll(':scope > ul:first-of-type > li')).map(li => cleanText(li.textContent)).filter(Boolean);
    if (leadText || leadList.length) {
        sections.push({
            title: '',
            lead: leadText,
            items: leadList,
        });
    }

    Array.from(clone.querySelectorAll(':scope > h3')).forEach((heading) => {
        const list = heading.nextElementSibling;
        const items = list?.tagName === 'UL'
            ? Array.from(list.querySelectorAll('li')).map(li => cleanText(li.textContent)).filter(Boolean)
            : [];
        sections.push({
            title: cleanText(heading.textContent),
            lead: '',
            items,
        });
    });

    return sections.filter(section => section.title || section.lead || section.items.length);
};

const parseElectionOverview = (contentBox) => {
    const body = cloneBody(contentBox?.querySelector('.box_body'));
    if (!body) {
        return {
            introHtml: '',
            formLabel: 'Nominate club',
            inputId: 'nominate_club',
            inputName: 'nominate_club',
            inputValue: '',
            inputPlaceholder: 'Type club name',
            formTitle: 'Submit Nomination',
            tableTitle: 'Nominated clubs',
            rows: [],
        };
    }

    const formTitle = cleanText(body.querySelector('h3')?.textContent || 'Submit Nomination');
    const introNode = body.querySelector('p');
    const form = body.querySelector('form');
    const label = cleanText(form?.querySelector('label')?.textContent || 'Nominate club');
    const input = form?.querySelector('input') || null;
    const tableTitle = cleanText(Array.from(body.querySelectorAll('h3'))[1]?.textContent || 'Nominated clubs');
    const tableRows = Array.from(body.querySelectorAll('table tbody tr')).slice(1).map((tr) => {
        const cells = Array.from(tr.querySelectorAll('td'));
        if (cells.length < 3) return null;

        const clubLink = cells[0].querySelector('a[href*="/club/"]');
        const clubFlag = cells[0].querySelector('.country_link');
        const nominatorLink = cells[1].querySelector('a[href*="/club/"]');
        const responseDot = cells[2].querySelector('.response');
        const responseText = cleanText(cells[2].textContent);
        const responseState = responseDot?.classList.contains('accepted')
            ? 'accepted'
            : responseDot?.classList.contains('rejected')
                ? 'rejected'
                : 'pending';

        return {
            clubName: cleanText(clubLink?.textContent || cells[0].textContent),
            clubHref: clubLink?.getAttribute('href') || '',
            clubFlagHtml: clubFlag?.outerHTML || '',
            nominatedBy: cleanText(nominatorLink?.textContent || cells[1].textContent),
            nominatedByHref: nominatorLink?.getAttribute('href') || '',
            responseText,
            responseState,
            responseActions: Array.from(cells[2].querySelectorAll('[onclick]')).map((actionEl) => {
                const onclick = actionEl.getAttribute('onclick') || '';
                const nomination = parseActionCall(onclick, 'nomination_respond');
                if (nomination) {
                    return {
                        kind: 'nomination-response',
                        label: cleanText(actionEl.textContent) || (nomination.response === 1 ? 'Accept' : 'Reject'),
                        country: nomination.country,
                        response: nomination.response,
                    };
                }
                const vote = parseActionCall(onclick, 'election_vote');
                if (vote) {
                    return {
                        kind: 'vote',
                        label: cleanText(actionEl.textContent) || 'Vote',
                        clubId: vote.clubId,
                    };
                }
                return null;
            }).filter(Boolean),
        };
    }).filter(Boolean);

    return {
        introHtml: introNode?.outerHTML || '',
        formLabel: label.replace(/:\s*$/, ''),
        inputId: input?.id || 'nominate_club',
        inputName: input?.name || 'nominate_club',
        inputValue: input?.value || '',
        inputPlaceholder: input?.placeholder || 'Type club name',
        formTitle,
        tableTitle,
        rows: tableRows,
    };
};

const responseBadgeHtml = (row) => {
    if (row.responseActions?.length) {
        return row.responseActions.map((action, index) => TmUI.button({
            label: action.label,
            color: action.kind === 'vote' || action.response === 1 ? 'primary' : 'secondary',
            size: 'xs',
            shape: 'full',
            cls: 'tmvu-nt-election-action-btn',
            attrs: {
                'data-action-kind': action.kind,
                'data-action-index': String(index),
                'data-action-country': action.country || '',
                'data-action-response': action.response || '',
                'data-action-club-id': action.clubId || '',
            },
        }).outerHTML).join(' ');
    }
    const label = row.responseText || 'Pending';
    const tone = row.responseState === 'accepted'
        ? 'success'
        : row.responseState === 'pending'
            ? 'warn'
            : 'muted';
    const cls = row.responseState === 'rejected' ? 'tmvu-nt-election-chip-rejected' : '';
    return TmUI.chip({
        label,
        tone,
        size: 'sm',
        shape: 'full',
        cls,
    });
};

const clubCellHtml = (row) => `
    <div class="tmvu-nt-election-club-cell">
        <a class="tmvu-nt-election-link" href="${escapeHtml(row.clubHref || '#')}">${escapeHtml(row.clubName)}</a>
        ${row.clubFlagHtml || ''}
    </div>
`;

const nominatorCellHtml = (row) => row.nominatedByHref
    ? `<a class="tmvu-nt-election-link" href="${escapeHtml(row.nominatedByHref)}">${escapeHtml(row.nominatedBy)}</a>`
    : escapeHtml(row.nominatedBy);

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-nt-election-page {
            --tmu-page-rail-width: 320px;
        }

        .tmvu-nt-election-content,
        .tmvu-nt-election-rail {
            color: var(--tmu-text-main);
            line-height: 1.55;
        }

        .tmvu-nt-election-stack {
            display: grid;
            gap: var(--tmu-space-lg);
        }

        .tmvu-nt-election-form {
            display: grid;
            gap: var(--tmu-space-sm);
        }

        .tmvu-nt-election-form-row {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-sm);
            flex-wrap: wrap;
        }

        .tmvu-nt-election-form-row .tmu-input {
            max-width: 320px;
        }

        .tmvu-nt-election-ac {
            min-width: min(100%, 420px);
            width: min(100%, 420px);
        }

        .tmvu-nt-election-ac .tmu-ac-drop {
            z-index: 30;
        }

        .tmvu-nt-election-hint {
            color: var(--tmu-text-faint);
            font-size: var(--tmu-font-xs);
        }

        .tmvu-nt-election-copy {
            color: var(--tmu-text-main);
        }

        .tmvu-nt-election-copy p {
            margin: 0;
        }

        .tmvu-nt-election-rules {
            display: grid;
            gap: var(--tmu-space-lg);
        }

        .tmvu-nt-election-rule-section {
            display: grid;
            gap: var(--tmu-space-sm);
        }

        .tmvu-nt-election-rule-lead {
            color: var(--tmu-text-main);
            margin: 0;
        }

        .tmvu-nt-election-rule-list {
            margin: 0;
            padding-left: 18px;
            color: var(--tmu-text-main);
        }

        .tmvu-nt-election-rule-list li + li {
            margin-top: 6px;
        }

        .tmvu-nt-election-content .std,
        .tmvu-nt-election-rail .std {
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
        }

        .tmvu-nt-election-content h3,
        .tmvu-nt-election-rail h3 {
            margin: 0 0 var(--tmu-space-sm);
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-md);
            font-weight: 700;
        }

        .tmvu-nt-election-content p,
        .tmvu-nt-election-rail p,
        .tmvu-nt-election-rail ul,
        .tmvu-nt-election-content form {
            margin: 0 0 var(--tmu-space-md);
        }

        .tmvu-nt-election-content ul,
        .tmvu-nt-election-rail ul {
            padding-left: 18px;
        }

        .tmvu-nt-election-content a,
        .tmvu-nt-election-rail a {
            color: var(--tmu-text-strong);
            text-decoration: none;
        }

        .tmvu-nt-election-content a:hover,
        .tmvu-nt-election-rail a:hover {
            text-decoration: underline;
        }

        .tmvu-nt-election-content label {
            display: inline-block;
            margin-bottom: var(--tmu-space-xs);
            color: var(--tmu-text-panel-label);
            font-weight: 600;
        }

        .tmvu-nt-election-table .tmu-tbl tbody td,
        .tmvu-nt-election-table .tmu-tbl thead th {
            vertical-align: middle;
        }

        .tmvu-nt-election-table .tmu-tbl thead th:last-child,
        .tmvu-nt-election-table .tmu-tbl tbody td:last-child {
            text-align: center;
        }

        .tmvu-nt-election-club-cell {
            display: inline-flex;
            align-items: center;
            gap: var(--tmu-space-xs);
            min-width: 0;
        }

        .tmvu-nt-election-link {
            color: var(--tmu-text-strong);
            text-decoration: none;
            font-weight: 700;
        }

        .tmvu-nt-election-link:hover {
            text-decoration: underline;
        }

        .tmvu-nt-election-chip-rejected {
            background: var(--tmu-danger-fill);
            border-color: var(--tmu-border-danger);
            color: var(--tmu-danger);
        }

        .tmvu-nt-election-action-btn + .tmvu-nt-election-action-btn {
            margin-left: var(--tmu-space-xs);
        }
    `;
    document.head.appendChild(style);
};

export function initNationalTeamsElectionPage(main) {
    if (!main || !main.isConnected) return;
    if (!/^\/national-teams\/election\/?$/i.test(window.location.pathname)) return;

    const sourceRoot = document.querySelector('.main_center') || main;
    const contentBox = sourceRoot.querySelector('.column2_a > .box');
    if (!contentBox) return;

    injectTmPageLayoutStyles();
    injectStyles();

    const countryCode = extractCountryCode(sourceRoot) || cleanText(window.SESSION?.country || '').toLowerCase();
    const title = cleanText(contentBox.querySelector('.box_head h2')?.textContent || 'National coach election');
    const overview = parseElectionOverview(contentBox);

    const sideBox = sourceRoot.querySelector('.column3_a > .box');
    const sideTitle = cleanText(sideBox?.querySelector('.box_head h2')?.textContent || 'Info');
    const ruleSections = parseRulesSections(sideBox?.querySelector('.box_body'));

    main.innerHTML = '';
    main.classList.add('tmvu-nt-election-page', 'tmu-page-layout-3rail', 'tmu-page-density-regular');

    mountNationalTeamsSideMenu(main, {
        root: sourceRoot,
        id: 'tmvu-national-teams-election-nav',
        countryCode,
        currentSeason: Number(window.SESSION?.season) || null,
    });

    const mainColumn = document.createElement('section');
    mainColumn.className = 'tmu-page-section-stack';

    const card = document.createElement('section');
    card.className = 'tmu-card';
    card.innerHTML = `
        <div class="tmu-card-head">
            <span>${escapeHtml(title)}</span>
        </div>
        <div class="tmu-card-body tmvu-nt-election-content" data-ref="content"></div>
    `;
    mainColumn.appendChild(card);
    main.appendChild(mainColumn);

    const contentHost = card.querySelector('[data-ref="content"]');
    if (!contentHost) {
        main.innerHTML = TmUI.error('Failed to initialize national team election page.');
        return;
    }

    contentHost.innerHTML = '';

    const stack = document.createElement('div');
    stack.className = 'tmvu-nt-election-stack';
    contentHost.appendChild(stack);

    let suggestToken = 0;
    let suggestTimer = 0;

    const formSection = document.createElement('section');
    formSection.className = 'tmvu-nt-election-form';
    formSection.innerHTML = `
        <div>
            <div class="tmu-kicker">Election</div>
            <h3>${escapeHtml(overview.formTitle)}</h3>
        </div>
        ${overview.introHtml ? `<div class="tmvu-nt-election-copy">${overview.introHtml}</div>` : ''}
        <div class="tmvu-nt-election-form-row" data-ref="form-row"></div>
        <div class="tmvu-nt-election-hint">Start typing a club name and choose one of the suggestions.</div>
    `;
    stack.appendChild(formSection);

    const formRow = formSection.querySelector('[data-ref="form-row"]');
    if (formRow) {
        const autocomplete = TmUI.autocomplete({
            id: overview.inputId,
            name: overview.inputName,
            value: overview.inputValue,
            placeholder: overview.inputPlaceholder,
            size: 'full',
            tone: 'overlay',
            density: 'comfy',
            cls: 'tmvu-nt-election-ac',
            autocomplete: 'off',
        });
        const input = autocomplete.inputEl;
        input.addEventListener('input', () => {
            const query = cleanText(input.value);
            window.clearTimeout(suggestTimer);
            if (!query) {
                autocomplete.setItems([]);
                return;
            }
            suggestTimer = window.setTimeout(async () => {
                const token = ++suggestToken;
                const data = await TmNationalTeamsService.fetchElectionSuggestions(query);
                if (token !== suggestToken) return;
                const suggestions = normalizeElectionSuggestions(data?.clubs);
                autocomplete.setItems(suggestions.map(option => TmUI.autocompleteItem({
                    label: option.label,
                    icon: makeFlagHtml(option.countrySuffix),
                    onSelect: async () => {
                        autocomplete.hideDrop();
                        autocomplete.setValue(option.label);
                        await handleNominationSelection(option.id);
                    },
                })));
            }, 180);
        });
        formRow.appendChild(TmUI.field({
            label: overview.formLabel,
            input: autocomplete,
            cls: 'tmvu-nt-election-form-field',
        }));
    }

    const tableSection = document.createElement('section');
    tableSection.className = 'tmvu-nt-election-table';
    stack.appendChild(tableSection);

    if (!overview.rows.length) {
        tableSection.innerHTML = `
            <div>
                <div class="tmu-kicker">Nominations</div>
                <h3>${escapeHtml(overview.tableTitle)}</h3>
            </div>
            ${TmUI.empty('No nominated clubs found.', true)}
        `;
    } else {
        const tableHeading = document.createElement('div');
        tableHeading.innerHTML = `
            <div class="tmu-kicker">Nominations</div>
            <h3>${escapeHtml(overview.tableTitle)}</h3>
        `;
        tableSection.appendChild(tableHeading);
        tableSection.appendChild(TmUI.table({
            cls: 'tmvu-nt-election-table-grid',
            density: 'cozy',
            items: overview.rows,
            headers: [
                {
                    key: 'clubName',
                    label: 'Club',
                    render: (_value, row) => clubCellHtml(row),
                    sort: (a, b) => a.clubName.localeCompare(b.clubName),
                },
                {
                    key: 'nominatedBy',
                    label: 'Nominated By',
                    render: (_value, row) => nominatorCellHtml(row),
                    sort: (a, b) => a.nominatedBy.localeCompare(b.nominatedBy),
                },
                {
                    key: 'responseText',
                    label: 'Response',
                    align: 'c',
                    render: (_value, row) => responseBadgeHtml(row),
                    sort: (a, b) => (a.responseText || 'Pending').localeCompare(b.responseText || 'Pending'),
                },
            ],
            sortKey: 'clubName',
            sortDir: 1,
        }));
    }

    tableSection.addEventListener('click', async (event) => {
        const button = event.target.closest('[data-action-kind]');
        if (!button || !tableSection.contains(button)) return;

        const actionKind = button.getAttribute('data-action-kind') || '';
        if (actionKind === 'nomination-response') {
            await handleNominationResponse({
                country: button.getAttribute('data-action-country') || '',
                response: toNumber(button.getAttribute('data-action-response')),
            });
            return;
        }

        if (actionKind === 'vote') {
            await handleVote(toNumber(button.getAttribute('data-action-club-id')));
        }
    });

    if (ruleSections.length) {
        const rail = document.createElement('aside');
        rail.className = 'tmu-page-rail-stack';
        const infoCard = document.createElement('section');
        infoCard.className = 'tmu-card';
        const rulesHtml = ruleSections.map((section) => `
            <section class="tmvu-nt-election-rule-section">
                ${section.title ? `<h3>${escapeHtml(section.title)}</h3>` : ''}
                ${section.lead ? `<p class="tmvu-nt-election-rule-lead">${escapeHtml(section.lead)}</p>` : ''}
                ${section.items.length ? `<ul class="tmvu-nt-election-rule-list">${section.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
            </section>
        `).join('');
        infoCard.innerHTML = `
            <div class="tmu-card-head">
                <span>${escapeHtml(sideTitle)}</span>
            </div>
            <div class="tmu-card-body tmvu-nt-election-rail tmvu-nt-election-rules">${rulesHtml}</div>
        `;
        rail.appendChild(infoCard);
        main.appendChild(rail);
    }
}