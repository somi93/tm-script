import { TmUI } from '../shared/tm-ui.js';
import { TmMatchAccordion } from './tm-match-accordion.js';

const badgeHtml = (opts, tone = 'muted') => TmUI.badge({ size: 'md', shape: 'rounded', weight: 'bold', ...opts }, tone);

// ── Build HTML for a single report event accordion ───────────────────────
const _buildEventHtml = (play, min, liveState) => {
    if (!play || !play.segments) return '';

    const evtIdx = play.reportEvtIdx;
    const homeId = String(liveState.mData.teams.home.id);
    const isHome = String(play.team) === homeId;
    const isNeutral = !play.team || String(play.team) === '0';

    // Actions for this specific play (same minute + reportEvtIdx)
    const acts = (liveState.mData.actions || []).filter(a => a.min === min && a.evtIdx === evtIdx);

    // ── Header badges ─────────────────────────────────────────────────────
    let headerBadges = '';
    let hasEvents = false;
    let hasGoal = false;

    const goalAct = acts.find(a => a.action === 'shot' && a.goal);
    if (goalAct) {
        hasEvents = true;
        hasGoal = true;
        const score = goalAct.score ? goalAct.score.join('-') : '';
        const assistAct = acts.find(a => a.action === 'assist');
        let b = `⚽ ${goalAct.player}`;
        if (score) b += ` (${score})`;
        if (assistAct?.player) b += ` <span style="font-size:11px;color:#90b878">ast. ${assistAct.player}</span>`;
        headerBadges += badgeHtml({ slot: b }, 'success');
    }
    const yellowAct = acts.find(a => a.action === 'yellow');
    if (yellowAct) { hasEvents = true; headerBadges += badgeHtml({ icon: '🟨', label: yellowAct.player }, 'highlight'); }
    const yellowRedAct = acts.find(a => a.action === 'yellowRed');
    if (yellowRedAct) { hasEvents = true; headerBadges += badgeHtml({ icon: '🟥🟨', label: yellowRedAct.player }, 'danger'); }
    const redAct = acts.find(a => a.action === 'red');
    if (redAct) { hasEvents = true; headerBadges += badgeHtml({ icon: '🟥', label: redAct.player }, 'danger'); }
    const injAct = acts.find(a => a.action === 'injury');
    if (injAct) {
        hasEvents = true;
        headerBadges += badgeHtml({ icon: '<span style="color:#ff3c3c;font-weight:800">✚</span>', label: injAct.player }, 'warn');
    }
    const subInActs = acts.filter(a => a.action === 'subIn');
    const subOutActs = acts.filter(a => a.action === 'subOut');
    subInActs.forEach((subIn, i) => {
        hasEvents = true;
        const subOut = subOutActs[i];
        headerBadges += badgeHtml({ icon: '🔄', label: `↑${subIn.player} ↓${subOut?.player ?? '?'}` }, 'info');
    });

    // ── Body lines ────────────────────────────────────────────────────────
    const lines = [];
    play.segments.forEach(seg => {
        (seg.text || []).forEach(line => {
            if (!line || !line.trim()) return;
            line = line.replace(/\[goal\]/g, '<span class="rnd-goal-text">⚽ </span>');
            line = line.replace(/\[yellow\]/g, '<span class="rnd-yellow-text">🟨 </span>');
            line = line.replace(/\[red\]/g, '<span class="rnd-red-text">🟥 </span>');
            line = line.replace(/\[sub\]/g, '<span class="rnd-sub-text">🔄 </span>');
            line = line.replace(/\[assist\]/g, '');
            lines.push(line);
        });
    });

    const goalCls = hasGoal ? ' rnd-acc-goal' : '';
    const chevron = '<svg class="rnd-acc-chevron" viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>';
    let headerContent = headerBadges;
    if (!hasEvents) {
        const preview = lines.length ? lines[0] : '';
        headerContent = `<span style="color:#90b878;font-size:12px">${preview}</span>`;
    }

    const totalLines = lines.length || 1;
    let html = `<div class="rnd-acc" data-acc="${min}-${evtIdx}" data-line-count="${totalLines}">`;
    html += `<div class="rnd-acc-head${goalCls}">`;
    html += `<div class="rnd-acc-home">${isHome ? headerContent : ''}</div>`;
    html += `<div class="rnd-acc-min">${min}'</div>`;
    html += `<div class="rnd-acc-away">${!isHome && !isNeutral ? headerContent : (isNeutral ? headerContent : '')}</div>`;
    html += chevron;
    html += `</div>`;
    html += `<div class="rnd-acc-body"><div class="rnd-report-text">${lines.join('<br>')}</div></div>`;
    html += `</div>`;
    return html;
};

export const TmMatchReport = {
    /**
     * Build HTML for a single report event accordion.
     * @param {object} play  — normalized play with .segments, .team, .reportEvtIdx
     * @param {number} min
     * @param {object} playerNames
     * @param {string} homeId
     * @returns {string}
     */
    buildEventHtml: _buildEventHtml,

    /**
     * Full render of the Report tab.
     * Reads visiblePlays from mData (already computed by deriveMatchData).
     * @param {jQuery} body
     * @param {object} mData
     */
    render(body, liveState) {
        const visiblePlays = liveState.mData.visiblePlays || {};

        let html = '<div style="max-width:900px;margin:0 auto"><div id="rnd-report-timeline" class="rnd-timeline">';
        Object.keys(visiblePlays).map(Number).sort((a, b) => a - b).forEach(min => {
            (visiblePlays[String(min)] || []).forEach(play => {
                html += _buildEventHtml(play, min, liveState);
            });
        });
        html += '</div></div>';
        body.html(html);

        TmMatchAccordion.bindToggles(body);
    },
};
