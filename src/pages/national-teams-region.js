import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmStandingsTable } from '../components/shared/tm-standings-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { mountNationalTeamsSideMenu } from '../components/national-teams/tm-national-teams-side-menu.js';

const STYLE_ID = 'tmvu-national-teams-region-style';
const REGION_OPTIONS = [
    { value: 'af', label: 'Africa' },
    { value: 'am', label: 'North and South America' },
    { value: 'ao', label: 'Asia and Oceania' },
    { value: 'eu', label: 'Europe' },
];

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tsa-panel-league-name {
            font-size: var(--tmu-font-sm);
            font-weight: 700;
            color: var(--tmu-text-strong);
            letter-spacing: 0.3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .tmvu-nt-region-side-copy h3 {
            margin: var(--tmu-space-md) 0 var(--tmu-space-sm);
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-sm);
            font-weight: 700;
        }
        .tmvu-nt-region-side-copy p {
            margin: 0 0 var(--tmu-space-md);
            color: var(--tmu-text-main);
            line-height: 1.55;
        }
        .tmvu-nt-region-side-copy img.float_right {
            float: right;
            margin: 0 0 var(--tmu-space-sm) var(--tmu-space-md);
            max-width: 72px;
            height: auto;
        }
    `;
    document.head.appendChild(style);
};

const parseTabs = (box) => {
    const panelsRoot = box.querySelector('.tabs_content');
    return Array.from(box.querySelectorAll('.tabs_new [tab_active]')).map((tab, index) => {
        const key = tab.getAttribute('tab_active') || `tab-${index}`;
        const panel = panelsRoot?.querySelector(`#${key}`);
        const noteHtml = panel?.querySelector('.align_left.std p')?.innerHTML?.trim() || '';
        const groups = Array.from(panel?.querySelectorAll('h3') || []).map(heading => {
            const table = heading.nextElementSibling?.querySelector('table.group_table');
            if (!table) return null;
            return {
                title: cleanText(heading.textContent),
                rows: Array.from(table.querySelectorAll('tbody tr')).slice(1).map(tr => {
                    const cells = tr.querySelectorAll('td');
                    if (cells.length < 10) return null;
                    const teamLink = cells[1].querySelector('a[href*="/national-teams/"]');
                    const flagLink = cells[2].querySelector('a[href*="/national-teams/"]');
                    const flagEl = cells[2].querySelector('ib[class*="flag-img-"], img[class*="flag-img-"]');
                    return {
                        rank: cleanText(cells[0].textContent),
                        clubName: cleanText(teamLink?.textContent || cells[1].textContent),
                        nameHtml: `<span style="display:inline-flex;align-items:center;gap:var(--tmu-space-xs)">${flagLink?.innerHTML || flagEl?.outerHTML || ''}<a class="tsa-club-link" href="${teamLink?.getAttribute('href') || '#'}">${escapeHtml(cleanText(teamLink?.textContent || cells[1].textContent))}</a></span>`,
                        gp: cleanText(cells[3].textContent),
                        w: cleanText(cells[4].textContent),
                        d: cleanText(cells[5].textContent),
                        l: cleanText(cells[6].textContent),
                        gf: cleanText(cells[7].textContent),
                        ga: cleanText(cells[8].textContent),
                        pts: cleanText(cells[9].textContent),
                        isMe: /highlighted_row/.test(tr.className || ''),
                    };
                }).filter(Boolean),
            };
        }).filter(group => group?.rows?.length);

        return {
            key,
            label: cleanText(tab.textContent) || key,
            active: tab.classList.contains('active_tab') || tab.hasAttribute('selected'),
            noteHtml,
            groups,
            fallbackHtml: panel && !groups.length ? panel.innerHTML : '',
        };
    });
};

