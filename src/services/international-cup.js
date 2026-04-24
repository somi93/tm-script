import { _dedup, _getHtml } from './engine.js';

const cleanText = (value) => String(value || '').replace(/\s+/g, ' ').trim();
const normalizeCountryKey = (value) => cleanText(value).toLowerCase();
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
    console.debug('[TMVU][International Cup Service]', ...args);
};
const MAIN_BOX_SELECTOR = '.column2_a > .box .box_body';
const MATCH_LIST_SELECTOR = 'ul.match_list';

function extractCountryKey(node) {
    if (!node) return '';
    const countryAnchor = node.querySelector('a.country_link[href*="/national-teams/"], a[href*="/national-teams/"]');
    const href = countryAnchor?.getAttribute('href') || '';
    const code = href.match(/\/national-teams\/([^/]+)\//)?.[1] || '';
    return normalizeCountryKey(code || countryAnchor?.textContent || node.textContent || '');
}

function extractClubId(node) {
    if (!node) return '';
    const explicit = node.getAttribute('club_link');
    if (explicit) return String(explicit);
    const href = node.getAttribute('href') || '';
    const match = href.match(/\/club\/(\d+)\//);
    return match ? match[1] : '';
}

function parseMatchListItem(item) {
    const homeAnchor = item.querySelector('.hometeam a[club_link], .hometeam a[href*="/club/"]');
    const awayAnchor = item.querySelector('.awayteam a[club_link], .awayteam a[href*="/club/"]');
    if (!homeAnchor || !awayAnchor) return null;

    const scoreText = cleanText(item.querySelector('.match_result')?.textContent || '');
    const scoreMatch = scoreText.match(/(\d+)\s*-\s*(\d+)/);
    if (!scoreMatch) return null;

    return {
        homeId: extractClubId(homeAnchor),
        awayId: extractClubId(awayAnchor),
        homeCountryKey: extractCountryKey(item.querySelector('.hometeam')),
        awayCountryKey: extractCountryKey(item.querySelector('.awayteam')),
        homeGoals: Number(scoreMatch[1]) || 0,
        awayGoals: Number(scoreMatch[2]) || 0,
    };
}

const STAGE_TITLE_PATTERN = /qualification|qualifying|play\s*-?\s*off|preliminary|group|round of|quarter|semi|final/i;
const HEADING_SELECTOR = 'h1, h2, h3, .stage_title, .sub_header, .box_headline, .box_sub_header .large';

function getBoxTitle(box) {
    return cleanText(
        box?.querySelector('.box_head h2, .box_headline, .box_sub_header .large, h3, h2')?.textContent || ''
    );
}

function findNearestStageTitle(node, boundaryRoot) {
    let current = node;

    while (current && current !== boundaryRoot) {
        let sibling = current.previousElementSibling;
        while (sibling) {
            if (sibling.matches?.(HEADING_SELECTOR)) {
                const title = cleanText(sibling.textContent);
                if (title) return title;
            }

            const nestedHeading = Array.from(sibling.querySelectorAll?.(HEADING_SELECTOR) || [])
                .map(candidate => cleanText(candidate.textContent))
                .filter(Boolean)
                .pop();
            if (nestedHeading) return nestedHeading;

            sibling = sibling.previousElementSibling;
        }

        current = current.parentElement;
    }

    return '';
}

export function parseSections(doc) {
    const root = doc.querySelector(MAIN_BOX_SELECTOR) || doc.body || doc.documentElement;
    const matchLists = Array.from(root.querySelectorAll(MATCH_LIST_SELECTOR)).filter(node => {
        return !!node.querySelector('.hometeam a[club_link], .hometeam a[href*="/club/"]')
            && !!node.querySelector('.awayteam a[club_link], .awayteam a[href*="/club/"]');
    });
    const groupedSections = new Map();

    matchLists.forEach(list => {
        const rawTitle = findNearestStageTitle(list, root) || getBoxTitle(list.closest('.box')) || 'Tournament';
        const title = STAGE_TITLE_PATTERN.test(rawTitle) ? rawTitle : 'Tournament';
        if (!groupedSections.has(title)) groupedSections.set(title, { title, nodes: [] });
        groupedSections.get(title).nodes.push(list);
    });

    debugLog('overview sections parsed', {
        totalLists: matchLists.length,
        sections: Array.from(groupedSections.keys()),
    });

    return Array.from(groupedSections.values()).filter(section => section.nodes.length);
}

export function classifyStage(title, passedGroupStage) {
    const text = cleanText(title).toLowerCase();
    if (/group stage|groups?/.test(text)) return 'group';
    if (/qualification|qualifying|play\s*-?\s*off|preliminary/.test(text)) return 'qualification';
    if (/round of|quarter|semi|final/.test(text)) return 'knockout';
    return passedGroupStage ? 'knockout' : 'qualification';
}

function ensureClubStats(store, clubId, countryKey) {
    if (!clubId || !countryKey) return null;
    if (!store[clubId]) {
        store[clubId] = {
            countryKey,
            qualification: 0,
            group: 0,
            knockout: 0,
            hasGroupStage: false,
        };
    }
    return store[clubId];
}

function awardMatchPoints(home, away, stage, match) {
    const winPoints = stage === 'qualification' ? 1 : 2;
    const drawPoints = stage === 'qualification' ? 0.5 : 1;
    const isDraw = match.homeGoals === match.awayGoals;

    if (stage === 'group') {
        home.hasGroupStage = true;
        away.hasGroupStage = true;
    }

    if (isDraw) {
        home[stage] += drawPoints;
        away[stage] += drawPoints;
        return;
    }

    const homeWon = match.homeGoals > match.awayGoals;
    if (homeWon) {
        home[stage] += winPoints;
    } else {
        away[stage] += winPoints;
    }
}

export const TmInternationalCupService = {
    async fetchOverviewDocument(tournamentId) {
        return _dedup(`icup:overview:${tournamentId}`, async () => {
            const html = await _getHtml(`/international-cup/${tournamentId}/`);
            if (!html) return null;
            debugLog('overview html fetched', {
                tournamentId,
                htmlLength: html?.length || 0,
            });
            return new DOMParser().parseFromString(html, 'text/html');
        });
    },

    async calculateCurrentSeasonCountryPoints({ tournamentId, tournamentIds = [], clubCountryMap = {} } = {}) {
        const overviewIds = (Array.isArray(tournamentIds) ? tournamentIds : []).filter(Boolean);
        if (tournamentId) overviewIds.push(tournamentId);
        const uniqueOverviewIds = Array.from(new Set(overviewIds.map(id => String(id))));
        if (!uniqueOverviewIds.length) return {};

        const clubStats = {};
        const overviewSummaries = [];

        for (const overviewId of uniqueOverviewIds) {
            const doc = await this.fetchOverviewDocument(overviewId);
            if (!doc) {
                overviewSummaries.push({ tournamentId: overviewId, sections: [] });
                continue;
            }

            const sections = parseSections(doc);
            let passedGroupStage = false;
            overviewSummaries.push({ tournamentId: overviewId, sections: sections.map(section => section.title) });

            sections.forEach(section => {
                const stage = classifyStage(section.title, passedGroupStage);
                if (stage === 'group') passedGroupStage = true;

                section.nodes.forEach(node => {
                    if (!node || node.tagName !== 'UL' || !node.classList.contains('match_list')) return;

                    Array.from(node.querySelectorAll('li')).forEach(item => {
                        const match = parseMatchListItem(item);
                        if (!match) return;

                        const homeCountryKey = match.homeCountryKey || clubCountryMap[match.homeId] || '';
                        const awayCountryKey = match.awayCountryKey || clubCountryMap[match.awayId] || '';
                        const home = ensureClubStats(clubStats, match.homeId, homeCountryKey);
                        const away = ensureClubStats(clubStats, match.awayId, awayCountryKey);
                        if (!home || !away) return;
                        awardMatchPoints(home, away, stage, match);
                    });
                });
            });
        }

        debugLog('overview fetched', {
            tournamentIds: uniqueOverviewIds,
            overviews: overviewSummaries,
            mappedClubs: Object.keys(clubCountryMap).length,
        });

        const countries = {};
        Object.values(clubStats).forEach(club => {
            const groupPoints = club.hasGroupStage ? Math.max(6, club.group) : 0;
            const total = club.qualification + groupPoints + club.knockout;
            const entry = countries[club.countryKey] || { total: 0, teams: 0, average: 0 };
            entry.total += total;
            entry.teams += 1;
            countries[club.countryKey] = entry;
        });

        Object.values(countries).forEach(entry => {
            entry.average = entry.teams ? entry.total / entry.teams : 0;
        });

        debugLog('country points calculated', {
            clubsTracked: Object.keys(clubStats).length,
            countries: Object.keys(countries).length,
            sampleCountries: Object.entries(countries).slice(0, 8),
        });

        return countries;
    },

    normalizeCountryKey,
};