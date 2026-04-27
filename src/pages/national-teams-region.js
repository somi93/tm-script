import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { TmStandingsTable } from '../components/shared/tm-standings-table.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { mountNationalTeamsSideMenu } from '../components/national-teams/tm-national-teams-side-menu.js';
import { TmNationalTeamsModel } from '../models/national-teams.js';

const STYLE_ID = 'tmvu-national-teams-region-style';
const NT_FIXTURES_CACHE = new Map();
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
        .tmvu-nt-region-legend {
            display: grid;
            gap: var(--tmu-space-xs);
            margin-bottom: var(--tmu-space-md);
        }
        .tmvu-nt-region-legend-item {
            display: inline-flex;
            align-items: center;
            gap: var(--tmu-space-xs);
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
        }
        .tmvu-nt-region-legend-swatch {
            width: 12px;
            height: 12px;
            border-radius: 2px;
            flex: 0 0 12px;
        }
        .tmvu-nt-region-subsection-title {
            margin: var(--tmu-space-xl) 0 var(--tmu-space-sm);
            color: var(--tmu-text-strong);
            font-size: var(--tmu-font-sm);
            font-weight: 800;
            letter-spacing: .04em;
            text-transform: uppercase;
        }
    `;
    document.head.appendChild(style);
};

const extractCountryCode = (href) => href.match(/\/national-teams\/([a-z]{2,3})\//i)?.[1]?.toLowerCase() || '';

const parseScore = (value) => {
    const match = cleanText(value).match(/^(\d+)\s*[-:]\s*(\d+)$/);
    if (!match) return null;
    return { home: Number(match[1]), away: Number(match[2]) };
};

const wrapperText = (value) => {
    const html = String(value || '').trim();
    if (!html) return '';
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    return cleanText(wrapper.textContent || '');
};

const isEuropeWorldCupQualifiers = (title) => cleanText(title).toLowerCase() === 'europe wc qualifiers';

const isGroupStageTab = (tab) => cleanText(tab?.label).toLowerCase() === 'group stage' || cleanText(tab?.key).toLowerCase() === 'group_stage';

const isNtqMatchType = (value) => cleanText(value).toUpperCase() === 'NTQ';

const buildEuropeWcLegendHtml = () => `
    <div class="tmvu-nt-region-legend">
        <div class="tmvu-nt-region-legend-item"><span class="tmvu-nt-region-legend-swatch" style="background:var(--tmu-success-fill-hover);border:1px solid var(--tmu-success);"></span>Group winners qualify directly</div>
        <div class="tmvu-nt-region-legend-item"><span class="tmvu-nt-region-legend-swatch" style="background:rgba(56,189,248,0.10);border:1px solid var(--tmu-info-strong);"></span>Second-placed teams enter ranking for the four best runners-up</div>
    </div>
