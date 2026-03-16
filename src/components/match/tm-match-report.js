import { TmMatchUtils } from '../../utils/match.js';

// ── Resolve [player=ID] tags to display names ─────────────────────────────
const _resolvePlayerTags = (text, playerNames) => {
    return text.replace(/\[player=(\d+)\]/g, (_, id) => {
        const name = playerNames[id] || id;
        return `<span class="rnd-player-name">${name}</span>`;
    });
};

// ── Build HTML for a single report event accordion ───────────────────────
const _buildEventHtml = (play, min, playerNames, homeId) => {
    if (!play || !play.segments) return '';

    const evtIdx = play.reportEvtIdx;
    const acts = play.segments.flatMap(s => s.actions);
    const evtClub = String(play.team || 0);
    const isHome = evtClub === homeId;
    const isNeutral = !play.team || evtClub === '0';

    // ── Header badges ─────────────────────────────────────────────────────
    let headerBadges = '';
    let hasEvents = false;

    const goalAct = acts.find(a => a.action === 'shot' && a.goal);
    if (goalAct) {
        hasEvents = true;
        const scorer = playerNames[goalAct.by] || '?';
        const score = goalAct.score ? goalAct.score.join('-') : '';
        const assistAct = acts.find(a => a.action === 'assist');
        let b = `⚽ ${scorer}`;
        if (score) b += ` (${score})`;
        if (assistAct?.by) b += ` <span style="font-size:11px;color:#90b878">ast. ${playerNames[assistAct.by] || '?'}</span>`;
        headerBadges += `<div class="rnd-report-evt-badge evt-goal">${b}</div>`;
    }
    const yellowAct = acts.find(a => a.action === 'yellow');
    if (yellowAct) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-yellow">🟨 ${playerNames[yellowAct.by] || '?'}</div>`; }
    const yellowRedAct = acts.find(a => a.action === 'yellowRed');
    if (yellowRedAct) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-red">🟥🟨 ${playerNames[yellowRedAct.by] || '?'}</div>`; }
    const redAct = acts.find(a => a.action === 'red');
    if (redAct) { hasEvents = true; headerBadges += `<div class="rnd-report-evt-badge evt-red">🟥 ${playerNames[redAct.by] || '?'}</div>`; }
    const injAct = acts.find(a => a.action === 'injury');
    if (injAct) {
        hasEvents = true;
        headerBadges += `<div class="rnd-report-evt-badge evt-injury"><span style="color:#ff3c3c;font-weight:800">✚</span> ${playerNames[injAct.by] || '?'}</div>`;
    }
    const subInAct = acts.find(a => a.action === 'subIn');
    const subOutAct = acts.find(a => a.action === 'subOut');
    if (subInAct && subOutAct) {
        hasEvents = true;
        headerBadges += `<div class="rnd-report-evt-badge evt-sub">🔄 ↑${playerNames[subInAct.by] || '?'} ↓${playerNames[subOutAct.by] || '?'}</div>`;
    }

    // ── Body lines ────────────────────────────────────────────────────────
    const lines = [];
    play.segments.forEach(seg => {
        (seg.text || []).forEach(line => {
            if (!line || !line.trim()) return;
            let resolved = _resolvePlayerTags(line, playerNames);
            resolved = resolved.replace(/\[goal\]/g, '<span class="rnd-goal-text">⚽ ');
            resolved = resolved.replace(/\[yellow\]/g, '<span class="rnd-yellow-text">🟨 ');
            resolved = resolved.replace(/\[red\]/g, '<span class="rnd-red-text">🟥 ');
            resolved = resolved.replace(/\[sub\]/g, '<span class="rnd-sub-text">🔄 ');
            resolved = resolved.replace(/\[assist\]/g, '');
            const openTags = (resolved.match(/<span class="rnd-(goal|yellow|red|sub)-text">/g) || []).length;
            for (let t = 0; t < openTags; t++) resolved += '</span>';
            lines.push(resolved);
        });
    });

    const goalCls = headerBadges.includes('evt-goal') ? ' rnd-acc-goal' : '';
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
    render(body, mData) {
        const playerNames = TmMatchUtils.buildPlayerNames(mData);
        const homeId = String(mData.teams.home.id);
        const visiblePlays = mData.visiblePlays || {};

        let html = '<div style="max-width:900px;margin:0 auto"><div id="rnd-report-timeline" class="rnd-timeline">';
        Object.keys(visiblePlays).map(Number).sort((a, b) => a - b).forEach(min => {
            (visiblePlays[String(min)] || []).forEach(play => {
                html += _buildEventHtml(play, min, play.reportEvtIdx, playerNames, homeId);
            });
        });
        html += '</div></div>';
        body.html(html);

        body.off('click.rndacc').on('click.rndacc', '.rnd-acc-head', function () {
            $(this).closest('.rnd-acc').toggleClass('open');
        });
    },

    /**
     * Incremental update during live replay.
     * Appends new accordions and updates existing ones whose line count grew.
     * Falls back to full render if the timeline container is not in the DOM.
     * @param {object} liveState
     * @param {function} renderFallback — () => void, called when container is missing
     */
    update(liveState, renderFallback) {
        const container = $('#rnd-report-timeline');
        if (!container.length) {
            renderFallback();
            return;
        }

        const visiblePlays = liveState.mData.visiblePlays || {};
        const playerNames = TmMatchUtils.buildPlayerNames(liveState.mData);
        const homeId = String(liveState.mData.teams.home.id);

        Object.keys(visiblePlays).map(Number).sort((a, b) => a - b).forEach(min => {
            (visiblePlays[String(min)] || []).forEach(play => {
                const evtIdx = play.reportEvtIdx;
                const key = `${min}-${evtIdx}`;
                const existing = container.find(`[data-acc="${key}"]`);
                const lineCount = play.segments.reduce((s, seg) =>
                    s + seg.text.filter(l => l && l.trim()).length, 0);

                if (existing.length) {
                    const oldCount = Number(existing.attr('data-line-count') || 0);
                    if (oldCount >= lineCount) return;
                    const newHtml = _buildEventHtml(play, min, evtIdx, playerNames, homeId);
                    if (!newHtml) return;
                    const wasOpen = existing.hasClass('open');
                    const $new = $(newHtml);
                    if (wasOpen) $new.addClass('open');
                    existing.replaceWith($new);
                } else {
                    container.find('.rnd-acc.open').removeClass('open');
                    const evtHtml = _buildEventHtml(play, min, evtIdx, playerNames, homeId);
                    if (!evtHtml) return;
                    container.append($(evtHtml).addClass('rnd-live-feed-line open'));
                }
            });
        });

        const dlgBody = $('#rnd-dlg-body');
        dlgBody.animate({ scrollTop: dlgBody[0].scrollHeight }, 300);
    },
};
