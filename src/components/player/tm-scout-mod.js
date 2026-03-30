import { TmPlayerService } from '../../services/player.js';
import { TmPlayerDataTable } from './tm-player-data-table.js';
import { TmUI } from '../shared/tm-ui.js';
import { TmScoutReportCards } from '../shared/tm-scout-report-cards.js';
import { TmUtils } from '../../lib/tm-utils.js';

const CSS = `
/* ═══════════════════════════════════════
   SCOUT (tmsc-*)
   ═══════════════════════════════════════ */
#tmsc-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--tmu-text-main); line-height: 1.4;
}
.tmsc-wrap {
    background: transparent; border-radius: 0; border: none; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--tmu-text-main); font-size: 13px;
}
.tmu-tabs.tmsc-tabs { margin: 10px 14px 6px; border-radius: 6px; overflow: hidden; }
.tmsc-body { padding: 6px 14px 16px; font-size: 13px; min-height: 120px; }
.tmsc-tbl { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 4px; }
.tmsc-tbl th {
    padding: 6px; font-size: 10px; font-weight: 700; color: var(--tmu-text-faint);
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #2a4a1c;
    text-align: left; white-space: nowrap;
}
.tmsc-tbl th.c { text-align: center; }
.tmsc-tbl td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: var(--tmu-text-main); font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmsc-tbl td.c { text-align: center; }
.tmsc-tbl tr:hover { background: rgba(255,255,255,.03); }
.tmsc-tbl a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmsc-tbl a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmsc-stars { font-size: 20px; letter-spacing: 2px; line-height: 1; }
.tmsc-star-full { color: var(--tmu-warning); }
.tmsc-star-half {
    background: linear-gradient(90deg, var(--tmu-warning) 50%, var(--tmu-border-embedded) 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-empty { color: var(--tmu-border-embedded); }
.tmsc-report { display: flex; flex-direction: column; gap: 14px; }
.tmsc-report-header { padding-bottom: 10px; border-bottom: 1px solid #2a4a1c; }
.tmsc-report-scout { color: var(--tmu-text-strong); font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.tmsc-report-date {
    color: var(--tmu-text-faint); font-size: 11px; font-weight: 600;
    background: rgba(42,74,28,.4); padding: 3px 10px; border-radius: 4px; white-space: nowrap;
}
.tmsc-section-title {
    color: var(--tmu-text-faint); font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; padding-bottom: 6px; border-bottom: 1px solid #2a4a1c; margin-bottom: 8px;
}
.tmsc-bar-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.tmsc-bar-label { color: var(--tmu-text-panel-label); font-size: 11px; font-weight: 600; width: 100px; flex-shrink: 0; }
.tmsc-bar-track {
    flex: 1; height: 6px; background: #1a2e10; border-radius: 3px;
    overflow: hidden; max-width: 120px; position: relative;
}
.tmsc-bar-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.tmsc-bar-fill-reach {
    position: absolute; top: 0; left: 0; height: 100%;
    border-radius: 3px; transition: width 0.3s;
}
.tmsc-bar-text { font-size: 11px; font-weight: 600; min-width: 60px; }
.tmsc-league-cell { white-space: nowrap; font-size: 11px; }
.tmsc-league-cell a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmsc-league-cell a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmsc-club-cell a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmsc-club-cell a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmsc-online { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-left: 4px; vertical-align: middle; }
.tmsc-online.on { background: var(--tmu-success); box-shadow: 0 0 4px rgba(108,192,64,.5); }
.tmsc-online.off { background: #3d3d3d; }
.tmsc-error {
    text-align: center; color: var(--tmu-danger); padding: 10px; font-size: 12px; font-weight: 600;
    background: rgba(248,113,113,.06); border: 1px solid rgba(248,113,113,.15);
    border-radius: 4px; margin-bottom: 10px;
}
.tmsc-report-divider { border: none; border-top: 1px dashed var(--tmu-border-embedded); margin: 16px 0; }
.tmsc-report-count {
    color: var(--tmu-text-faint); font-size: 10px; text-align: center; padding: 4px 0;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}
.tmsc-star-green { color: var(--tmu-success); }
.tmsc-star-green-half {
    background: linear-gradient(90deg, var(--tmu-success) 50%, var(--tmu-border-embedded) 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-split {
    background: linear-gradient(90deg, var(--tmu-warning) 50%, var(--tmu-success) 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-best-wrap {
    background: rgba(42,74,28,.3); border: 1px solid #2a4a1c;
    border-radius: 6px; padding: 12px; margin-bottom: 6px;
}
.tmsc-best-title {
    color: var(--tmu-success); font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;
}
.tmsc-best-title::before { content: '★'; font-size: 13px; }
`;
    const _s = document.createElement('style');
    _s.textContent = CSS;
    document.head.appendChild(_s);

    /* ── state ── */
    let _scoutData = null;
    let _root = null;
    let _activeTab = 'report';
    let _containerRef = null;
    let _playerId = null;

    const q = (sel) => _root ? _root.querySelector(sel) : null;
    const qa = (sel) => _root ? _root.querySelectorAll(sel) : [];

    /* ── helpers ── */
    const SPECIALTIES = ['None', 'Strength', 'Stamina', 'Pace', 'Marking', 'Tackling', 'Workrate', 'Positioning', 'Passing', 'Crossing', 'Technique', 'Heading', 'Finishing', 'Longshots', 'Set Pieces'];
    const THEME_COLORS = {
        success: 'var(--tmu-success)',
        info: 'var(--tmu-info)',
        strong: 'var(--tmu-text-strong)',
        warning: 'var(--tmu-warning)',
        danger: 'var(--tmu-danger)',
        accent: 'var(--tmu-accent)',
    };
    const potColor = (pot) => { pot = parseInt(pot); if (pot >= 18) return THEME_COLORS.success; if (pot >= 15) return THEME_COLORS.info; if (pot >= 12) return THEME_COLORS.strong; if (pot >= 9) return THEME_COLORS.warning; return THEME_COLORS.danger; };
    const extractTier = (txt) => { if (!txt) return null; const m = txt.match(/\((\d)\/(\d)\)/); return m ? { val: parseInt(m[1]), max: parseInt(m[2]) } : null; };
    const barColor = (val, max) => { const r = val / max; if (r >= 0.75) return THEME_COLORS.success; if (r >= 0.5) return THEME_COLORS.accent; if (r >= 0.25) return THEME_COLORS.warning; return THEME_COLORS.danger; };
    const fixFlags = (html) => html ? html.replace(/class='flag-img-([^']+)'/g, "class='flag-img-$1 tmsq-flag'").replace(/class="flag-img-([^"]+)"/g, 'class="flag-img-$1 tmsq-flag"') : '';
    const bloomColor = (txt) => { if (!txt) return THEME_COLORS.strong; const t = txt.toLowerCase(); if (t === 'bloomed') return THEME_COLORS.success; if (t.includes('late bloom')) return THEME_COLORS.accent; if (t.includes('middle')) return THEME_COLORS.warning; if (t.includes('starting')) return THEME_COLORS.warning; if (t.includes('not bloomed')) return THEME_COLORS.danger; return THEME_COLORS.strong; };
    const cashColor = (c) => { if (!c) return THEME_COLORS.strong; if (c.includes('Astonishingly')) return THEME_COLORS.success; if (c.includes('Incredibly')) return THEME_COLORS.accent; if (c.includes('Very rich')) return THEME_COLORS.accent; if (c.includes('Rich')) return THEME_COLORS.strong; if (c.includes('Terrible')) return THEME_COLORS.danger; if (c.includes('Poor')) return THEME_COLORS.warning; return THEME_COLORS.strong; };
    const cleanPeakText = (txt) => txt ? txt.replace(/^\s*-\s*/, '').replace(/\s*(physique|tactical ability|technical ability)\s*$/i, '').trim() : '';
    const onlineDot = (on) => `<span class="tmsc-online ${on ? 'on' : 'off'}"></span>`;
    const getScoutForReport = (r) => { if (!_scoutData || !_scoutData.scouts || !r.scoutid) return null; return Object.values(_scoutData.scouts).find(s => String(s.id) === String(r.scoutid)) || null; };
    const setContent = (el, content) => {
        if (!el) return;
        el.innerHTML = '';
        if (content instanceof Node) el.appendChild(content);
        else el.innerHTML = content;
    };

    const greenStarsHtml = (rec) => { rec = parseFloat(rec) || 0; const full = Math.floor(rec); const half = (rec % 1) >= 0.25; let h = ''; for (let i = 0; i < full; i++) h += '<span class="tmsc-star-green">★</span>'; if (half) h += '<span class="tmsc-star-green-half">★</span>'; const e = 5 - full - (half ? 1 : 0); for (let i = 0; i < e; i++) h += '<span class="tmsc-star-empty">★</span>'; return h; };

    const combinedStarsHtml = (current, potMax) => {
        current = parseFloat(current) || 0; potMax = parseFloat(potMax) || 0;
        if (potMax < current) potMax = current;
        let h = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= current) h += '<span class="tmsc-star-full">★</span>';
            else if (i - 0.5 <= current && current < i) {
                if (potMax >= i) h += '<span class="tmsc-star-split">★</span>';
                else h += '<span class="tmsc-star-half">★</span>';
            }
            else if (i <= potMax) h += '<span class="tmsc-star-green">★</span>';
            else if (i - 0.5 <= potMax && potMax < i) h += '<span class="tmsc-star-green-half">★</span>';
            else h += '<span class="tmsc-star-empty">★</span>';
        }
        return h;
    };

    const buildScoutsTable = (scouts) => {
        if (!scouts || !Object.keys(scouts).length) return TmUI.empty('No scouts hired', true);
        const skills = ['seniors', 'youths', 'physical', 'tactical', 'technical', 'development', 'psychology'];
        const bodyRows = [];
        for (const s of Object.values(scouts)) {
            const skillCells = skills.map(sk => {
                const v = parseInt(s[sk]) || 0;
                return { content: v, cls: 'c font-semibold', attrs: { style: `color:${TmUtils.skillColor(v)}` } };
            });
            const bc = s.away ? 'tmsc-send-btn tmsc-away' : 'tmsc-send-btn';
            const bl = s.away ? (s.returns || 'Away') : 'Send';
            bodyRows.push({
                cells: [
                    { content: `${s.name} ${s.surname}`, cls: 'font-semibold', attrs: { style: 'color:var(--tmu-text-strong);white-space:nowrap' } },
                    ...skillCells,
                    { content: `<tm-button data-variant="secondary" data-size="xs" data-cls="${bc}" data-scout-id="${s.id}" ${s.away ? `title="${s.returns || ''}"` : ''}>${bl}</tm-button>`, cls: 'c' },
                ],
            });
        }
        return TmPlayerDataTable.table({
            tableClass: 'tmsc-tbl',
            headerRows: [{
                cells: [
                    { content: 'Name' },
                    { content: 'Sen', cls: 'c' },
                    { content: 'Yth', cls: 'c' },
                    { content: 'Phy', cls: 'c' },
                    { content: 'Tac', cls: 'c' },
                    { content: 'Tec', cls: 'c' },
                    { content: 'Dev', cls: 'c' },
                    { content: 'Psy', cls: 'c' },
                    { content: '', cls: 'c' },
                ],
            }],
            bodyRows,
        });
    };

    const buildInterested = (interested) => {
        if (!interested || !interested.length) return TmUI.empty('No interested clubs', true);
        const bodyRows = interested.map(c => {
            const ch = fixFlags(c.club_link || '');
            const lh = fixFlags(c.league_link || '');
            const cc = cashColor(c.cash);
            return {
                cells: [
                    { content: `${ch} ${onlineDot(c.online)}`, cls: 'tmsc-club-cell' },
                    { content: lh, cls: 'tmsc-league-cell' },
                    { content: c.cash, attrs: { style: `color:${cc};font-weight:600;font-size:11px` } },
                ],
            };
        });
        return TmPlayerDataTable.table({
            tableClass: 'tmsc-tbl',
            headerRows: [{ cells: [{ content: 'Club' }, { content: 'League' }, { content: 'Financial' }] }],
            bodyRows,
        });
    };

    const getContent = (tab) => {
        switch (tab) {
            case 'report': return TmScoutReportCards.listHtml({ reports: _scoutData.reports || [], scouts: _scoutData.scouts || {}, error: _scoutData.error, emptyText: 'No scout reports available' });
            case 'scouts': return buildScoutsTable(_scoutData.scouts);
            case 'interested': return buildInterested(_scoutData.interested);
            default: return '';
        }
    };

    const bindSendButtons = () => {
        qa('.tmsc-send-btn').forEach(btn => {
            if (btn.classList.contains('tmsc-away')) return;
            btn.addEventListener('click', () => {
                const scoutId = btn.dataset.scoutId;
                btn.disabled = true; btn.textContent = '...';
                TmPlayerService.fetchPlayerInfo(_playerId, 'scout', { scout_id: scoutId }).then(d => {
                    if (!d) { btn.textContent = 'Error'; btn.style.color = 'var(--tmu-danger)'; setTimeout(() => { btn.textContent = 'Send'; btn.disabled = false; btn.style.color = ''; }, 2000); return; }
                    if (d.scouts || d.reports) { render(_containerRef, d, { playerId: _playerId }); }
                    else { btn.textContent = 'Sent'; btn.style.background = '#274a18'; btn.style.color = 'var(--tmu-success)'; }
                });
            });
        });
    };

    /**
     * render(container, data, { playerId })
     *
     * Renders the scout tab into container.
     *
     * @param {Element} container
     * @param {object}  data      - API response: { reports, scouts, interested, error }
     * @param {object}  [opts]
     * @param {string}  [opts.playerId]
     */
    const render = (container, data, { playerId = _playerId } = {}) => {
        _containerRef = container;
        _scoutData = data;
        _playerId = playerId;
        _activeTab = (data.reports && data.reports.length) ? 'report' : 'scouts';
        container.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.id = 'tmsc-root';
        container.appendChild(wrapper);
        _root = wrapper;

        const TAB_LABELS = { report: 'Report', scouts: 'Scouts', interested: 'Interested' };
        const hasData = k => k === 'report' ? !!(data.reports && data.reports.length > 0)
            : k === 'interested' ? !!(data.interested && data.interested.length > 0)
            : k === 'scouts' ? !!(data.scouts && Object.keys(data.scouts).length > 0) : true;
        const tabsEl = TmUI.tabs({
            items: Object.entries(TAB_LABELS).map(([key, label]) => ({ key, label, disabled: !hasData(key) })),
            active: _activeTab,
            color: 'primary',
            cls: 'tmsc-tabs',
            stretch: true,
            onChange: (key) => {
                _activeTab = key;
                const c = q('#tmsc-tab-content'); if (!c) return;
                setContent(c, getContent(key));
                TmUI?.render(c);
                if (key === 'scouts') bindSendButtons();
            },
        });
        _root.innerHTML = '<div class="tmsc-wrap"></div>';
        const scWrap = _root.querySelector('.tmsc-wrap');
        scWrap.appendChild(tabsEl);
        const bodyEl = document.createElement('div');
        bodyEl.className = 'tmsc-body';
        bodyEl.id = 'tmsc-tab-content';
        setContent(bodyEl, getContent(_activeTab));
        scWrap.appendChild(bodyEl);
        TmUI?.render(_root);
        bindSendButtons();
    };

    /**
     * reRender()  — re-renders with stored data.
     */
    const reRender = () => { if (_containerRef && _scoutData) render(_containerRef, _scoutData); };

    export const TmScoutMod = { render, reRender };
