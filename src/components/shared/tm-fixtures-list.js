import { TmFixtureMatchRow } from './tm-fixture-match-row.js';
import { TmMatchHoverCard } from './tm-match-hover-card.js';

const STYLE_ID = 'tmvu-fixtures-list-style';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .tmvu-fix-list { display: flex; flex-direction: column; }
        .tmvu-fix-date-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: var(--tmu-space-xs) var(--tmu-space-md);
            font-size: var(--tmu-font-xs); font-weight: 700; color: var(--tmu-text-faint);
            text-transform: uppercase; letter-spacing: 0.5px;
            background: var(--tmu-color-accent); border-top: 1px solid var(--tmu-border-soft-alpha);
        }
        .tmvu-fix-list .tmvu-fix-date-header:first-child { border-top: none; }
        .tmvu-fix-date-sub { color: var(--tmu-text-dim); font-size: var(--tmu-font-xs); font-weight: 700; }
    `;
    document.head.appendChild(style);
};

const formatDate = (dateStr) => {
    const d = new Date(dateStr + 'T12:00:00');
    return isNaN(d) ? dateStr : d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
};

// Group a flat match array by match.date, returning [{ label, sub, matches }]
const fromMatches = (matches, getDateSub = null) => {
    const byDate = {};
    matches.forEach(m => { (byDate[m.date || ''] = byDate[m.date || ''] || []).push(m); });
    return Object.keys(byDate).sort().map(date => ({
        label: formatDate(date),
        sub: getDateSub ? getDateSub(date, byDate[date]) : '',
        matches: byDate[date],
    }));
};

// groups: [{ label: string, sub?: string, matches: [] }]
const render = (groups, { myClubId = null, season = '', showTvBadge = false, linkUpcoming = false, extraRowClass = '', showType = false } = {}) => {
    injectStyles();
    if (!groups?.length) return '';
    let i = 0;
    return '<div class="tmvu-fix-list">' + groups.map(({ label, sub, matches }) => {
        if (!matches?.length) return '';
        const header = `<div class="tmvu-fix-date-header"><span>${label}</span>${sub ? `<span class="tmvu-fix-date-sub">${sub}</span>` : ''}</div>`;
        return header + matches.map(m => TmFixtureMatchRow.render(m, { index: i++, myClubId, season, showTvBadge, linkUpcoming, extraClass: extraRowClass, showType })).join('');
    }).join('') + '</div>';
};

// Binds match hover cards to all fixture rows inside a rendered container.
// Call after the render() output has been injected into the DOM.
const bindHover = (container, { season } = {}) => {
    if (!container) return;
    TmMatchHoverCard.bind(Array.from(container.querySelectorAll('.tmvu-fixture-row[data-mid]')), { season });
};

// Binds delegated row-click navigation (clicks on a row → /matches/:id/).
// Ignores clicks on <a> elements inside the row.
const bindRowNav = (container) => {
    if (!container || container.__tmRowNavBound === '1') return;
    container.__tmRowNavBound = '1';
    container.addEventListener('click', (event) => {
        if (event.target.closest('a')) return;
        const row = event.target.closest('.tmvu-fixture-row[data-mid]');
        if (row && container.contains(row)) {
            window.location.href = row.dataset.href || `/matches/${row.dataset.mid}/`;
        }
    });
};

export const TmFixturesList = { render, fromMatches, bindHover, bindRowNav };
