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
.tmu-tabs.tmsc-tabs { margin: var(--tmu-space-md) var(--tmu-space-lg) var(--tmu-space-sm); border-radius: var(--tmu-space-sm); overflow: hidden; }
.tmsc-body { padding: var(--tmu-space-sm) var(--tmu-space-lg) var(--tmu-space-lg); font-size: 13px; min-height: 120px; }
.tmsc-tbl { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: var(--tmu-space-xs); }
.tmsc-tbl th {
    padding: var(--tmu-space-sm); font-size: 10px; font-weight: 700; color: var(--tmu-text-faint);
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid var(--tmu-border-soft);
    text-align: left; white-space: nowrap;
}
.tmsc-tbl th.c { text-align: center; }
.tmsc-tbl td {
    padding: var(--tmu-space-xs) var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-faint);
    color: var(--tmu-text-main); font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmsc-tbl td.c { text-align: center; }
.tmsc-tbl tr:hover { background: var(--tmu-border-contrast); }
.tmsc-tbl a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmsc-tbl a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmsc-stars { font-size: 20px; letter-spacing: 2px; line-height: 1; }
.tmsc-star-full { color: var(--tmu-warning); }
.tmsc-star-half {
    background: linear-gradient(90deg, var(--tmu-warning) 50%, var(--tmu-border-embedded) 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-empty { color: var(--tmu-border-embedded); }
.tmsc-report { display: flex; flex-direction: column; gap: var(--tmu-space-lg); }
.tmsc-report-header { padding-bottom: var(--tmu-space-md); border-bottom: 1px solid var(--tmu-border-soft); }
.tmsc-report-scout { color: var(--tmu-text-strong); font-weight: 700; font-size: 14px; margin-bottom: var(--tmu-space-xs); }
.tmsc-report-date {
    color: var(--tmu-text-faint); font-size: 11px; font-weight: 600;
    background: var(--tmu-surface-tab-active); padding: var(--tmu-space-xs) var(--tmu-space-md); border-radius: var(--tmu-space-xs); white-space: nowrap;
}
.tmsc-section-title {
    color: var(--tmu-text-faint); font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; padding-bottom: var(--tmu-space-sm); border-bottom: 1px solid var(--tmu-border-soft); margin-bottom: var(--tmu-space-sm);
}
.tmsc-bar-row { display: flex; align-items: center; gap: var(--tmu-space-md); padding: var(--tmu-space-xs) 0; }
.tmsc-bar-label { color: var(--tmu-text-panel-label); font-size: 11px; font-weight: 600; width: 100px; flex-shrink: 0; }
.tmsc-bar-track {
    flex: 1; height: 6px; background: var(--tmu-success-fill); border-radius: var(--tmu-space-xs);
    overflow: hidden; max-width: 120px; position: relative;
}
.tmsc-bar-fill { height: 100%; border-radius: var(--tmu-space-xs); transition: width 0.3s; }
.tmsc-bar-fill-reach {
    position: absolute; top: 0; left: 0; height: 100%;
    border-radius: var(--tmu-space-xs); transition: width 0.3s;
}
.tmsc-bar-text { font-size: 11px; font-weight: 600; min-width: 60px; }
.tmsc-league-cell { white-space: nowrap; font-size: 11px; }
.tmsc-league-cell a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmsc-league-cell a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmsc-club-cell a { color: var(--tmu-accent); text-decoration: none; font-weight: 600; }
.tmsc-club-cell a:hover { color: var(--tmu-text-main); text-decoration: underline; }
.tmsc-online { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-left: var(--tmu-space-xs); vertical-align: middle; }
.tmsc-online.on { background: var(--tmu-success); box-shadow: 0 0 4px var(--tmu-success-fill-strong); }
.tmsc-online.off { background: var(--tmu-text-disabled-strong); }
.tmsc-error {
    text-align: center; color: var(--tmu-danger); padding: var(--tmu-space-md); font-size: 12px; font-weight: 600;
    background: var(--tmu-danger-fill); border: 1px solid var(--tmu-border-danger);
    border-radius: var(--tmu-space-xs); margin-bottom: var(--tmu-space-md);
}
.tmsc-report-divider { border: none; border-top: 1px dashed var(--tmu-border-embedded); margin: var(--tmu-space-lg) 0; }
.tmsc-report-count {
    color: var(--tmu-text-faint); font-size: 10px; text-align: center; padding: var(--tmu-space-xs) 0;
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
    background: var(--tmu-surface-tab-active); border: 1px solid var(--tmu-border-soft);
    border-radius: var(--tmu-space-sm); padding: var(--tmu-space-md); margin-bottom: var(--tmu-space-sm);
}
.tmsc-best-title {
    color: var(--tmu-success); font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; margin-bottom: var(--tmu-space-md); display: flex; align-items: center; gap: var(--tmu-space-sm);
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

    /* ── helpers ── */
    const fixFlags = (html) => html ? html.replace(/class='flag-img-([^']+)'/g, "class='flag-img-$1 tmsq-flag'").replace(/class="flag-img-([^"]+)"/g, 'class="flag-img-$1 tmsq-flag"') : '';
    const cashColor = (c) => { if (!c) return 'var(--tmu-text-strong)'; if (c.includes('Astonishingly')) return 'var(--tmu-success)'; if (c.includes('Incredibly')) return 'var(--tmu-accent)'; if (c.includes('Very rich')) return 'var(--tmu-accent)'; if (c.includes('Rich')) return 'var(--tmu-text-strong)'; if (c.includes('Terrible')) return 'var(--tmu-danger)'; if (c.includes('Poor')) return 'var(--tmu-warning)'; return 'var(--tmu-text-strong)'; };
    const onlineDot = (on) => `<span class="tmsc-online ${on ? 'on' : 'off'}"></span>`;
    const setContent = (el, content) => {
        if (!el) return;
        el.innerHTML = '';
        if (content instanceof Node) el.appendChild(content);
        else el.innerHTML = content;
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
        if (!_root || _root.dataset.tmscSendBound === '1') return;

        _root.dataset.tmscSendBound = '1';
        _root.addEventListener('click', (event) => {
            const btn = event.target.closest('.tmsc-send-btn');
            if (!btn || !_root.contains(btn) || btn.classList.contains('tmsc-away') || btn.disabled) return;

            const scoutId = btn.dataset.scoutId;
            btn.disabled = true;
            btn.textContent = '...';
            TmPlayerService.fetchPlayerInfo(_playerId, 'scout', { scout_id: scoutId }).then(d => {
                if (!d) {
                    btn.textContent = 'Error';
                    btn.style.color = 'var(--tmu-danger)';
                    setTimeout(() => {
                        btn.textContent = 'Send';
                        btn.disabled = false;
                        btn.style.color = '';
                    }, 2000);
                    return;
                }
                if (d.scouts || d.reports) {
                    render(_containerRef, d, { playerId: _playerId });
                    return;
                }
                btn.textContent = 'Sent';
                btn.style.background = 'var(--tmu-surface-tab-hover)';
                btn.style.color = 'var(--tmu-success)';
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
