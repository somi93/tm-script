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

const hasRelevantMatchLists = (root) => Array.from(root?.querySelectorAll?.('.match_list') || []).some(node => {
    if (node.closest('.column3_a, #right_col, .notice_box, #cookies_disabled_message, .cookies_disabled_message')) return false;
    return !!node.querySelector('.hometeam a[club_link], .hometeam a[href*="/club/"]')
        && !!node.querySelector('.awayteam a[club_link], .awayteam a[href*="/club/"]');
});

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

function findNearestStageTitle(node, root) {
    let current = node;

    while (current && current !== root) {
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

        const parentBox = current.closest?.('.box');
        const boxTitle = getBoxTitle(parentBox);
        if (boxTitle && STAGE_TITLE_PATTERN.test(boxTitle)) return boxTitle;

        current = current.parentElement;
    }

    return '';
}

function parseSections(doc) {
    const root = doc.body || doc.documentElement;
    const matchLists = Array.from(root.querySelectorAll('.match_list')).filter(node => {
        if (node.closest('.column3_a, #right_col, .notice_box, #cookies_disabled_message, .cookies_disabled_message')) return false;
        return !!node.querySelector('.hometeam a[club_link], .hometeam a[href*="/club/"]')
            && !!node.querySelector('.awayteam a[club_link], .awayteam a[href*="/club/"]');
    });
    const groupedSections = new Map();

    debugLog('overview match lists', {
        total: matchLists.length,
        titles: matchLists.slice(0, 12).map(node => findNearestStageTitle(node, root) || getBoxTitle(node.closest('.box')) || 'Tournament'),
    });

    matchLists.forEach(list => {
        const rawTitle = findNearestStageTitle(list, root) || getBoxTitle(list.closest('.box')) || 'Tournament';
        const title = STAGE_TITLE_PATTERN.test(rawTitle) ? rawTitle : 'Tournament';
        if (!groupedSections.has(title)) groupedSections.set(title, { title, nodes: [] });
        groupedSections.get(title).nodes.push(list);
    });

    return Array.from(groupedSections.values()).filter(section => section.nodes.length);
}

function classifyStage(title, passedGroupStage) {
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
    async loadOverviewDocumentInFrame(tournamentId) {
        if (typeof document === 'undefined' || !document.body) return null;

        return new Promise(resolve => {
            const iframe = document.createElement('iframe');
            iframe.setAttribute('aria-hidden', 'true');
            iframe.tabIndex = -1;
            iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none;left:-9999px;top:-9999px;';

            let settled = false;
            let observer = null;
            let timeoutId = null;

            const finish = (frameDoc = null) => {
                if (settled) return;
                settled = true;
                if (observer) observer.disconnect();
                if (timeoutId) window.clearTimeout(timeoutId);
                iframe.remove();

                if (!frameDoc?.documentElement) {
                    resolve(null);
                    return;
                }

                resolve(new DOMParser().parseFromString(frameDoc.documentElement.outerHTML, 'text/html'));
            };

            const inspectFrame = () => {
                const frameDoc = iframe.contentDocument;
                if (!frameDoc?.body || !hasRelevantMatchLists(frameDoc)) return false;
                debugLog('iframe overview populated', {
                    tournamentId,
                    matchLists: frameDoc.querySelectorAll('.match_list').length,
                });
                finish(frameDoc);
                return true;
            };

            iframe.addEventListener('load', () => {
                const frameDoc = iframe.contentDocument;
                if (!frameDoc?.body) return;
                if (inspectFrame()) return;

                observer = new MutationObserver(() => {
                    inspectFrame();
                });
                observer.observe(frameDoc.body, { childList: true, subtree: true });
                timeoutId = window.setTimeout(() => finish(frameDoc), 8000);
            }, { once: true });
            iframe.src = `/international-cup/${tournamentId}/`;
            document.body.appendChild(iframe);
        });
    },

    async fetchOverviewDocument(tournamentId) {
        return _dedup(`icup:overview:${tournamentId}`, async () => {
            const html = await _getHtml(`/international-cup/${tournamentId}/`);
            const staticDoc = html ? new DOMParser().parseFromString(html, 'text/html') : null;
            if (hasRelevantMatchLists(staticDoc)) return staticDoc;

            debugLog('static overview missing match lists, trying iframe fallback', {
                tournamentId,
                htmlLength: html?.length || 0,
            });

            const hydratedDoc = await this.loadOverviewDocumentInFrame(tournamentId);
            return hydratedDoc || staticDoc;
        });
    },

    async calculateCurrentSeasonCountryPoints({ tournamentId, tournamentIds = [], clubCountryMap = {} } = {}) {
        console.log('[TMVU][International Cup Service] Calculating country coefficients...', { tournamentId, tournamentIds, mappedClubs: Object.keys(clubCountryMap).length });
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

                        const homeCountryKey = clubCountryMap[match.homeId] || '';
                        const awayCountryKey = clubCountryMap[match.awayId] || '';
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

        if (!Object.keys(countries).length) {
            console.warn('[TMVU][International Cup Service] No country coefficients were produced.', {
                tournamentIds: uniqueOverviewIds,
                overviews: overviewSummaries,
                mappedClubs: Object.keys(clubCountryMap).length,
                trackedClubs: Object.keys(clubStats).length,
            });
        }

        return countries;
    },

    normalizeCountryKey,
};