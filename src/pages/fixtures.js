import { TmUI } from '../components/shared/tm-ui.js';
import { TmTable } from '../components/shared/tm-table.js';
import { TmClubFixturesStyles } from '../components/club/tm-club-fixtures-styles.js';
import { TmClubService } from '../services/club.js';

(function () {
    'use strict';

    const routeMatch = window.location.pathname.match(/^\/fixtures\/club\/(\d+)\/?$/);
    if (!routeMatch) return;

    const CLUB_ID = routeMatch[1];
    const getContainer = () => document.querySelector('.tmvu-club-main, .column2_a');
    const htmlOf = node => node?.outerHTML || '';
    const buttonHtml = opts => htmlOf(TmUI.button(opts));

    const MATCH_TYPE_META = {
        League: { key: 'league', cls: 'tmcf-type-league' },
        Friendly: { key: 'friendly', cls: 'tmcf-type-friendly' },
        Cup: { key: 'cup', cls: 'tmcf-type-cup' },
        International: { key: 'international', cls: 'tmcf-type-international' },
    };

    let activeFilter = 'all';
    let openMonthKey = null;
    let fixturesData = null;

    function normalizeMatchType(match) {
        const label = match.matchtype_sort || match.matchtype_name || 'Other';
        return MATCH_TYPE_META[label] || { key: 'other', cls: 'tmcf-type-other' };
    }

    function isPlayedMatch(match) {
        return Boolean(match.result && match.result !== 'x-x');
    }

    function isHomeMatch(match) {
        return String(match.hometeam) === CLUB_ID;
    }

    function getOpponentHtml(match) {
        return isHomeMatch(match)
            ? `${match.away_flag || ''}${match.away_link || `<span>${match.awayteam_name || 'Unknown'}</span>`}`
            : `${match.home_flag || ''}${match.home_link || `<span>${match.hometeam_name || 'Unknown'}</span>`}`;
    }

    function getClubName(data) {
        for (const month of Object.values(data || {})) {
            for (const match of month.matches || []) {
                if (String(match.hometeam) === CLUB_ID) return match.hometeam_name || 'Club Fixtures';
                if (String(match.awayteam) === CLUB_ID) return match.awayteam_name || 'Club Fixtures';
            }
        }
        return 'Club Fixtures';
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
                return normalizeMatchType(match).key === activeFilter;
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
            played: matches.filter(isPlayedMatch).length,
            upcoming: matches.filter(match => !isPlayedMatch(match)).length,
            league: matches.filter(match => normalizeMatchType(match).key === 'league').length,
            friendly: matches.filter(match => normalizeMatchType(match).key === 'friendly').length,
            cup: matches.filter(match => normalizeMatchType(match).key === 'cup').length,
            international: matches.filter(match => normalizeMatchType(match).key === 'international').length,
        };

        const buttons = [
            ['all', 'All'],
            ['played', 'Played'],
            ['upcoming', 'Upcoming'],
            ['league', 'League'],
            ['friendly', 'Friendly'],
            ['cup', 'Cup'],
            ['international', 'International'],
        ];

        return buttons
            .filter(([key]) => counts[key] > 0)
            .map(([key, label]) => buttonHtml({
                label: `${label} (${counts[key]})`,
                color: activeFilter === key ? 'lime' : 'secondary',
                size: 'xs',
                shape: 'full',
                attrs: { 'data-filter': key },
            }))
            .join('');
    }

    function getResultClass(match) {
        if (!isPlayedMatch(match)) return 'tmcf-result-upcoming';

        const [homeGoals, awayGoals] = String(match.result).split('-').map(Number);
        const goalsFor = isHomeMatch(match) ? homeGoals : awayGoals;
        const goalsAgainst = isHomeMatch(match) ? awayGoals : homeGoals;
        if (goalsFor > goalsAgainst) return 'tmcf-result-win';
        if (goalsFor < goalsAgainst) return 'tmcf-result-loss';
        return 'tmcf-result-draw';
    }

    function buildMonthTable(month) {
        const items = month.matches.map(match => {
            const typeMeta = normalizeMatchType(match);
            const home = isHomeMatch(match);
            return {
                date: match.date,
                type: `<span class="tmcf-type ${typeMeta.cls}">${match.matchtype_sort || match.matchtype_name || 'Other'}</span>`,
                venue: `<span class="tmcf-venue ${home ? 'tmcf-venue-home' : 'tmcf-venue-away'}">${home ? 'Home' : 'Away'}</span>`,
                opponent: `<div class="tmcf-opponent"><span class="tmcf-opponent-label">${home ? 'vs' : '@'}</span><span class="tmcf-opponent-name">${getOpponentHtml(match)}</span></div>`,
                result: `<span class="tmcf-result ${getResultClass(match)}">${match.match_link || `<span>${match.result || 'x-x'}</span>`}</span>`,
            };
        });

        return TmTable.table({
            cls: 'tmcf-table',
            headers: [
                { key: 'date', label: 'Date', width: '110px', sortable: true, render: value => `<span class="tmcf-date">${value}</span>` },
                { key: 'type', label: 'Type', width: '120px', sortable: false, render: value => value },
                { key: 'venue', label: 'Venue', width: '80px', sortable: false, render: value => value },
                { key: 'opponent', label: 'Opponent', sortable: false, render: value => value },
                { key: 'result', label: 'Result', width: '90px', align: 'c', sortable: false, cls: 'tmcf-result', render: value => value },
            ],
            items,
            sortKey: 'date',
            sortDir: 1,
        });
    }

    function render() {
        const container = getContainer();
        if (!container) return;
        if (!fixturesData) return;

        const filteredMonths = getFilteredMonths(fixturesData);
        const filteredMatches = filteredMonths.flatMap(month => month.matches);
        const summary = getSummary(filteredMatches);
        const allMatches = getAllMatches(fixturesData);
        openMonthKey = resolveOpenMonthKey(filteredMonths);

        container.innerHTML = `
            <div class="tmcf-wrap">
                <section class="tmcf-summary">
                    <div class="tmcf-stat"><div class="tmcf-stat-value">${summary.total}</div><div class="tmcf-stat-label">Total Matches</div></div>
                    <div class="tmcf-stat"><div class="tmcf-stat-value">${summary.wins}</div><div class="tmcf-stat-label">Wins</div></div>
                    <div class="tmcf-stat"><div class="tmcf-stat-value">${summary.draws}</div><div class="tmcf-stat-label">Draws</div></div>
                    <div class="tmcf-stat"><div class="tmcf-stat-value">${summary.losses}</div><div class="tmcf-stat-label">Losses</div></div>
                    <div class="tmcf-stat"><div class="tmcf-stat-value">${summary.goalsFor}</div><div class="tmcf-stat-label">Goals For</div></div>
                    <div class="tmcf-stat"><div class="tmcf-stat-value">${summary.goalsAgainst}</div><div class="tmcf-stat-label">Goals Against</div></div>
                </section>
                <section class="tmcf-filters">${getFilterButtons(allMatches)}</section>
                <section id="tmcf-months"></section>
            </div>
        `;

        const monthsHost = container.querySelector('#tmcf-months');
        if (!monthsHost) return;

        if (!filteredMonths.length) {
            monthsHost.innerHTML = '<div class="tmcf-empty">No fixtures match the selected filter.</div>';
            attachFilterEvents(container);
            return;
        }

        filteredMonths.forEach(month => {
            const isOpen = month.monthKey === openMonthKey;
            const card = document.createElement('section');
            card.className = `tmcf-month${isOpen ? ' is-open' : ''}`;
            const headHtml = buttonHtml({
                cls: 'tmcf-month-head',
                color: 'secondary',
                block: true,
                attrs: { 'data-month-key': month.monthKey, 'aria-expanded': isOpen ? 'true' : 'false' },
                slot: `
                    <span class="tmcf-month-head-main">
                        <span class="tmcf-month-title">${month.date_name || month.month || 'Month'}</span>
                        <span class="tmcf-month-meta">${month.matches.length} match${month.matches.length === 1 ? '' : 'es'}</span>
                    </span>
                    <span class="tmcf-month-arrow">▾</span>
                `,
            });
            card.innerHTML = `
                ${headHtml}
                <div class="tmcf-table-wrap${isOpen ? '' : ' is-collapsed'}"></div>
            `;

            card.querySelector('.tmcf-table-wrap')?.appendChild(buildMonthTable(month));
            monthsHost.appendChild(card);
        });

        attachEvents(container);
    }

    function attachEvents(container) {
        container.querySelectorAll('[data-filter]').forEach(button => {
            button.addEventListener('click', () => {
                const nextFilter = button.getAttribute('data-filter') || 'all';
                if (nextFilter === activeFilter) return;
                activeFilter = nextFilter;
                render();
            });
        });

        container.querySelectorAll('[data-month-key]').forEach(button => {
            button.addEventListener('click', () => {
                const nextMonthKey = button.getAttribute('data-month-key');
                if (!nextMonthKey || nextMonthKey === openMonthKey) return;
                openMonthKey = nextMonthKey;
                render();
            });
        });
    }

    async function init() {
        const container = getContainer();
        if (!container) return;

        TmClubFixturesStyles.inject();
        container.innerHTML = TmUI.loading('Loading club fixtures...');

        try {
            const data = await TmClubService.fetchClubFixtures(CLUB_ID);
            if (!data) throw new Error('Failed to fetch club fixtures');
            fixturesData = data;
            render();
        } catch (error) {
            container.innerHTML = `<div class="tmcf-error">${TmUI.error(`Error loading club fixtures: ${error.message}`)}</div>`;
        }
    }

    function waitForReady() {
        if (getContainer()) {
            init();
        } else {
            window.setTimeout(waitForReady, 300);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForReady, { once: true });
    } else {
        waitForReady();
    }
})();