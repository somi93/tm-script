import { TmUI } from '../components/shared/tm-ui.js';
import { TmFixturesList } from '../components/shared/tm-fixtures-list.js';
import { TmSummaryStrip } from '../components/shared/tm-summary-strip.js';
import { TmClubFixturesStyles } from '../components/club/tm-club-fixtures-styles.js';
import { TmClubService } from '../services/club.js';
import { initClubLayout, normalizeClubHref } from '../components/club/tm-club-layout.js';

export function initFixturesPage(main) {
    if (!main || !main.isConnected) return;

    const routeMatch = window.location.pathname.match(/^\/fixtures\/club\/(\d+)\/?$/);
    if (!routeMatch) return;

    const CLUB_ID = routeMatch[1];
    const layout = initClubLayout({ main, currentPath: normalizeClubHref(window.location.pathname) });
    if (!layout?.mainColumn) return;
    const container = layout.mainColumn;
    const htmlOf = node => node?.outerHTML || '';
    const buttonHtml = opts => htmlOf(TmUI.button(opts));

    const MATCH_TYPE_KEYS = {
        'League':            'league',
        'Friendly':          'friendly',
        'Friendly League':   'friendly_league',
        'Cup':               'cup',
        'International':     'international_cup',
        'International Cup': 'international_cup',
    };

    let activeFilter = 'all';
    let openMonthKey = null;
    let fixturesData = null;

    function matchTypeKey(match) {
        const label = match.matchtype_sort || match.matchtype_name || '';
        return MATCH_TYPE_KEYS[label] || 'other';
    }

    function isPlayedMatch(match) {
        return Boolean(match.result && match.result !== 'x-x');
    }

    function isHomeMatch(match) {
        return String(match.hometeam) === CLUB_ID;
    }

    function getAllMatches(data) {
        return Object.values(data || {}).flatMap(month => month.matches || []);
    }

    function getFilteredMonths(data) {
        const months = Object.entries(data || {}).map(([monthKey, month]) => {
            const matches = (month.matches || []).filter(match => {
                if (activeFilter === 'all') return true;
                if (activeFilter === 'played') return isPlayedMatch(match);
                if (activeFilter === 'upcoming') return !isPlayedMatch(match);
                return matchTypeKey(match) === activeFilter;
            });

            return { ...month, monthKey, matches };
        });

        return months.filter(month => month.matches.length > 0)
            .sort((left, right) => String(left.date || '').localeCompare(String(right.date || '')));
    }

    function resolveOpenMonthKey(months) {
        if (!months.length) return null;
        if (openMonthKey && months.some(month => month.monthKey === openMonthKey)) return openMonthKey;

        const activeMonth = months.find(month => month.current_month);
        return activeMonth?.monthKey || months[0].monthKey;
    }

    function getSummary(matches) {
        const played = matches.filter(isPlayedMatch);

        let wins = 0;
        let draws = 0;
        let losses = 0;
        let goalsFor = 0;
        let goalsAgainst = 0;

        played.forEach(match => {
            const [homeGoals, awayGoals] = String(match.result).split('-').map(Number);
            const matchGoalsFor = isHomeMatch(match) ? homeGoals : awayGoals;
            const matchGoalsAgainst = isHomeMatch(match) ? awayGoals : homeGoals;

            goalsFor += matchGoalsFor;
            goalsAgainst += matchGoalsAgainst;

            if (matchGoalsFor > matchGoalsAgainst) wins += 1;
            else if (matchGoalsFor === matchGoalsAgainst) draws += 1;
            else losses += 1;
        });

        return {
            total: matches.length,
            wins,
            draws,
            losses,
            goalsFor,
            goalsAgainst,
        };
    }

    function getFilterButtons(matches) {
        const counts = {
            all: matches.length,
            played: 0,
            upcoming: 0,
            league: 0,
            friendly: 0,
            friendly_league: 0,
            cup: 0,
            international_cup: 0,
        };

        matches.forEach(match => {
            if (isPlayedMatch(match)) counts.played += 1;
            else counts.upcoming += 1;

            const matchType = matchTypeKey(match);
            if (Object.prototype.hasOwnProperty.call(counts, matchType)) {
                counts[matchType] += 1;
            }
        });

        const buttons = [
            ['all', 'All'],
            ['played', 'Played'],
            ['upcoming', 'Upcoming'],
            ['league', 'League'],
            ['friendly', 'Friendly'],
            ['friendly_league', 'Friendly League'],
            ['cup', 'Cup'],
            ['international_cup', 'International Cup'],
        ];

        return buttons
            .filter(([key]) => counts[key] > 0)
            .map(([key, label]) => buttonHtml({
                label: `${label} (${counts[key]})`,
                color: 'primary',
                active: activeFilter === key,
                size: 'xs',
                shape: 'full',
                attrs: { 'data-filter': key },
            }))
            .join('');
    }

    function buildMonthContent(month) {
        return TmFixturesList.render(TmFixturesList.fromMatches(month.matches), { myClubId: CLUB_ID, linkUpcoming: true, showType: true });
    }

    function render() {
        if (!fixturesData) return;

        const filteredMonths = getFilteredMonths(fixturesData);
        const filteredMatches = filteredMonths.flatMap(month => month.matches);
        const summary = getSummary(filteredMatches);
        const allMatches = getAllMatches(fixturesData);
        openMonthKey = resolveOpenMonthKey(filteredMonths);

        container.innerHTML = `
            <div class="tmcf-wrap">
                ${TmSummaryStrip.render([
                    { label: 'Total Matches', value: String(summary.total) },
                    { label: 'Wins', value: String(summary.wins), valueStyle: 'color:var(--tmu-success)' },
                    { label: 'Draws', value: String(summary.draws), valueStyle: 'color:var(--tmu-warning)' },
                    { label: 'Losses', value: String(summary.losses), valueStyle: 'color:var(--tmu-danger)' },
                    { label: 'Goals For', value: String(summary.goalsFor) },
                    { label: 'Goals Against', value: String(summary.goalsAgainst) },
                ], { cls: 'tmcf-summary', variant: 'boxed', valueFirst: true, align: 'center' })}
                <section class="tmcf-filters">${getFilterButtons(allMatches)}</section>
                <section id="tmcf-months"></section>
            </div>
        `;

        const monthsHost = container.querySelector('#tmcf-months');
        if (!monthsHost) return;

        if (!filteredMonths.length) {
            monthsHost.innerHTML = TmUI.empty('No fixtures match the selected filter.');
            attachEvents(container);
            return;
        }

        const tabs = TmUI.tabs({
            items: filteredMonths.map(m => ({ key: m.monthKey, label: m.date_name || m.month || 'Month' })),
            active: openMonthKey,
            onChange: key => { openMonthKey = key; render(); },
        });
        monthsHost.appendChild(tabs);

        const activeMonth = filteredMonths.find(m => m.monthKey === openMonthKey) || filteredMonths[0];
        const contentDiv = document.createElement('div');
        contentDiv.className = 'tmcf-month-content';
        contentDiv.innerHTML = buildMonthContent(activeMonth);
        monthsHost.appendChild(contentDiv);

        TmFixturesList.bindHover(contentDiv);

        attachEvents(container);
    }

    function attachEvents(container) {
        if (container.dataset.tmcfEventsBound === '1') return;
        container.dataset.tmcfEventsBound = '1';

        container.addEventListener('click', (event) => {
            const filterButton = event.target.closest('[data-filter]');
            if (filterButton && container.contains(filterButton)) {
                const nextFilter = filterButton.getAttribute('data-filter') || 'all';
                if (nextFilter === activeFilter) return;
                activeFilter = nextFilter;
                render();
                return;
            }

            const row = event.target.closest('.tmvu-fixture-row[data-mid]');
            if (row && container.contains(row) && !event.target.closest('a')) {
                window.location.href = `/matches/${row.dataset.mid}/`;
            }
        });
    }

    async function init() {
        TmClubFixturesStyles.inject();
        container.innerHTML = TmUI.loading('Loading club fixtures...');

        try {
            const data = await TmClubService.fetchClubFixtures(CLUB_ID);
            if (!data) throw new Error('Failed to fetch club fixtures');
            fixturesData = data;
            render();
        } catch (error) {
            container.innerHTML = TmUI.error(`Error loading club fixtures: ${error.message}`);
        }
    }

    init();
}