import { TmUI } from '../shared/tm-ui.js';
import { TmFixtureMatchRow } from '../shared/tm-fixture-match-row.js';
import { TmMatchH2HTooltip } from '../match/tm-match-h2h-tooltip.js';
import { TmLeagueStandings } from './tm-league-standings.js';

/**
 * TmLeagueFixtures
 *
 * Handles live fixtures tab, history fixtures, and match tooltip helpers.
 * Reads and writes shared state via window.TmLeagueCtx.
 */

if (!document.getElementById('tsa-league-fixtures-style')) {
    const _s = document.createElement('style');
    _s.id = 'tsa-league-fixtures-style';
    _s.textContent = `
            .fix-date-header {
                padding: 4px 12px; font-size: 10px; font-weight: 700;
                color: var(--tmu-text-faint); text-transform: uppercase; letter-spacing: 0.5px;
                background: var(--tmu-surface-overlay-soft); border-top: 1px solid var(--tmu-border-soft-alpha);
            }
        `;
    document.head.appendChild(_s);
}

const createMonthTabs = ({ items, active, currentKeys = [], onChange }) => {
    const tabs = TmUI.tabs({ items, active, onChange });
    tabs.classList.add('fix-month-tabs');
    tabs.querySelectorAll('.tmu-tab').forEach(btn => {
        if (currentKeys.includes(btn.dataset.tab)) btn.classList.add('fix-month-current');
    });
    return tabs;
};

const parseHistoryMatches = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const h3s = [...doc.querySelectorAll('h3.slide_toggle_open')];
    const groups = [];
    h3s.forEach(h3 => {
        const monthLabel = h3.textContent.trim();
        let ul = h3.nextElementSibling;
        while (ul && !(ul.tagName === 'UL' && ul.classList.contains('match_list'))) ul = ul.nextElementSibling;
        if (!ul) return;
        let currentDay = 1;
        const matches = [];
        ul.querySelectorAll('li').forEach(li => {
            const dateSpan = li.querySelector('.match_date');
            if (dateSpan) {
                const img = dateSpan.querySelector('img[src]');
                if (img) {
                    const m = img.getAttribute('src').match(/calendar_numeral_(\d+)/);
                    if (m) currentDay = parseInt(m[1]);
                }
            }
            const homeA = li.querySelector('.hometeam a[club_link]');
            const awayA = li.querySelector('.awayteam a[club_link]');
            const matchSpan = li.querySelector('[match_link]');
            const scoreA = li.querySelector('a.match_link');
            if (!homeA || !awayA || !matchSpan) return;
            matches.push({
                day: currentDay,
                homeId: homeA.getAttribute('club_link'),
                homeName: homeA.textContent.trim(),
                awayId: awayA.getAttribute('club_link'),
                awayName: awayA.textContent.trim(),
                matchId: matchSpan.getAttribute('match_link'),
                score: scoreA ? scoreA.textContent.trim() : ''
            });
        });
        if (matches.length) groups.push({ monthLabel, matches });
    });
    return groups;
};

const fetchHistoryFixtures = (season) => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById('tsa-fixtures-content');
    if (container && container.style.display !== 'none') {
        container.innerHTML = TmUI.loading(`Loading Season ${season} fixtures…`);
    }
    window.fetch(`/history/league/${s.panelCountry}/${s.panelDivision}/${s.panelGroup}/matches/${season}/`)
        .then(r => r.text())
        .then(html => {
            const groups = parseHistoryMatches(html);
            s.historyFixturesData = { season, groups };
            const cont = document.getElementById('tsa-fixtures-content');
            if (cont && cont.style.display !== 'none') {
                renderHistoryFixturesTab(s.historyFixturesData);
            }
        })
        .catch(() => {
            const cont = document.getElementById('tsa-fixtures-content');
            if (cont && cont.style.display !== 'none') {
                cont.innerHTML = TmUI.error(`Failed to load Season ${season} fixtures`);
            }
        });
};

const renderFixturesTab = (fixtures) => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById('tsa-fixtures-content');
    if (!container || !fixtures) return;

    const myClubId = (s.standingsRows.find(r => r.isMe) || {}).clubId || null;
    const months = Object.entries(fixtures).sort(([a], [b]) => a.localeCompare(b));
    const currentMonthKey = (months.find(([, v]) => v.current_month) || months[0] || [])[0];
    let activeKey = container.dataset.activeMonth || currentMonthKey;
    if (!fixtures[activeKey]) activeKey = currentMonthKey;

    let html = '';
    const monthData = fixtures[activeKey];
    if (monthData && monthData.matches) {
        const byDate = {};
        monthData.matches.forEach(m => { (byDate[m.date] = byDate[m.date] || []).push(m); });
        const sortedDates = Object.keys(byDate).sort();
        let matchIdx = 0;
        html += '<div class="fix-month-body">';
        sortedDates.forEach(date => {
            const d = new Date(date + 'T12:00:00');
            const dayLabel = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
            const round = s.allRounds.find(r => r.date === date);
            const roundLabel = round ? `<span style="color:var(--tmu-text-dim);font-size:10px;float:right">Round ${round.roundNum}</span>` : '';
            html += `<div class="fix-date-header">${dayLabel}${roundLabel}</div>`;
            byDate[date].forEach(m => {
                html += TmFixtureMatchRow.render(m, {
                    index: matchIdx,
                    myClubId,
                    showTvBadge: true,
                    linkUpcoming: true,
                });
                matchIdx += 1;
            });
        });
        html += '</div>';
    } else {
        html += TmUI.empty('No fixtures available');
    }

    container.innerHTML = html;
    if (months.length) {
        const tabs = createMonthTabs({
            items: months.map(([key, data]) => ({ key, label: data.month })),
            active: activeKey,
            currentKeys: months.filter(([, data]) => !!data.current_month).map(([key]) => key),
            onChange: key => {
                container.dataset.activeMonth = key;
                renderFixturesTab(s.fixturesCache);
            },
        });
        container.prepend(tabs);
    }
    container.querySelectorAll('.tmvu-fixture-row[data-mid]').forEach(row => {
        row.addEventListener('click', e => {
            if (e.target.closest('a')) return;
            window.location.href = `/matches/${row.dataset.mid}/`;
        });
    });
};

