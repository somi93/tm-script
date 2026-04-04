import { TmButton } from './tm-button.js';
import { TmStandingsTable } from './tm-standings-table.js';

const STYLE_ID = 'tmu-standings-panel-style';

function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = `
        .tmu-standings-panel { overflow: hidden; background: var(--tmu-surface-dark-soft); }
        .tsa-std-controls {
            display: flex; align-items: center; justify-content: space-between;
            padding: var(--tmu-space-xs) var(--tmu-space-md); background: var(--tmu-surface-overlay);
            border-bottom: 1px solid var(--tmu-border-soft-alpha-strong); flex-wrap: wrap; gap: var(--tmu-space-sm);
        }
        .tsa-std-ctrl-group { display: flex; align-items: center; gap: var(--tmu-space-xs); }
        .tsa-std-ctrl-label {
            font-size: var(--tmu-font-2xs); text-transform: uppercase; letter-spacing: 0.08em;
            color: var(--tmu-text-faint); margin-right: var(--tmu-space-xs); user-select: none;
        }
        .tsa-std-controls [data-tmu-venue],
        .tsa-std-controls [data-tmu-form-n] { line-height: 1.2; }
        .form-badge {
            display: inline-flex; align-items: center; justify-content: center;
            width: 16px; height: 16px; border-radius: var(--tmu-space-xs);
            font-size: var(--tmu-font-xs); font-weight: 700; cursor: pointer;
            transition: opacity 0.15s; text-decoration: none; flex: 0 0 auto;
        }
        .form-badge:hover { opacity: 0.75; }
        .std-form-row { display: inline-flex; align-items: center; gap: 2px; flex-wrap: nowrap; white-space: nowrap; }
        .form-w { background: var(--tmu-success); color: #fff; }
        .form-d { background: var(--tmu-warning); color: #fff; }
        .form-l { background: var(--tmu-danger); color: #fff; }
        .form-u { background: var(--tmu-info-fill); color: var(--tmu-text-inverse); }
        .std-hover-opp td { background: var(--tmu-success-fill-strong) !important; outline: 1px solid var(--tmu-success); }
        .std-hover-opp td:first-child { border-left: 3px solid var(--tmu-success) !important; }
        .tmu-std-tooltip {
            position: fixed; z-index: 9999; pointer-events: none;
            background: var(--tmu-surface-card-soft); border: 1px solid var(--tmu-border-embedded);
            border-radius: var(--tmu-space-xs); padding: var(--tmu-space-sm) var(--tmu-space-md);
            font-size: var(--tmu-font-sm); color: var(--tmu-text-strong);
            box-shadow: 0 3px 10px var(--tmu-shadow-panel); white-space: nowrap; display: none;
        }
        .tmu-std-tooltip .sft-score { font-size: var(--tmu-font-md); font-weight: 700; margin-bottom: var(--tmu-space-xs); }
        .tmu-std-tooltip .sft-opp { color: var(--tmu-text-panel-label); font-size: var(--tmu-font-xs); }
    `;
    document.head.appendChild(s);
}

function btnHtml(label, active, disabled, attrs) {
    return TmButton.button({ label, color: 'primary', active, size: 'xs', disabled, attrs }).outerHTML;
}

function renderFormSlice(slice, clubNameById) {
    if (!slice.length) return '<span style="color:var(--tmu-text-dim);font-size:var(--tmu-font-xs)">—</span>';
    return `<span class="std-form-row">${slice.map(f => {
        const cls = f.r === 'W' ? 'form-w' : f.r === 'D' ? 'form-d' : f.r === 'L' ? 'form-l' : 'form-u';
        const oppName = clubNameById.get(f.oppId) || '';
        return `<a class="form-badge ${cls}" href="/matches/${f.id}/" target="_blank"
            data-opp="${f.oppId}" data-score="${f.score || ''}" data-opp-name="${oppName}"
            data-venue="${f.home ? 'H' : 'A'}">${f.r}</a>`;
    }).join('')}</span>`;
}

// paginated=true uses league-style windowed view (includes ? upcoming markers at edges)
function getFormSlice(form, venue, playedCount, formOffset, paginated) {
    const all = form || [];
    if (venue !== 'total') {
        const isHome = venue === 'home';
        return all.filter(f => f.r !== '?' && (isHome ? f.home : !f.home)).slice(-6);
    }
    if (paginated) {
        const windowEnd = Math.min(all.length, Math.max(0, (playedCount || 0) + 1 - (formOffset || 0)));
        return all.slice(Math.max(0, windowEnd - 6), windowEnd);
    }
    return all.filter(f => f.r !== '?').slice(-6);
}

