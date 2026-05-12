import { TmMatchHoverCard } from '../components/shared/tm-match-hover-card.js';
import { TmTournamentCards } from '../components/shared/tm-tournament-cards.js';
import { TmTournamentPage } from '../components/shared/tm-tournament-page.js';
import { TmUI } from '../components/shared/tm-ui.js';
import { injectTmPageLayoutStyles } from '../components/shared/tm-page-layout.js';
import { roundLabelFromCount } from '../components/shared/tm-cup-page.js';

'use strict';

const STYLE_ID = 'tmvu-cup-history-page-style';

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    injectTmPageLayoutStyles();
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .tmvu-cuhist-page {
            --tmu-page-main-track: minmax(0, 1fr);
        }
        .tmvu-cuhist-season-bar {
            display: flex;
            align-items: center;
            gap: var(--tmu-space-md);
            padding: var(--tmu-space-sm) var(--tmu-space-md);
            background: var(--tmu-card-bg, var(--tmu-surface-tab-active));
            border: 1px solid var(--tmu-border-input-overlay);
            border-radius: var(--tmu-space-sm);
        }
        .tmvu-cuhist-season-label {
            font-size: var(--tmu-font-xs);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: var(--tmu-text-panel-label);
            flex-shrink: 0;
        }
        .tmvu-cuhist-season-select {
            flex: 1 1 auto;
            max-width: 180px;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid var(--tmu-border-input-overlay);
            background: var(--tmu-surface-input, #1a1a2e);
            color: var(--tmu-text-main);
            font-size: var(--tmu-font-sm);
            cursor: pointer;
        }
    `;
    document.head.appendChild(s);
}

const escapeHtml = (v) => String(v || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// ── DOM parsing helpers ──────────────────────────────────────────────────────

function parseSeasons(sourceRoot) {
    return Array.from(sourceRoot.querySelectorAll('#stats_type option')).map(opt => ({
        value: opt.value,
        label: opt.textContent.trim(),
        selected: opt.hasAttribute('selected') || opt.selected,
    })).filter(s => s.value);
}

function extractCalendarDay(li) {
    // <img src="/pics/mini_calendar/calendar_numeral_8.png"> → '8'
    const src = li.querySelector('.match_date img')?.getAttribute('src') || '';
    const m = src.match(/calendar_numeral_(\d+)\.png/);
    return m ? m[1] : null; // null means same day as previous
}

function parseMatchFromLi(li) {
    const scoreEl = li.querySelector('.match_results [match_link]');
    const matchId = scoreEl?.getAttribute('match_link') || '';
    const season = scoreEl?.getAttribute('match_season') || '';
    const scoreText = scoreEl?.textContent.trim() || 'x-x';

    const homeEl = li.querySelector('.hometeam a');
    const awayEl = li.querySelector('.awayteam a');

    const homeId = homeEl?.getAttribute('club_link') || homeEl?.getAttribute('href')?.match(/\/club\/(\d+)\//)?.[1] || '';
    const awayId = awayEl?.getAttribute('club_link') || awayEl?.getAttribute('href')?.match(/\/club\/(\d+)\//)?.[1] || '';

    return {
        matchId,
        season,
        scoreText,
        scoreHref: matchId ? `/matches/${matchId}/` : '#',
        isPlayed: /\d-\d/.test(scoreText),
        home: {
            id: homeId,
            name: homeEl?.textContent.trim() || '?',
            href: homeEl?.getAttribute('href') || (homeId ? `/club/${homeId}/` : '#'),
        },
        away: {
            id: awayId,
            name: awayEl?.textContent.trim() || '?',
            href: awayEl?.getAttribute('href') || (awayId ? `/club/${awayId}/` : '#'),
        },
    };
}

// Returns [{title, rows}] grouped by round (date) within each month,
// in chronological order (so caller can reverse for latest-first display).
function parseRounds(sourceRoot) {
    const rounds = []; // [{title: 'January 2026 · Day 8', rows: [...]}]

    const monthSections = sourceRoot.querySelectorAll('.column2_a h3, .column2 h3');

    monthSections.forEach(h3 => {
        const monthLabel = h3.textContent.trim();
        const ul = h3.nextElementSibling;
        if (!ul || ul.tagName !== 'UL') return;

        const lis = Array.from(ul.querySelectorAll('li'));
        let currentDay = null;
        let currentRows = [];

        const flushRound = () => {
            if (currentRows.length) {
                const title = currentDay ? `${monthLabel} · Day ${currentDay}` : monthLabel;
                rounds.push({ title, rows: currentRows });
                currentRows = [];
            }
        };

        lis.forEach(li => {
            const day = extractCalendarDay(li);
            if (day !== null) {
                flushRound();
                currentDay = day;
            }
            currentRows.push(parseMatchFromLi(li));
        });

        flushRound();
    });

    return rounds;
}

function parseMenu(sourceRoot) {
    return Array.from(sourceRoot.querySelectorAll('.column1 .content_menu > *')).flatMap(node => {
        if (node.tagName === 'HR') return [{ type: 'separator' }];
        if (node.tagName !== 'A') return [];
        return [{
            type: 'link',
            href: node.getAttribute('href') || '#',
            label: node.textContent.trim(),
            icon: /cup/i.test(node.textContent) ? '🏆' : /fixture/i.test(node.textContent) ? '📅' : /stat/i.test(node.textContent) ? '📊' : /history/i.test(node.textContent) ? '📜' : '📋',
        }];
    });
}

// ── Season selector ──────────────────────────────────────────────────────────

function buildSeasonBar(seasons, currentSeason) {
    const wrap = document.createElement('div');
    wrap.className = 'tmvu-cuhist-season-bar';

    const label = document.createElement('span');
    label.className = 'tmvu-cuhist-season-label';
    label.textContent = 'Season';
    wrap.appendChild(label);

    const sel = document.createElement('select');
    sel.className = 'tmvu-cuhist-season-select';
    seasons.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.value;
        opt.textContent = s.label;
        if (s.selected || s.value === String(currentSeason)) opt.selected = true;
        sel.appendChild(opt);
    });

    // Navigate to the selected season's URL on change
    const pathBase = window.location.pathname.replace(/\/\d+\/?$/, '').replace(/\/$/, '');
    sel.addEventListener('change', () => {
        window.location.href = `${pathBase}/${sel.value}/`;
    });

    wrap.appendChild(sel);
    return wrap;
}

// ── Main ─────────────────────────────────────────────────────────────────────

export function initCupHistoryPage(main) {
    if (!main || !main.isConnected) return;

    const sourceRoot = document.querySelector('.main_center') || document.body;
    const currentSeason = window.location.pathname.match(/\/history\/cup\/[^/]+\/(\d+)/)?.[1] || '';
    const currentPath = window.location.pathname;

    injectStyles();
    TmTournamentCards.injectStyles();
    TmMatchHoverCard.injectStyles();

    const seasons = parseSeasons(sourceRoot);
    const rounds = parseRounds(sourceRoot).reverse(); // latest first
    const menuItems = parseMenu(sourceRoot);

    // Season picker card
    const seasonEl = buildSeasonBar(seasons, currentSeason);

    // Round cards — show all rounds for this season
    const roundCards = rounds.map(round =>
        TmTournamentCards.renderDrawCard(
            { title: roundLabelFromCount(round.rows.length), rows: round.rows },
            { season: currentSeason ? Number(currentSeason) : null, icon: '📅' }
        )
    );

    TmTournamentPage.mount(main, {
        pageClass: 'tmvu-cuhist-page tmu-page-layout-3rail tmu-page-density-regular',
        navId: 'tmvu-cuhist-nav',
        navClass: 'tmvu-cup-nav tmu-page-sidebar-stack',
        menuItems,
        currentHref: currentPath,
        mainClass: 'tmvu-cup-main tmu-page-section-stack',
        sideClass: null,
        mainNodes: [seasonEl, ...roundCards],
        sideNodes: [],
        season: currentSeason ? Number(currentSeason) : null,
    });
}