const showHistFixTooltip = (el, mid, season) => {
    const s = window.TmLeagueCtx;
    clearTimeout(s.histFixTooltipHideTimer);
    if (s.histFixTooltipEl) s.histFixTooltipEl.remove();
    const currentSeasonNum = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
    s.histFixTooltipEl = TmMatchH2HTooltip.show(el, mid, Number(season) === currentSeasonNum);
};

const renderHistoryFixturesTab = (data) => {
    const s = window.TmLeagueCtx;
    const container = document.getElementById('tsa-fixtures-content');
    if (!container || !data) return;
    const myClubId = (s.standingsRows.find(r => r.isMe) || {}).clubId ||
        ((typeof SESSION !== 'undefined' && SESSION.main_id) ? String(SESSION.main_id) : null);
    const { season, groups } = data;
    const activeIdxRaw = parseInt(container.dataset.historyActiveMonth || '0');
    const activeIdx = isNaN(activeIdxRaw) ? 0 : Math.min(activeIdxRaw, groups.length - 1);

    let html = `<div class="tsa-history-banner">📅 Season ${season} ${TmUI.button({
        id: 'tsa-fix-history-live-btn',
        label: '↩ Back to live',
        color: 'secondary',
        size: 'xs',
    }).outerHTML}</div>`;

    const group = groups[activeIdx];
    if (group && group.matches.length) {
        let lastDay = -1;
        let matchIdx = 0;
        html += '<div class="fix-month-body">';
        group.matches.forEach(m => {
            if (m.day !== lastDay) {
                const shortMonth = group.monthLabel.split(' ')[0].slice(0, 3);
                html += `<div class="fix-date-header">${m.day} ${shortMonth}</div>`;
                lastDay = m.day;
            }
            html += TmFixtureMatchRow.render(m, {
                index: matchIdx,
                myClubId,
                season,
                extraClass: 'hfix-match',
            });
            matchIdx += 1;
        });
        html += '</div>';
    } else {
        html += TmUI.empty('No fixtures available');
    }

    container.innerHTML = html;
    if (groups.length > 1) {
        const tabs = createMonthTabs({
            items: groups.map((groupItem, idx) => ({ key: String(idx), label: groupItem.monthLabel })),
            active: String(activeIdx),
            onChange: key => {
                container.dataset.historyActiveMonth = key;
                renderHistoryFixturesTab(s.historyFixturesData);
            },
        });
        container.querySelector('.tsa-history-banner')?.after(tabs);
    }

    document.getElementById('tsa-fix-history-live-btn')?.addEventListener('click', () => {
        const lv = (typeof SESSION !== 'undefined' && SESSION.season) ? Number(SESSION.season) : null;
        s.historyFixturesData = null;
        s.displayedSeason = null;
        container.dataset.historyActiveMonth = '0';
        const chip = document.getElementById('tsa-ssnpick-chip');
        if (chip && lv) chip.textContent = `Season ${lv}`;
        s.standingsRows = [];
        s.formOffset = 0;
        TmLeagueStandings.buildStandingsFromDOM();
        TmLeagueStandings.renderLeagueTable();
        if (s.fixturesCache) renderFixturesTab(s.fixturesCache);
    });

    container.querySelectorAll('.tmvu-fixture-row.hfix-match[data-mid]').forEach(row => {
        if (!row.dataset.mid) return;
        row.addEventListener('mouseenter', () => {
            clearTimeout(s.histFixTooltipHideTimer);
            const mid = row.dataset.mid;
            const rowSeason = row.dataset.season;
            s.histFixTooltipTimer = setTimeout(() => showHistFixTooltip(row, mid, rowSeason), 300);
        });
        row.addEventListener('mouseleave', () => {
            clearTimeout(s.histFixTooltipTimer);
            s.histFixTooltipHideTimer = setTimeout(() => {
                if (s.histFixTooltipEl) { s.histFixTooltipEl.remove(); s.histFixTooltipEl = null; }
            }, 100);
        });
    });
};

export const TmLeagueFixtures = {
    fetchHistoryFixtures,
    renderFixturesTab,
    renderHistoryFixturesTab
};