function computeFilteredRows(totalRows, formMap, playedCountMap, venue, formN) {
    const mapped = totalRows.map(r => {
        const form = (formMap && formMap[r.clubId]) || r.form || [];
        const played = form.filter(f => f.r !== '?');
        const venued = venue === 'home' ? played.filter(f => f.home)
            : venue === 'away' ? played.filter(f => !f.home) : played;
        const sliced = formN > 0 ? venued.slice(-formN) : venued;
        let w = 0, d = 0, l = 0, gf = 0, ga = 0;
        sliced.forEach(f => {
            if (f.r === 'W') w++; else if (f.r === 'D') d++; else if (f.r === 'L') l++;
            if (f.score) {
                const p = f.score.split(/[\u2013\u2014-]/);
                if (p.length === 2) { gf += parseInt(p[0], 10) || 0; ga += parseInt(p[1], 10) || 0; }
            }
        });
        return { ...r, gp: sliced.length, w, d, l, gf, ga, pts: w * 3 + d };
    });
    mapped.sort((a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf));
    mapped.forEach((r, i) => { r.rank = i + 1; });
    return mapped;
}

export const TmStandingsPanel = {
    /**
     * Mount a standings panel.
     *
     * Simple mode (friendly-league): pass rows+liveZoneMap, later call setFormData().
     * Controlled mode (league): pass all callbacks; call update() to re-render with new state.
     *
     * @param {HTMLElement} container
     * @param {object} opts
     * @param {Array}    opts.rows
     * @param {object}   opts.liveZoneMap
     * @param {object}   [opts.formMap]
     * @param {object}   [opts.playedCountMap]
     * @param {string}   [opts.venue='total']
     * @param {number}   [opts.formN=0]
     * @param {number}   [opts.formOffset=0]
     * @param {boolean}  [opts.canOlder]
     * @param {boolean}  [opts.canNewer]
     * @param {string}   [opts.historyBanner]     — HTML for history label row (hides controls)
     * @param {Function} [opts.onHistoryBack]      — called when "back to live" clicked
     * @param {Function} [opts.onVenueChange]      — called with new venue; if omitted, updates internally
     * @param {Function} [opts.onFormNChange]      — called with new n; if omitted, updates internally
     * @param {Function} [opts.onFormOlder]        — called when #std-form-older clicked
     * @param {Function} [opts.onFormNewer]        — called when #std-form-newer clicked
     * @param {boolean}  [opts.tooltip]            — enable hover tooltip + row highlight
     * @returns {{ update(partial), setFormData(formMap, playedCountMap) }}
     */
    mount(container, opts = {}) {
        injectStyles();
        TmStandingsTable.injectStyles();
        container.classList.add('tmu-standings-panel');

        // true when the caller owns venue/formN state and handles pagination
        const paginated = !!(opts.onFormOlder || opts.onFormNewer);

        const state = {
            rows: opts.rows || [],
            liveZoneMap: opts.liveZoneMap || {},
            formMap: opts.formMap || null,
            playedCountMap: opts.playedCountMap || null,
            venue: opts.venue || 'total',
            formN: opts.formN || 0,
            formOffset: opts.formOffset || 0,
            historyBanner: opts.historyBanner || null,
            canOlder: opts.canOlder || false,
            canNewer: opts.canNewer || false,
            onVenueChange: opts.onVenueChange || null,
            onFormNChange: opts.onFormNChange || null,
            onFormOlder: opts.onFormOlder || null,
            onFormNewer: opts.onFormNewer || null,
            onHistoryBack: opts.onHistoryBack || null,
        };

        // Optional tooltip element
        let tooltip = null;
        if (opts.tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'tmu-std-tooltip';
            document.body.appendChild(tooltip);
        }
        const posTooltip = (ev) => {
            if (!tooltip) return;
            tooltip.style.left = (ev.clientX + 14) + 'px';
            tooltip.style.top = (ev.clientY - 10) + 'px';
        };

        const render = () => {
            const { rows, liveZoneMap, formMap, playedCountMap, venue, formN, formOffset, historyBanner, canOlder, canNewer } = state;
            const hasForm = formMap != null;
            const isHistory = !!historyBanner;
            const isFiltered = hasForm && !isHistory && (venue !== 'total' || formN > 0);

            const displayRows = isFiltered
                ? computeFilteredRows(rows, formMap, playedCountMap, venue, formN)
                : rows;

            const clubNameById = new Map(rows.map(r => [r.clubId, r.clubName]));

            const getRowForm = (row) => (formMap && formMap[row.clubId]) || row.form || [];
            const getRowPlayedCount = (row) => (playedCountMap && playedCountMap[row.clubId]) || row.playedCount || 0;

            const formHtmlFn = (hasForm && !isHistory)
                ? (form, playedCount) => renderFormSlice(
                    getFormSlice(form, venue, playedCount, formOffset, paginated),
                    clubNameById
                )
                : null;

            const historyHtml = historyBanner
                ? `<div class="tsa-history-banner">${historyBanner}${
                    state.onHistoryBack
                        ? btnHtml('↩ Back to live', false, false, { 'data-tmu-history-back': '1' })
                        : ''
                }</div>`
                : '';

            const venueBtns = ['total', 'home', 'away'].map(v =>
                btnHtml(v.charAt(0).toUpperCase() + v.slice(1), venue === v, !hasForm && v !== 'total', { 'data-tmu-venue': v })
            ).join('');

            const formFilterHtml = hasForm ? `<div class="tsa-std-ctrl-group">
                <span class="tsa-std-ctrl-label">Form</span>
                ${[0, 5, 10, 15, 20, 25, 30].map(n =>
                    btnHtml(n === 0 ? 'All' : String(n), formN === n, false, { 'data-tmu-form-n': String(n) })
                ).join('')}
            </div>` : '';

            const controlsHtml = isHistory ? '' : `
                <div class="tsa-std-controls">
                    <div class="tsa-std-ctrl-group"><span class="tsa-std-ctrl-label">View</span>${venueBtns}</div>
                    ${formFilterHtml}
                </div>`;

            const tableHtml = TmStandingsTable.buildHtml({
                rows: displayRows.map(r => ({ ...r, form: getRowForm(r), playedCount: getRowPlayedCount(r) })),
                liveZoneMap,
                isFiltered,
                showForm: !!(hasForm && !isHistory),
                formHtml: formHtmlFn,
                canOlder,
                canNewer,
            });

            container.innerHTML = historyHtml + controlsHtml + tableHtml;
        };

        container.addEventListener('click', (event) => {
            const vb = event.target.closest('[data-tmu-venue]');
            if (vb && container.contains(vb)) {
                const v = vb.dataset.tmuVenue;
                if (state.onVenueChange) state.onVenueChange(v);
                else { state.venue = v; render(); }
                return;
            }
            const fb = event.target.closest('[data-tmu-form-n]');
            if (fb && container.contains(fb)) {
                const n = parseInt(fb.dataset.tmuFormN, 10);
                if (state.onFormNChange) state.onFormNChange(n);
                else { state.formN = n; render(); }
                return;
            }
            // Pagination arrows generated by TmStandingsTable in the Form column header
            if (event.target.closest('#std-form-older')) { state.onFormOlder?.(); return; }
            if (event.target.closest('#std-form-newer')) { state.onFormNewer?.(); return; }
            if (event.target.closest('[data-tmu-history-back]')) { state.onHistoryBack?.(); }
        });

        if (tooltip) {
            container.addEventListener('mouseover', (event) => {
                const badge = event.target.closest('.form-badge[data-opp]');
                if (!badge || !container.contains(badge)) return;
                const oppId = badge.dataset.opp;
                container.querySelectorAll('tr[data-club]').forEach(tr =>
                    tr.classList.toggle('std-hover-opp', tr.dataset.club === oppId));
                const venue = badge.dataset.venue;
                tooltip.innerHTML = `<div class="sft-score">${badge.dataset.score} <span style="color:var(--tmu-text-panel-label)">(${venue})</span></div><div class="sft-opp">vs ${badge.dataset.oppName}</div>`;
                posTooltip(event);
                tooltip.style.display = 'block';
            });
            container.addEventListener('mousemove', (event) => {
                if (event.target.closest('.form-badge[data-opp]') && tooltip.style.display === 'block') posTooltip(event);
            });
            container.addEventListener('mouseout', (event) => {
                const badge = event.target.closest('.form-badge[data-opp]');
                if (!badge || !container.contains(badge) || badge.contains(event.relatedTarget)) return;
                container.querySelectorAll('tr[data-club].std-hover-opp').forEach(tr => tr.classList.remove('std-hover-opp'));
                tooltip.style.display = 'none';
            });
        }

        render();

        return {
            update(partial) { Object.assign(state, partial); render(); },
            setFormData(newFormMap, newPlayedCountMap) {
                state.formMap = newFormMap;
                state.playedCountMap = newPlayedCountMap;
                render();
            },
        };
    },

    /**
     * Build formMap + playedCountMap from the league fixtures API response.
     * Format: { 'YYYY-MM': { matches: [{ id, hometeam, awayteam, result, date }] } }
     */
    buildFormData(fixtures) {
        const formMap = {};
        const playedCountMap = {};
        const ensure = (id) => { if (!formMap[id]) { formMap[id] = []; playedCountMap[id] = 0; } };
        const all = [];
        Object.values(fixtures || {}).forEach(month => { if (month?.matches) all.push(...month.matches); });
        all.filter(m => m.result).sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(m => {
            const parts = String(m.result).split('-').map(Number);
            if (parts.length !== 2) return;
            const [hg, ag] = parts;
            const hid = String(m.hometeam), aid = String(m.awayteam);
            ensure(hid); ensure(aid);
            formMap[hid].push({ r: hg > ag ? 'W' : hg < ag ? 'L' : 'D', id: m.id, oppId: aid, score: `${hg}\u2013${ag}`, home: true });
            formMap[aid].push({ r: ag > hg ? 'W' : ag < hg ? 'L' : 'D', id: m.id, oppId: hid, score: `${ag}\u2013${hg}`, home: false });
            playedCountMap[hid]++;
            playedCountMap[aid]++;
        });
        all.filter(m => !m.result).forEach(m => {
            const hid = String(m.hometeam), aid = String(m.awayteam);
            ensure(hid); ensure(aid);
            formMap[hid].push({ r: '?', id: m.id, oppId: aid, score: '', home: true });
            formMap[aid].push({ r: '?', id: m.id, oppId: hid, score: '', home: false });
        });
        return { formMap, playedCountMap };
    },
};
