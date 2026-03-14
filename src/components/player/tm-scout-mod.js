import { TmApi } from '../../lib/tm-services.js';
import { TmUI } from '../shared/tm-ui.js';

const CSS = `
/* ═══════════════════════════════════════
   SCOUT (tmsc-*)
   ═══════════════════════════════════════ */
#tmsc-root {
    display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; line-height: 1.4;
}
.tmsc-wrap {
    background: transparent; border-radius: 0; border: none; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: #c8e0b4; font-size: 13px;
}
.tmsc-tabs { display: flex; gap: 6px; padding: 10px 14px 6px; flex-wrap: wrap; }
.tmsc-tab {
    padding: 4px 12px; font-size: 11px; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.4px; color: #90b878; cursor: pointer;
    border-radius: 4px; background: rgba(42,74,28,.3); border: 1px solid rgba(42,74,28,.6);
    transition: all 0.15s; font-family: inherit; -webkit-appearance: none; appearance: none;
}
.tmsc-tab:hover { color: #c8e0b4; background: rgba(42,74,28,.5); border-color: #3d6828; }
.tmsc-tab.active { color: #e8f5d8; background: #305820; border-color: #3d6828; }
.tmsc-body { padding: 6px 14px 16px; font-size: 13px; min-height: 120px; }
.tmsc-tbl { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 4px; }
.tmsc-tbl th {
    padding: 6px; font-size: 10px; font-weight: 700; color: #6a9a58;
    text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #2a4a1c;
    text-align: left; white-space: nowrap;
}
.tmsc-tbl th.c { text-align: center; }
.tmsc-tbl td {
    padding: 5px 6px; border-bottom: 1px solid rgba(42,74,28,.4);
    color: #c8e0b4; font-variant-numeric: tabular-nums; vertical-align: middle;
}
.tmsc-tbl td.c { text-align: center; }
.tmsc-tbl tr:hover { background: rgba(255,255,255,.03); }
.tmsc-tbl a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-tbl a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-empty { text-align: center; color: #5a7a48; padding: 40px; font-size: 13px; font-style: italic; }
.tmsc-stars { font-size: 20px; letter-spacing: 2px; line-height: 1; }
.tmsc-star-full { color: #fbbf24; }
.tmsc-star-half {
    background: linear-gradient(90deg, #fbbf24 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-empty { color: #3d6828; }
.tmsc-report { display: flex; flex-direction: column; gap: 14px; }
.tmsc-report-header { padding-bottom: 10px; border-bottom: 1px solid #2a4a1c; }
.tmsc-report-scout { color: #e8f5d8; font-weight: 700; font-size: 14px; margin-bottom: 4px; }
.tmsc-report-date {
    color: #6a9a58; font-size: 11px; font-weight: 600;
    background: rgba(42,74,28,.4); padding: 3px 10px; border-radius: 4px; white-space: nowrap;
}
.tmsc-report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.tmsc-report-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 5px 10px; background: rgba(42,74,28,.25); border-radius: 4px;
    border: 1px solid rgba(42,74,28,.4);
}
.tmsc-report-label { color: #6a9a58; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
.tmsc-report-value { color: #e8f5d8; font-weight: 700; font-size: 12px; }
.tmsc-report-item.wide { grid-column: 1 / -1; }
.tmsc-section-title {
    color: #6a9a58; font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.6px; padding-bottom: 6px; border-bottom: 1px solid #2a4a1c; margin-bottom: 8px;
}
.tmsc-bar-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
.tmsc-bar-label { color: #90b878; font-size: 11px; font-weight: 600; width: 100px; flex-shrink: 0; }
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
.tmsc-league-cell a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-league-cell a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-club-cell a { color: #80e048; text-decoration: none; font-weight: 600; }
.tmsc-club-cell a:hover { color: #c8e0b4; text-decoration: underline; }
.tmsc-send-btn { text-transform: uppercase; letter-spacing: 0.4px; padding: 4px 14px; }
.tmsc-send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.tmu-btn.tmsc-away { background: transparent; border-color: rgba(61,104,40,.4); color: #5a7a48; font-size: 9px; pointer-events: none; }
.tmsc-online { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-left: 4px; vertical-align: middle; }
.tmsc-online.on { background: #6cc040; box-shadow: 0 0 4px rgba(108,192,64,.5); }
.tmsc-online.off { background: #3d3d3d; }
.tmsc-yd-badge {
    display: inline-block; background: #274a18; color: #6cc040; font-size: 9px;
    font-weight: 700; padding: 1px 6px; border-radius: 3px; border: 1px solid #3d6828;
    margin-left: 6px; letter-spacing: 0.5px; vertical-align: middle;
}
.tmsc-error {
    text-align: center; color: #f87171; padding: 10px; font-size: 12px; font-weight: 600;
    background: rgba(248,113,113,.06); border: 1px solid rgba(248,113,113,.15);
    border-radius: 4px; margin-bottom: 10px;
}
.tmsc-report-divider { border: none; border-top: 1px dashed #3d6828; margin: 16px 0; }
.tmsc-report-count {
    color: #6a9a58; font-size: 10px; text-align: center; padding: 4px 0;
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
}
.tmsc-star-green { color: #6cc040; }
.tmsc-star-green-half {
    background: linear-gradient(90deg, #6cc040 50%, #3d6828 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-star-split {
    background: linear-gradient(90deg, #fbbf24 50%, #6cc040 50%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.tmsc-conf {
    display: inline-block; font-size: 9px; font-weight: 700; padding: 1px 5px;
    border-radius: 3px; margin-left: 6px; letter-spacing: 0.3px;
    vertical-align: middle; white-space: nowrap;
}
.tmsc-best-wrap {
    background: rgba(42,74,28,.3); border: 1px solid #2a4a1c;
    border-radius: 6px; padding: 12px; margin-bottom: 6px;
}
.tmsc-best-title {
    color: #6cc040; font-size: 10px; font-weight: 700; text-transform: uppercase;
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
    const skillColor = (v) => { v = parseInt(v); if (v >= 19) return '#6cc040'; if (v >= 16) return '#80e048'; if (v >= 13) return '#c8e0b4'; if (v >= 10) return '#fbbf24'; if (v >= 7) return '#f97316'; return '#f87171'; };
    const potColor = (pot) => { pot = parseInt(pot); if (pot >= 18) return '#6cc040'; if (pot >= 15) return '#5b9bff'; if (pot >= 12) return '#c8e0b4'; if (pot >= 9) return '#fbbf24'; return '#f87171'; };
    const extractTier = (txt) => { if (!txt) return null; const m = txt.match(/\((\d)\/(\d)\)/); return m ? { val: parseInt(m[1]), max: parseInt(m[2]) } : null; };
    const barColor = (val, max) => { const r = val / max; if (r >= 0.75) return '#6cc040'; if (r >= 0.5) return '#80e048'; if (r >= 0.25) return '#fbbf24'; return '#f87171'; };
    const fixFlags = (html) => html ? html.replace(/class='flag-img-([^']+)'/g, "class='flag-img-$1 tmsq-flag'").replace(/class="flag-img-([^"]+)"/g, 'class="flag-img-$1 tmsq-flag"') : '';
    const bloomColor = (txt) => { if (!txt) return '#c8e0b4'; const t = txt.toLowerCase(); if (t === 'bloomed') return '#6cc040'; if (t.includes('late bloom')) return '#80e048'; if (t.includes('middle')) return '#fbbf24'; if (t.includes('starting')) return '#f97316'; if (t.includes('not bloomed')) return '#f87171'; return '#c8e0b4'; };
    const cashColor = (c) => { if (!c) return '#c8e0b4'; if (c.includes('Astonishingly')) return '#6cc040'; if (c.includes('Incredibly')) return '#80e048'; if (c.includes('Very rich')) return '#a0d880'; if (c.includes('Rich')) return '#c8e0b4'; if (c.includes('Terrible')) return '#f87171'; if (c.includes('Poor')) return '#f97316'; return '#c8e0b4'; };
    const cleanPeakText = (txt) => txt ? txt.replace(/^\s*-\s*/, '').replace(/\s*(physique|tactical ability|technical ability)\s*$/i, '').trim() : '';
    const confPct = (skill) => Math.round((parseInt(skill) || 0) / 20 * 100);
    const confBadge = (pct) => { const c = pct >= 90 ? '#6cc040' : pct >= 70 ? '#80e048' : pct >= 50 ? '#fbbf24' : '#f87171'; const bg = pct >= 90 ? 'rgba(108,192,64,.12)' : pct >= 70 ? 'rgba(128,224,72,.1)' : pct >= 50 ? 'rgba(251,191,36,.1)' : 'rgba(248,113,113,.1)'; return `<span class="tmsc-conf" style="color:${c};background:${bg}">${pct}%</span>`; };
    const onlineDot = (on) => `<span class="tmsc-online ${on ? 'on' : 'off'}"></span>`;
    const getScoutForReport = (r) => { if (!_scoutData || !_scoutData.scouts || !r.scoutid) return null; return Object.values(_scoutData.scouts).find(s => String(s.id) === String(r.scoutid)) || null; };

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
        if (!scouts || !Object.keys(scouts).length) return '<div class="tmsc-empty">No scouts hired</div>';
        const skills = ['seniors', 'youths', 'physical', 'tactical', 'technical', 'development', 'psychology'];
        let rows = '';
        for (const s of Object.values(scouts)) {
            let sc = ''; for (const sk of skills) { const v = parseInt(s[sk]) || 0; sc += `<td class="c font-semibold" style="color:${skillColor(v)}">${v}</td>`; }
            const bc = s.away ? 'tmsc-send-btn tmsc-away' : 'tmsc-send-btn';
            const bl = s.away ? (s.returns || 'Away') : 'Send';
            rows += `<tr><td class="font-semibold" style="color:#e8f5d8;white-space:nowrap">${s.name} ${s.surname}</td>${sc}<td class="c"><tm-button data-variant="secondary" data-size="xs" data-cls="${bc}" data-scout-id="${s.id}" ${s.away ? 'title="' + (s.returns || '') + '"' : ''}>${bl}</tm-button></td></tr>`;
        }
        return `<table class="tmsc-tbl"><thead><tr><th>Name</th><th class="c">Sen</th><th class="c">Yth</th><th class="c">Phy</th><th class="c">Tac</th><th class="c">Tec</th><th class="c">Dev</th><th class="c">Psy</th><th class="c"></th></tr></thead><tbody>${rows}</tbody></table>`;
    };

    const buildReportCard = (r) => {
        const pot = parseInt(r.old_pot) || 0;
        const potStarsVal = (parseFloat(r.potential) || 0) / 2;
        if (r.scout_name === 'YD' || r.scoutid === '0') {
            return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${greenStarsHtml(potStarsVal)}</div><div class="tmsc-report-scout">Youth Development<span class="tmsc-yd-badge">YD</span></div></div><div class="tmsc-report-date">${r.done || '-'}</div></tm-row><div class="tmsc-report-grid"><div class="tmsc-report-item wide"><span class="tmsc-report-label">Potential</span><span class="tmsc-report-value" style="color:${potColor(pot)}">${pot}</span></div><div class="tmsc-report-item wide"><span class="tmsc-report-label">Age at report</span><span class="tmsc-report-value">${r.report_age || '-'}</span></div></div></div>`;
        }
        const spec = parseInt(r.specialist) || 0; const specLabel = SPECIALTIES[spec] || 'None';
        const scout = getScoutForReport(r);
        let potConf = null, bloomConf = null, phyConf = null, tacConf = null, tecConf = null, psyConf = null, specConf = null;
        if (scout) { const age = parseInt(r.report_age) || 0; const senYth = age < 20 ? (parseInt(scout.youths) || 0) : (parseInt(scout.seniors) || 0); const dev = parseInt(scout.development) || 0; potConf = confPct(Math.min(senYth, dev)); bloomConf = confPct(dev); phyConf = confPct(parseInt(scout.physical) || 0); tacConf = confPct(parseInt(scout.tactical) || 0); tecConf = confPct(parseInt(scout.technical) || 0); psyConf = confPct(parseInt(scout.psychology) || 0); if (spec > 0) { const phyS = [1, 2, 3, 11]; const tacS = [4, 5, 6, 7]; if (phyS.includes(spec)) specConf = phyConf; else if (tacS.includes(spec)) specConf = tacConf; else specConf = tecConf; } }
        const peaks = [{ label: 'Physique', text: cleanPeakText(r.peak_phy_txt), conf: phyConf }, { label: 'Tactical', text: cleanPeakText(r.peak_tac_txt), conf: tacConf }, { label: 'Technical', text: cleanPeakText(r.peak_tec_txt), conf: tecConf }];
        let peaksH = '';
        for (const p of peaks) { const tier = extractTier(p.text); if (tier) { const pct = (tier.val / tier.max) * 100; const c = barColor(tier.val, tier.max); peaksH += `<div class="tmsc-bar-row"><span class="tmsc-bar-label">${p.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${c}"></div></div><span class="tmsc-bar-text" style="color:${c}">${tier.val}/${tier.max}</span>${p.conf !== null ? confBadge(p.conf) : ''}</div>`; } }
        const charisma = parseInt(r.charisma) || 0; const professionalism = parseInt(r.professionalism) || 0; const aggression = parseInt(r.aggression) || 0;
        const pers = [{ label: 'Leadership', value: charisma }, { label: 'Professionalism', value: professionalism }, { label: 'Aggression', value: aggression }];
        let persH = '';
        for (const p of pers) { const pct = (p.value / 20) * 100; const c = skillColor(p.value); persH += `<div class="tmsc-bar-row"><span class="tmsc-bar-label">${p.label}</span><div class="tmsc-bar-track"><div class="tmsc-bar-fill" style="width:${pct}%;background:${c}"></div></div><span class="tmsc-bar-text" style="color:${c}">${p.value}</span>${psyConf !== null ? confBadge(psyConf) : ''}</div>`; }
        return `<div class="tmsc-report"><tm-row data-justify="space-between" data-align="flex-start" data-cls="tmsc-report-header"><div><div class="tmsc-stars">${combinedStarsHtml(r.rec, potStarsVal)}</div><div class="tmsc-report-scout">${r.scout_name || 'Unknown'}</div></div><div class="tmsc-report-date">${r.done || '-'}</div></tm-row><div class="tmsc-report-grid"><div class="tmsc-report-item"><span class="tmsc-report-label">Potential</span><span class="tmsc-report-value" style="color:${potColor(pot)}">${pot}${potConf !== null ? confBadge(potConf) : ''}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Age</span><span class="tmsc-report-value">${r.report_age || '-'}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Bloom</span><span class="tmsc-report-value" style="color:${bloomColor(r.bloom_status_txt)}">${r.bloom_status_txt || '-'}${bloomConf !== null ? confBadge(bloomConf) : ''}</span></div><div class="tmsc-report-item"><span class="tmsc-report-label">Development</span><span class="tmsc-report-value">${r.dev_status || '-'}${bloomConf !== null ? confBadge(bloomConf) : ''}</span></div><div class="tmsc-report-item wide"><span class="tmsc-report-label">Specialty</span><span class="tmsc-report-value" style="color:${spec > 0 ? '#fbbf24' : '#5a7a48'}">${specLabel}${specConf !== null ? confBadge(specConf) : ''}</span></div></div><div><div class="tmsc-section-title">Peak Development</div>${peaksH}</div><div><div class="tmsc-section-title">Personality</div>${persH}</div></div>`;
    };

    const buildReport = (reports, error) => {
        let h = '';
        if (error) { const msg = error === 'multi_scout' ? 'This scout is already on a mission' : error === 'multi_bid' ? 'Scout already scouting this player' : error; h += `<div class="tmsc-error">${msg}</div>`; }
        if (!reports || !reports.length) return h + '<div class="tmsc-empty">No scout reports available</div>';
        if (reports.length > 1) h += `<div class="tmsc-report-count">${reports.length} Reports</div>`;
        for (let i = 0; i < reports.length; i++) { if (i > 0) h += '<hr class="tmsc-report-divider">'; h += buildReportCard(reports[i]); }
        return h;
    };

    const buildInterested = (interested) => {
        if (!interested || !interested.length) return '<div class="tmsc-empty">No interested clubs</div>';
        let rows = '';
        for (const c of interested) { const ch = fixFlags(c.club_link || ''); const lh = fixFlags(c.league_link || ''); const cc = cashColor(c.cash); rows += `<tr><td class="tmsc-club-cell">${ch} ${onlineDot(c.online)}</td><td class="tmsc-league-cell">${lh}</td><td style="color:${cc};font-weight:600;font-size:11px">${c.cash}</td></tr>`; }
        return `<table class="tmsc-tbl"><thead><tr><th>Club</th><th>League</th><th>Financial</th></tr></thead><tbody>${rows}</tbody></table>`;
    };

    const getContent = (tab) => {
        switch (tab) {
            case 'report': return buildReport(_scoutData.reports, _scoutData.error);
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
                TmApi.fetchPlayerInfo(_playerId, 'scout', { scout_id: scoutId }).then(d => {
                    if (!d) { btn.textContent = 'Error'; btn.style.color = '#f87171'; setTimeout(() => { btn.textContent = 'Send'; btn.disabled = false; btn.style.color = ''; }, 2000); return; }
                    if (d.scouts || d.reports) { render(_containerRef, d, { playerId: _playerId }); }
                    else { btn.textContent = 'Sent'; btn.style.background = '#274a18'; btn.style.color = '#6cc040'; }
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
            onChange: (key) => {
                _activeTab = key;
                const c = q('#tmsc-tab-content'); if (!c) return;
                c.innerHTML = getContent(key);
                TmUI?.render(c);
                if (key === 'scouts') bindSendButtons();
            },
        });
        tabsEl.className = 'tmsc-tabs';
        _root.innerHTML = '<div class="tmsc-wrap"></div>';
        const scWrap = _root.querySelector('.tmsc-wrap');
        scWrap.appendChild(tabsEl);
        const bodyEl = document.createElement('div');
        bodyEl.className = 'tmsc-body';
        bodyEl.id = 'tmsc-tab-content';
        bodyEl.innerHTML = getContent(_activeTab);
        scWrap.appendChild(bodyEl);
        TmUI?.render(_root);
        bindSendButtons();
    };

    /**
     * reRender()  — re-renders with stored data.
     */
    const reRender = () => { if (_containerRef && _scoutData) render(_containerRef, _scoutData); };

    export const TmScoutMod = { render, reRender };
