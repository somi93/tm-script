/**
 * tm-match-stats-panel.js
 *
 * TmMatchStatsPanel.create({ match, expandable })
 *   match      — normalized match object
 *   expandable — if true, attacking style rows are clickable (expand to play-by-play)
 *
 * panel.update(stats) — stats is the output of deriveStats(match, replayState)
 */

import { TmStatsStyles } from '../stats/tm-stats-styles.js';
import { TmStatsBarsSection } from '../stats/tm-stats-bars-section.js';
import { buildPlayHtml, ensureReportStyles } from './tm-match-report.js';

const STYLE_ID = 'mp-stats-panel-style';

const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .mp-sp-wrap { max-width: 860px; margin: 0 auto; padding: var(--tmu-space-md); background: var(--tmu-surface-embedded); }

        /* expandable play detail */
        .mp-sp-adv-expand-row { display: none; }
        .mp-sp-adv-expand-row.visible { display: table-row; }
        .mp-sp-adv-expand-row td { background: var(--tmu-surface-overlay) !important; border-top: none !important; padding: 0 !important; }
        .mp-sp-adv-events-list { display: flex; flex-direction: column; }
        .tsa-adv-expandable { cursor: pointer; }
        .tsa-adv-expandable:hover { background: var(--tmu-surface-dark-mid) !important; }
        .mp-sp-adv-arrow { font-size: 9px; margin-left: 4px; color: var(--tmu-text-muted); }
    `;
    document.head.appendChild(s);
};

// ── Inject expandable arrows + detail rows into the adv table ────────────────

const wireExpandable = (tableEl, advData, side, expandedSet, match, nameMap) => {
    const tbody = tableEl.querySelector('tbody');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr:not(.tsa-adv-total)');
    const STYLE_ORDER = ['Direct', 'Short Passing', 'Through Balls', 'Long Balls', 'Wings', 'Corners', 'Free Kicks', 'Penalties'];

    rows.forEach((tr, i) => {
        const style = STYLE_ORDER[i];
        if (!style) return;
        const events = advData[style]?.events || [];
        if (!events.length) return;

        const key = `${side}:${style}`;
        const firstCell = tr.cells[0];
        if (firstCell) {
            const arrow = document.createElement('span');
            arrow.className = 'mp-sp-adv-arrow';
            arrow.textContent = expandedSet.has(key) ? ' ▼' : ' ▶';
            firstCell.appendChild(arrow);
            tr.classList.add('tsa-adv-expandable');
            tr.dataset.advKey = key;
        }

        const detailTr = document.createElement('tr');
        detailTr.className = 'mp-sp-adv-expand-row' + (expandedSet.has(key) ? ' visible' : '');
        detailTr.dataset.advDetail = key;
        const td = detailTr.insertCell();
        td.colSpan = tr.cells.length;
        const list = document.createElement('div');
        list.className = 'mp-sp-adv-events-list';
        for (const { min, play } of events) {
            const tmp = document.createElement('div');
            tmp.innerHTML = buildPlayHtml(play, min, match, nameMap);
            if (tmp.firstChild) list.appendChild(tmp.firstChild);
        }
        td.appendChild(list);
        tr.insertAdjacentElement('afterend', detailTr);
    });
};

// ── Public component ─────────────────────────────────────────────────────────

export const TmMatchStatsPanel = {
    create({ match, expandable = true }) {
        injectStyles();
        TmStatsStyles.inject();
        ensureReportStyles();

        const nameMap = {};
        [...(match.home.lineup || []), ...(match.away.lineup || [])].forEach(p => {
            nameMap[String(p.id)] = p.name || '?';
        });

        const el = document.createElement('div');
        el.className = 'mp-sp-wrap tsa-card-host';

        const expandedAdv = expandable ? new Set() : null;

        const update = (stats) => {
            const { home, away, homePoss, awayPoss } = stats;
            const { html, mountAdvTables } = TmStatsBarsSection.render({
                bars: {
                    goals:     [home.goals, away.goals],
                    poss:      [homePoss, awayPoss],
                    shots:     [home.shots, away.shots],
                    sot:       [home.sot, away.sot],
                    yellow:    [home.yellow, away.yellow],
                    red:       [home.red, away.red],
                    freekicks: [home.corners, away.corners],
                    penalties: [home.penalties, away.penalties],
                },
                advLeft:    home.advanced,
                advRight:   away.advanced,
                leftTone:   'home',
                rightTone:  'away',
                leftLabel:  match.home.club.name || null,
                rightLabel: match.away.club.name || null,
            });
            el.innerHTML = html;
            mountAdvTables(el, {
                onTable: (tbl, side) => {
                    const matchSide = side === 'left' ? 'home' : 'away';
                    const advData   = side === 'left' ? home.advanced : away.advanced;
                    if (expandedAdv) wireExpandable(tbl, advData, matchSide, expandedAdv, match, nameMap);
                    if (expandable) {
                        tbl.addEventListener('click', e => {
                            const tr = e.target.closest('tr.tsa-adv-expandable');
                            if (!tr) return;
                            const key = tr.dataset.advKey;
                            if (!key) return;
                            if (expandedAdv.has(key)) expandedAdv.delete(key); else expandedAdv.add(key);
                            const arrow = tr.querySelector('.mp-sp-adv-arrow');
                            if (arrow) arrow.textContent = expandedAdv.has(key) ? ' ▼' : ' ▶';
                            const detailTr = tbl.querySelector(`tr[data-adv-detail="${key}"]`);
                            if (detailTr) detailTr.classList.toggle('visible', expandedAdv.has(key));
                        });
                    }
                },
            });
        };

        return { el, update };
    },
};