const getCurrentRegion = () => window.location.pathname.match(/^\/national-teams\/region\/([a-z]{2})\//i)?.[1]?.toLowerCase() || 'eu';

const openRegionModal = async () => {
    const currentRegion = getCurrentRegion();
    const currentLabel = REGION_OPTIONS.find(option => option.value === currentRegion)?.label || 'Unknown';
    const selectedRegion = await TmUI.modal({
        title: 'Select Region',
        message: `Current region: <strong>${escapeHtml(currentLabel)}</strong>`,
        buttons: [
            ...REGION_OPTIONS.map(option => ({
                label: option.label,
                value: option.value,
                style: 'primary',
                selected: option.value === currentRegion,
                size: 'xl',
            })),
            { label: 'Cancel', value: 'cancel', style: 'danger', size: 'xl' },
        ],
    });
    if (!selectedRegion || selectedRegion === 'cancel' || selectedRegion === currentRegion) return;
    window.location.assign(`/national-teams/region/${selectedRegion}/`);
};

export function initNationalTeamsRegionPage(main) {
    if (!main || !main.isConnected) return;
    if (!/^\/national-teams\/region\//i.test(window.location.pathname)) return;

    const sourceRoot = document.querySelector('.main_center') || main;
    const contentBox = sourceRoot.querySelector('.column2_a > .box');
    if (!contentBox) return;

    injectTmPageLayoutStyles();
    injectStyles();
    TmStandingsTable.injectStyles();

    const countryCode = sourceRoot.querySelector('.content_menu a[href^="/national-teams/"]')?.getAttribute('href')?.match(/\/national-teams\/([a-z]{2,3})\//i)?.[1] || '';
    const subHeader = contentBox.querySelector('.box_sub_header');
    const title = cleanText(subHeader?.querySelector('.large')?.textContent || contentBox.querySelector('.box_head h2')?.textContent || 'Tournaments');
    const tabs = parseTabs(contentBox);
    const sideBox = sourceRoot.querySelector('.column3_a > .box');
    const sideTitle = cleanText(sideBox?.querySelector('.box_head h2')?.textContent || 'Info');
    const sideBody = sideBox?.querySelector('.box_body')?.cloneNode(true);
    sideBody?.querySelector('.box_shadow')?.remove();

    main.innerHTML = '';
    main.classList.add('tmu-page-layout-3rail', 'tmu-page-density-regular');
    main.style.setProperty('--tmu-page-rail-width', '340px');

    mountNationalTeamsSideMenu(main, {
        root: sourceRoot,
        id: 'tmvu-national-teams-region-nav',
        countryCode,
        currentSeason: Number(window.SESSION?.season) || null,
    });

    const mainColumn = document.createElement('section');
    mainColumn.className = 'tmu-page-section-stack';
    const card = document.createElement('section');
    card.className = 'tmu-card';
    card.innerHTML = `
        <div class="tmu-card-head">
            <span id="tsa-panel-league-name" class="tsa-panel-league-name">${escapeHtml(title)}</span>
        </div>
        <div class="tmu-card-body tmu-card-body-flush">
            <div data-ref="tabs"></div>
            <div data-ref="panel" style="padding:var(--tmu-space-lg)"></div>
        </div>
    `;
    card.querySelector('.tmu-card-head')?.appendChild(TmUI.button({
        label: 'Change',
        color: 'secondary',
        size: 'sm',
        shape: 'full',
        onClick: openRegionModal,
    }));
    mainColumn.appendChild(card);
    main.appendChild(mainColumn);

    const tabsHost = card.querySelector('[data-ref="tabs"]');
    const panelHost = card.querySelector('[data-ref="panel"]');
    const activeKey = tabs.find(tab => tab.active)?.key || tabs[0]?.key || '';
    const renderPanel = (key) => {
        const tab = tabs.find(item => item.key === key) || tabs[0];
        if (!tab) {
            panelHost.innerHTML = TmUI.empty('No data available.', true);
            return;
        }
        panelHost.innerHTML = [
            tab.noteHtml ? `<div style="margin-bottom:var(--tmu-space-md)">${tab.noteHtml}</div>` : '',
            tab.groups.length ? TmStandingsTable.buildGroupedHtml({ groups: tab.groups, promotionCount: 1, nameLabel: 'Country' }) : '',
            !tab.groups.length && tab.fallbackHtml ? tab.fallbackHtml : '',
        ].filter(Boolean).join('') || TmUI.empty('No data available.', true);
    };

    if (tabs.length) {
        tabsHost.appendChild(TmUI.tabs({
            items: tabs.map(tab => ({ key: tab.key, label: tab.label })),
            active: activeKey,
            onChange: renderPanel,
        }));
    }
    renderPanel(activeKey);

    if (sideBody?.innerHTML?.trim()) {
        const rail = document.createElement('aside');
        rail.className = 'tmu-page-rail-stack';
        const infoCard = document.createElement('section');
        infoCard.className = 'tmu-card';
        infoCard.innerHTML = `<div class="tmu-card-header"><div class="tmu-card-title">${escapeHtml(sideTitle)}</div></div><div class="tmu-card-body tmvu-nt-region-side-copy">${sideBody.innerHTML}</div>`;
        rail.appendChild(infoCard);
        main.appendChild(rail);
    }
}