`;

const compareRankingRows = (left, right) => {
    const leftPts = Number(left.pts) || 0;
    const rightPts = Number(right.pts) || 0;
    if (rightPts !== leftPts) return rightPts - leftPts;

    const leftDiff = (Number(left.gf) || 0) - (Number(left.ga) || 0);
    const rightDiff = (Number(right.gf) || 0) - (Number(right.ga) || 0);
    if (rightDiff !== leftDiff) return rightDiff - leftDiff;

    const leftGf = Number(left.gf) || 0;
    const rightGf = Number(right.gf) || 0;
    if (rightGf !== leftGf) return rightGf - leftGf;

    return String(left.clubName || '').localeCompare(String(right.clubName || ''));
};

const flattenFixturesPayload = (payload) => Object.values(payload || {}).flatMap(month => Array.from(month?.matches || []));

const parseNtqFixturesPayload = (payload) => flattenFixturesPayload(payload).map(match => ({
    matchId: String(match?.id || ''),
    homeId: extractCountryCode(String(match?.home_link || '')) || cleanText(match?.hometeam || '').toLowerCase(),
    awayId: extractCountryCode(String(match?.away_link || '')) || cleanText(match?.awayteam || '').toLowerCase(),
    homeName: cleanText(match?.hometeamname || ''),
    awayName: cleanText(match?.awayteamname || ''),
    result: cleanText(match?.result || wrapperText(match?.match_link) || ''),
    matchType: cleanText(match?.matchtype_sort || match?.matchtype_name || ''),
})).filter(match => match.homeId && match.awayId && match.result && isNtqMatchType(match.matchType));

const getFixtureDedupKey = (match) => {
    if (match.matchId) return `mid:${match.matchId}`;
    const teams = [match.homeId, match.awayId].sort().join(':');
    return `pair:${teams}|${match.result}|${cleanText(match.matchType).toUpperCase()}`;
};

const fetchTeamNtqFixtures = (countryCode) => {
    const code = cleanText(countryCode).toLowerCase();
    if (!code) return Promise.resolve([]);
    if (!NT_FIXTURES_CACHE.has(code)) {
        NT_FIXTURES_CACHE.set(code, TmNationalTeamsModel.fetchFixtures(code)
            .then(parseNtqFixturesPayload)
            .catch(() => []));
    }
    return NT_FIXTURES_CACHE.get(code);
};

const buildUniqueNtqFixtures = async (groups) => {
    const countryCodes = [...new Set(groups.flatMap(group => group.rows.map(row => row.countryCode)).filter(Boolean))];
    const fixtureSets = await Promise.all(countryCodes.map(code => fetchTeamNtqFixtures(code)));
    const fixtureMap = new Map();

    fixtureSets.flat().forEach((match) => {
        const dedupKey = getFixtureDedupKey(match);
        if (!fixtureMap.has(dedupKey)) fixtureMap.set(dedupKey, match);
    });

    return Array.from(fixtureMap.values());
};

const buildStatsFromFixtures = (fixtures, teamCode, excludedCountryCode) => fixtures.reduce((acc, match) => {
    const isHome = match.homeId === teamCode;
    const isAway = match.awayId === teamCode;
    if (!isHome && !isAway) return acc;

    const opponentCode = isHome ? match.awayId : match.homeId;
    if (excludedCountryCode && opponentCode === excludedCountryCode) return acc;

    const score = parseScore(match.result);
    if (!score) return acc;

    const gf = isHome ? score.home : score.away;
    const ga = isHome ? score.away : score.home;
    acc.gp += 1;
    acc.gf += gf;
    acc.ga += ga;
    if (gf > ga) {
        acc.w += 1;
        acc.pts += 3;
    } else if (gf === ga) {
        acc.d += 1;
        acc.pts += 1;
    } else {
        acc.l += 1;
    }
    return acc;
}, { gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 });

const buildSecondPlacedRankingRows = async (groups) => {
    const fixtures = await buildUniqueNtqFixtures(groups);

    return groups.map((group) => {
        const sortedRows = [...group.rows].sort((left, right) => (Number(left.rank) || 0) - (Number(right.rank) || 0));
        const second = sortedRows.find(row => Number(row.rank) === 2);
        if (!second) return null;
        const sixth = sortedRows.length >= 6 ? sortedRows.find(row => Number(row.rank) === 6) : null;
        const stats = buildStatsFromFixtures(fixtures, second.countryCode, sixth?.countryCode || '');
        return {
            rank: 0,
            clubName: second.clubName,
            nameHtml: second.nameHtml,
            gp: stats.gp,
            w: stats.w,
            d: stats.d,
            l: stats.l,
            gf: stats.gf,
            ga: stats.ga,
            pts: stats.pts,
        };
    }).filter(row => row && row.gp > 0)
        .sort(compareRankingRows)
        .map((row, index) => ({ ...row, rank: index + 1 }));
};

const buildSecondPlacedRankingHtml = (rows) => {
    if (!rows.length) return TmUI.empty('No second-placed ranking available yet.', true);

    return [
        '<div class="tmvu-nt-region-subsection-title">Ranking of Second Placed</div>',
        TmStandingsTable.buildHtml({
            rows,
            promotionCount: 0,
            promoDirectCount: 0,
            promoPlayoffCount: 4,
            nameLabel: 'Country',
        }),
    ].join('');
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
                        countryCode: extractCountryCode(teamLink?.getAttribute('href') || flagLink?.getAttribute('href') || ''),
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
    let renderToken = 0;
    const renderPanel = async (key) => {
        const token = ++renderToken;
        const tab = tabs.find(item => item.key === key) || tabs[0];
        if (!tab) {
            panelHost.innerHTML = TmUI.empty('No data available.', true);
            return;
        }

        const isEuropeWcGroupStage = getCurrentRegion() === 'eu' && isEuropeWorldCupQualifiers(title) && isGroupStageTab(tab);
        const baseHtml = [
            isEuropeWcGroupStage
                ? buildEuropeWcLegendHtml()
                : (tab.noteHtml ? `<div style="margin-bottom:var(--tmu-space-md)">${tab.noteHtml}</div>` : ''),
            tab.groups.length
                ? TmStandingsTable.buildGroupedHtml({
                    groups: tab.groups,
                    promotionCount: isEuropeWcGroupStage ? 0 : 1,
                    promoDirectCount: isEuropeWcGroupStage ? 1 : 0,
                    promoPlayoffCount: isEuropeWcGroupStage ? 2 : 0,
                    nameLabel: 'Country',
                })
                : '',
            !tab.groups.length && tab.fallbackHtml ? tab.fallbackHtml : '',
        ].filter(Boolean).join('') || TmUI.empty('No data available.', true);

        if (!isEuropeWcGroupStage || !tab.groups.length) {
            panelHost.innerHTML = baseHtml;
            return;
        }

        panelHost.innerHTML = `${baseHtml}<div data-ref="second-placed">${TmUI.loading('Loading second-placed ranking...', true)}</div>`;
        const secondPlacedRows = await buildSecondPlacedRankingRows(tab.groups);
        if (token !== renderToken) return;
        const secondPlacedHost = panelHost.querySelector('[data-ref="second-placed"]');
        if (secondPlacedHost) secondPlacedHost.innerHTML = buildSecondPlacedRankingHtml(secondPlacedRows);
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
        infoCard.innerHTML = `<div class="tmu-card-body tmvu-nt-region-side-copy">${sideBody.innerHTML}</div>`;
        rail.appendChild(infoCard);
        main.appendChild(rail);
    }
}